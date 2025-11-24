import { auth, db } from '../firebase/firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, setDoc, addDoc, updateDoc, deleteDoc, orderBy, limit } from 'firebase/firestore';

// Helper to normalize CNPJ (only digits)
function normalizeCnpj(cnpj) {
  const normalized = (cnpj || '').replace(/\D/g, '');
  return normalized.length >= 8 ? normalized : null; // CNPJ deve ter no mínimo 8 dígitos
}

// Construct a synthetic email for Firebase Auth using username + cnpj
function makeEmail(cnpj, usuario) {
  const c = normalizeCnpj(cnpj);
  const u = (usuario || '').replace(/[^a-zA-Z0-9._-]/g, '').toLowerCase();
  return `${u}@${c}.local`;
}

export async function identifyCnpj(cnpj) {
  const id = normalizeCnpj(cnpj);
  if (!id) return { exists: false };
  const ref = doc(db, 'companies', id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return { exists: false };
  return { exists: true, company: snap.data() };
}

export async function checkUser(cnpj, usuario) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) return { exists: false };
  const usersRef = collection(db, 'companies', companyId, 'users');
  const q = query(usersRef, where('username', '==', usuario));
  const snap = await getDocs(q);
  return { exists: !snap.empty, user: snap.empty ? null : snap.docs[0].data() };
}

export async function login({ cnpj, usuario, senha }) {
  const email = makeEmail(cnpj, usuario);
  try {
    const res = await signInWithEmailAndPassword(auth, email, senha);
    const token = await res.user.getIdToken();
    // fetch user profile from firestore
    const companyId = normalizeCnpj(cnpj);
    if (!companyId) throw new Error('CNPJ inválido: informe o CNPJ da empresa antes de efetuar o login.');
    const usersRef = collection(db, 'companies', companyId, 'users');
    const q = query(usersRef, where('username', '==', usuario));
    const snap = await getDocs(q);
    const user = snap.empty ? null : snap.docs[0].data();
    return { token, userName: (user && user.displayName) || usuario, company: { cnpj: companyId } };
  } catch (err) {
    // If Email/Password provider is not enabled, fall back to Firestore-stored credentials (development fallback).
    if (err && err.code === 'auth/operation-not-allowed') {
      // Try to authenticate against users stored in Firestore (password field stored only in fallback mode)
      const companyId = normalizeCnpj(cnpj);
      if (!companyId) throw new Error('CNPJ inválido: informe o CNPJ da empresa antes de efetuar o login.');
      const usersRef = collection(db, 'companies', companyId, 'users');
      const q = query(usersRef, where('username', '==', usuario));
      const snap = await getDocs(q);
      if (snap.empty) throw new Error('Usuário não encontrado');
      const docData = snap.docs[0].data();
      // WARNING: This fallback compares plaintext passwords stored in Firestore — only for local/dev use.
      if (docData.password && docData.password === senha) {
        const fakeToken = 'firestore-token-' + (docData.uid || snap.docs[0].id);
        return { token: fakeToken, userName: docData.displayName || usuario, company: { cnpj: companyId } };
      }
      throw new Error('Senha inválida (fallback)');
    }
    throw err;
  }
}

export async function registerUser({ cnpj, usuario, senha, displayName, role = 'user', active = true, email, phone, address, addressNumber }) {
  const authEmail = email || makeEmail(cnpj, usuario);
  try {
    const res = await createUserWithEmailAndPassword(auth, authEmail, senha);
    const uid = res.user.uid;
    // store profile in companies/{cnpj}/users collection
    const companyId = normalizeCnpj(cnpj);
    if (!companyId) throw new Error('CNPJ inválido: informe o CNPJ da empresa ao cadastrar o usuário.');
    const usersRef = collection(db, 'companies', companyId, 'users');
    await addDoc(usersRef, {
      uid,
      username: usuario,
      displayName: displayName || usuario,
      role,
      active: !!active,
      email: email || authEmail || null,
      phone: phone || null,
      address: address || null,
      addressNumber: addressNumber || null,
      createdAt: new Date().toISOString()
    });
    return { uid };
  } catch (err) {
    // If Email/Password provider is disabled, create a Firestore-only user as a fallback (development only).
    if (err && err.code === 'auth/operation-not-allowed') {
      const companyId = normalizeCnpj(cnpj);
      if (!companyId) throw new Error('CNPJ inválido: informe o CNPJ da empresa ao cadastrar o usuário (fallback).');
      const usersRef = collection(db, 'companies', companyId, 'users');
      const docRef = await addDoc(usersRef, {
        // note: no uid from Auth available in fallback
        username: usuario,
        displayName: displayName || usuario,
        role,
        active: !!active,
        // store plaintext password only as a dev fallback — DO NOT use in production
        password: senha,
        authProvider: 'firestore',
        email: email || authEmail || null,
        phone: phone || null,
        address: address || null,
        addressNumber: addressNumber || null,
        createdAt: new Date().toISOString()
      });
      return { uid: docRef.id, fallback: true, message: 'Registrado apenas no Firestore (Auth Email/Password desabilitado).' };
    }
    // Re-throw other errors
    throw err;
  }
}

export async function createCompany(cnpj, data = {}) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  const ref = doc(db, 'companies', companyId);
  const snap = await getDoc(ref);
  if (snap.exists()) return { exists: true, company: snap.data() };
  await setDoc(ref, { cnpj: companyId, createdAt: new Date().toISOString(), ...data });
  const newSnap = await getDoc(ref);
  return { exists: true, company: newSnap.data() };
}

export async function updateUser(cnpj, userId, updates = {}) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  if (!userId) throw new Error('userId requerido');
  const userRef = doc(db, 'companies', companyId, 'users', userId);
  await updateDoc(userRef, updates);
  const snap = await getDoc(userRef);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function deleteUser(cnpj, userId) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  if (!userId) throw new Error('userId requerido');
  const userRef = doc(db, 'companies', companyId, 'users', userId);
  await deleteDoc(userRef);
  return { id: userId, deleted: true };
}

export async function recoverPassword(emailOrUsername, cnpj) {
  // if username provided, convert to synthetic email
  const email = emailOrUsername.includes('@') ? emailOrUsername : makeEmail(cnpj, emailOrUsername);
  return sendPasswordResetEmail(auth, email);
}

// CRM helpers
export async function listCompanyUsers(cnpj) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido: informe o CNPJ da empresa para listar usuários.');
  const usersRef = collection(db, 'companies', companyId, 'users');
  const snap = await getDocs(usersRef);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getActiveUsers(cnpj) {
  const users = await listCompanyUsers(cnpj);
  return users.filter(u => u.active);
}

// Ordens de Serviço (Service Orders) functions
export async function createServiceOrder(cnpj, orderData) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  const ordersRef = collection(db, 'companies', companyId, 'serviceOrders');
  const docRef = await addDoc(ordersRef, {
    ...orderData,
    codigo: `#${Math.floor(55000 + Math.random() * 5000)}`,
    status: orderData.status || 'Pendente',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  return { id: docRef.id, ...orderData };
}

export async function listServiceOrders(cnpj) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  const ordersRef = collection(db, 'companies', companyId, 'serviceOrders');
  const snap = await getDocs(ordersRef);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function updateServiceOrder(cnpj, orderId, updateData) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  const orderRef = doc(db, 'companies', companyId, 'serviceOrders', orderId);
  await updateDoc(orderRef, { ...updateData, updatedAt: new Date().toISOString() });
}

export async function deleteServiceOrder(cnpj, orderId) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  const orderRef = doc(db, 'companies', companyId, 'serviceOrders', orderId);
  await deleteDoc(orderRef);
}

// Compras (Purchasing) functions
export async function createSupplier(cnpj, supplierData) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  const suppliersRef = collection(db, 'companies', companyId, 'suppliers');
  const docRef = await addDoc(suppliersRef, {
    ...supplierData,
    createdAt: new Date().toISOString(),
    status: 'Ativo'
  });
  return { id: docRef.id, ...supplierData };
}

export async function listSuppliers(cnpj) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  const suppliersRef = collection(db, 'companies', companyId, 'suppliers');
  const snap = await getDocs(suppliersRef);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function updateSupplier(cnpj, supplierId, updateData) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  const supplierRef = doc(db, 'companies', companyId, 'suppliers', supplierId);
  await updateDoc(supplierRef, { ...updateData, updatedAt: new Date().toISOString() });
}

export async function deleteSupplier(cnpj, supplierId) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  const supplierRef = doc(db, 'companies', companyId, 'suppliers', supplierId);
  await deleteDoc(supplierRef);
}

// Pedidos de Compra (Purchase Orders)
export async function createPurchaseOrder(cnpj, orderData) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  const ordersRef = collection(db, 'companies', companyId, 'purchaseOrders');
  const docRef = await addDoc(ordersRef, {
    ...orderData,
    numero: `PC-${Math.floor(10000 + Math.random() * 90000)}`,
    status: orderData.status || 'Processando',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  return { id: docRef.id, ...orderData };
}

export async function listPurchaseOrders(cnpj) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  const ordersRef = collection(db, 'companies', companyId, 'purchaseOrders');
  const snap = await getDocs(ordersRef);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function updatePurchaseOrder(cnpj, orderId, updateData) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  const orderRef = doc(db, 'companies', companyId, 'purchaseOrders', orderId);
  await updateDoc(orderRef, { ...updateData, updatedAt: new Date().toISOString() });
}

export async function deletePurchaseOrder(cnpj, orderId) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  const orderRef = doc(db, 'companies', companyId, 'purchaseOrders', orderId);
  await deleteDoc(orderRef);
}

// Cotações (Quotations)
export async function createQuotation(cnpj, quotationData) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  const quotationsRef = collection(db, 'companies', companyId, 'quotations');
  const docRef = await addDoc(quotationsRef, {
    ...quotationData,
    numero: `COT-${Math.floor(10000 + Math.random() * 90000)}`,
    status: quotationData.status || 'Aberta',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  return { id: docRef.id, ...quotationData };
}

export async function listQuotations(cnpj) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  const quotationsRef = collection(db, 'companies', companyId, 'quotations');
  const snap = await getDocs(quotationsRef);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function updateQuotation(cnpj, quotationId, updateData) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  const quotationRef = doc(db, 'companies', companyId, 'quotations', quotationId);
  await updateDoc(quotationRef, { ...updateData, updatedAt: new Date().toISOString() });
}

// NF-e (Notas Fiscais)
export async function createInvoice(cnpj, invoiceData) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  const invoicesRef = collection(db, 'companies', companyId, 'invoices');
  const docRef = await addDoc(invoicesRef, {
    ...invoiceData,
    status: invoiceData.status || 'Processando',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  return { id: docRef.id, ...invoiceData };
}

export async function listInvoices(cnpj) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  const invoicesRef = collection(db, 'companies', companyId, 'invoices');
  const snap = await getDocs(invoicesRef);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function updateInvoice(cnpj, invoiceId, updateData) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  const invoiceRef = doc(db, 'companies', companyId, 'invoices', invoiceId);
  await updateDoc(invoiceRef, { ...updateData, updatedAt: new Date().toISOString() });
}

// Produtos (Products)
export async function createProduct(cnpj, productData) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  const productsRef = collection(db, 'companies', companyId, 'products');
  const docRef = await addDoc(productsRef, {
    ...productData,
    estoque: productData.estoque || 0,
    preco: productData.preco || 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  return { id: docRef.id, ...productData };
}

export async function listProducts(cnpj) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  const productsRef = collection(db, 'companies', companyId, 'products');
  const snap = await getDocs(productsRef);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function updateProduct(cnpj, productId, updateData) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  const productRef = doc(db, 'companies', companyId, 'products', productId);
  await updateDoc(productRef, { ...updateData, updatedAt: new Date().toISOString() });
}

export async function deleteProduct(cnpj, productId) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  const productRef = doc(db, 'companies', companyId, 'products', productId);
  await deleteDoc(productRef);
}

// Estoque (Inventory)
export async function addToStock(cnpj, productId, quantidadeAdicionada) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  
  const productRef = doc(db, 'companies', companyId, 'products', productId);
  const productSnap = await getDoc(productRef);
  
  if (!productSnap.exists()) throw new Error('Produto não encontrado');
  
  const currentQuantidade = parseFloat(productSnap.data().quantidade) || 0;
  const novaQuantidade = currentQuantidade + parseFloat(quantidadeAdicionada);
  
  await updateDoc(productRef, {
    quantidade: novaQuantidade,
    updatedAt: new Date().toISOString()
  });
  
  return { id: productId, quantidade: novaQuantidade };
}

export async function removeFromStock(cnpj, productId, quantidadeRemovida) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  
  const productRef = doc(db, 'companies', companyId, 'products', productId);
  const productSnap = await getDoc(productRef);
  
  if (!productSnap.exists()) throw new Error('Produto não encontrado');
  
  const currentQuantidade = parseFloat(productSnap.data().quantidade) || 0;
  const novaQuantidade = Math.max(0, currentQuantidade - parseFloat(quantidadeRemovida));
  
  await updateDoc(productRef, {
    quantidade: novaQuantidade,
    updatedAt: new Date().toISOString()
  });
  
  return { id: productId, quantidade: novaQuantidade };
}

export async function getStockLevel(cnpj, productId) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  
  const productRef = doc(db, 'companies', companyId, 'products', productId);
  const productSnap = await getDoc(productRef);
  
  if (!productSnap.exists()) throw new Error('Produto não encontrado');
  
  return parseFloat(productSnap.data().quantidade) || 0;
}

// Categorias (Categories)
export async function createCategory(cnpj, categoryName) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  
  // Salvar em companies/{CNPJ}/products/categoria/{categoryName}
  const categoryRef = doc(db, 'companies', companyId, 'products', 'categoria');
  
  // Obter documento para verificar se já existe
  const snap = await getDoc(categoryRef);
  let existingCategories = [];
  
  if (snap.exists()) {
    existingCategories = snap.data().list || [];
  }
  
  // Verificar duplicata
  if (existingCategories.includes(categoryName)) {
    throw new Error('Categoria já existe');
  }
  
  // Adicionar nova categoria
  existingCategories.push(categoryName);
  
  await setDoc(categoryRef, {
    list: existingCategories,
    updatedAt: new Date().toISOString()
  });
  
  return { id: categoryName, name: categoryName };
}

export async function listCategories(cnpj) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  
  // Obter documento de categorias
  const categoryRef = doc(db, 'companies', companyId, 'products', 'categoria');
  const snap = await getDoc(categoryRef);
  
  if (!snap.exists()) {
    return ['Todas'];
  }
  
  const categories = snap.data().list || [];
  return ['Todas', ...categories];
}

export async function deleteCategory(cnpj, categoryName) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  
  const categoryRef = doc(db, 'companies', companyId, 'products', 'categoria');
  const snap = await getDoc(categoryRef);
  
  if (!snap.exists()) throw new Error('Categorias não encontradas');
  
  const existingCategories = snap.data().list || [];
  const updatedCategories = existingCategories.filter(cat => cat !== categoryName);
  
  await setDoc(categoryRef, {
    list: updatedCategories,
    updatedAt: new Date().toISOString()
  });
}

// Movimentações (Stock Movements)
export async function createMovementRecord(cnpj, productId, movementData) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  
  // Coleção: companies/{CNPJ}/movimentacoes (3 segmentos - válido)
  const movementRef = collection(db, 'companies', companyId, 'movimentacoes');
  
  const docRef = await addDoc(movementRef, {
    ...movementData,
    productId: productId,
    timestamp: new Date().toISOString(),
    createdAt: new Date().toISOString()
  });
  
  return { id: docRef.id, ...movementData };
}

export async function listMovements(cnpj, productId) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  
  // Obter movimentações de um produto específico
  const movementRef = collection(db, 'companies', companyId, 'movimentacoes');
  const q = query(movementRef, where('productId', '==', productId), orderBy('timestamp', 'desc'));
  const snap = await getDocs(q);
  
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function listAllMovements(cnpj) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  
  // Obter todas as movimentações ordenadas por timestamp
  const movementRef = collection(db, 'companies', companyId, 'movimentacoes');
  const q = query(movementRef, orderBy('timestamp', 'desc'));
  const snap = await getDocs(q);
  
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function deleteMovementRecord(cnpj, movementId) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  
  const movementRef = doc(db, 'companies', companyId, 'movimentacoes', movementId);
  await deleteDoc(movementRef);
  
  return { id: movementId, deleted: true };
}

// NOTIFICAÇÕES EM TEMPO REAL
export async function createNotification(cnpj, notificationData) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  
  const notificationsRef = collection(db, 'companies', companyId, 'notifications');
  
  // Filter out undefined values from notificationData
  const cleanedData = Object.fromEntries(
    Object.entries(notificationData).filter(([, value]) => value !== undefined)
  );
  
  const docRef = await addDoc(notificationsRef, {
    ...cleanedData,
    isRead: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  
  return { id: docRef.id, ...cleanedData };
}

export async function notifyAllUsers(cnpj, notificationData, roles = ['funcionario', 'gerente', 'admin']) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  
  // Buscar todos os usuários com os roles especificados
  const usersRef = collection(db, 'companies', companyId, 'users');
  const q = query(usersRef, where('role', 'in', roles));
  const snap = await getDocs(q);
  
  // Criar notificação para cada usuário
  const notifications = [];
  for (const userDoc of snap.docs) {
    const user = userDoc.data();
    const notif = await createNotification(cnpj, {
      ...notificationData,
      userId: userDoc.id,
      username: user.username,
      email: user.email
    });
    notifications.push(notif);
  }
  
  return notifications;
}

export async function listNotifications(cnpj, userId, limit = 50) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  
  const notificationsRef = collection(db, 'companies', companyId, 'notifications');
  const q = query(
    notificationsRef, 
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limit)
  );
  
  try {
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse();
  } catch (error) {
    // Se falhar com orderBy, tenta sem limitar
    const baseQ = query(notificationsRef, where('userId', '==', userId));
    const snap = await getDocs(baseQ);
    return snap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  }
}

export async function markNotificationAsRead(cnpj, notificationId) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  
  const notifRef = doc(db, 'companies', companyId, 'notifications', notificationId);
  await updateDoc(notifRef, {
    isRead: true,
    updatedAt: new Date().toISOString()
  });
}

export async function markAllNotificationsAsRead(cnpj, userId) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  
  const notificationsRef = collection(db, 'companies', companyId, 'notifications');
  const q = query(notificationsRef, where('userId', '==', userId), where('isRead', '==', false));
  const snap = await getDocs(q);
  
  const updates = snap.docs.map(doc =>
    updateDoc(doc.ref, { isRead: true, updatedAt: new Date().toISOString() })
  );
  
  await Promise.all(updates);
}

export async function deleteNotification(cnpj, notificationId) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  
  const notifRef = doc(db, 'companies', companyId, 'notifications', notificationId);
  await deleteDoc(notifRef);
}

export async function getUnreadCount(cnpj, userId) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  
  const notificationsRef = collection(db, 'companies', companyId, 'notifications');
  const q = query(notificationsRef, where('userId', '==', userId), where('isRead', '==', false));
  const snap = await getDocs(q);
  
  return snap.size;
}

// Monitorar notificações em tempo real
export function subscribeToNotifications(cnpj, userId, callback) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  
  const notificationsRef = collection(db, 'companies', companyId, 'notifications');
  const q = query(notificationsRef, where('userId', '==', userId));
  
  // Firebase real-time listener
  const unsubscribe = getDocs(q).then(() => {
    // Polling fallback a cada 5 segundos se real-time não funcionar
    const interval = setInterval(async () => {
      try {
        const snap = await getDocs(q);
        const notifications = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(notifications);
      } catch (error) {
        console.error('Erro ao buscar notificações:', error);
      }
    }, 5000); // A cada 5 segundos
    
    return () => clearInterval(interval);
  });
  
  return unsubscribe;
}

// ======================== CHAT FUNCTIONS ========================

export async function createChat(cnpj, chatData) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  
  try {
    const chatsRef = collection(db, 'companies', companyId, 'chats');
    const newChat = {
      participantes: chatData.participantes || [],
      tipo: chatData.tipo || 'funcionario-prestador', // funcionario-base, prestador-base, etc
      titulo: chatData.titulo || '',
      descricao: chatData.descricao || '',
      criadoEm: new Date().toISOString(),
      ultimaMensagem: null,
      ultimaMensagemData: null,
      ativo: true,
      createdBy: chatData.createdBy || 'sistema',
      // Campos extras para WhatsApp e Ordem de Serviço
      ...(chatData.telefone && { telefone: chatData.telefone }),
      ...(chatData.clienteNome && { clienteNome: chatData.clienteNome }),
      ...(chatData.osId && { osId: chatData.osId })
    };
    
    const docRef = await addDoc(chatsRef, newChat);
    return { id: docRef.id, ...newChat };
  } catch (err) {
    console.error('Erro ao criar chat:', err);
    throw err;
  }
}

export async function listChats(cnpj, cpfUsuario = null) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  
  try {
    const chatsRef = collection(db, 'companies', companyId, 'chats');
    let q;
    
    if (cpfUsuario) {
      // Listar apenas chats do usuário (sem orderBy para evitar índice)
      q = query(
        chatsRef, 
        where('participantes', 'array-contains', cpfUsuario)
      );
    } else {
      q = query(chatsRef, orderBy('criadoEm', 'desc'));
    }
    
    const snap = await getDocs(q);
    const chats = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Ordenar no JavaScript se tiver cpfUsuario
    if (cpfUsuario) {
      chats.sort((a, b) => (b.criadoEm?.toDate?.() || 0) - (a.criadoEm?.toDate?.() || 0));
    }
    
    return chats;
  } catch (err) {
    console.error('Erro ao listar chats:', err);
    throw err;
  }
}

export async function getChat(cnpj, chatId) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  
  try {
    const chatRef = doc(db, 'companies', companyId, 'chats', chatId);
    const snap = await getDoc(chatRef);
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch (err) {
    console.error('Erro ao obter chat:', err);
    throw err;
  }
}

export async function sendMessage(cnpj, chatId, messageData) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  
  try {
    const mensagensRef = collection(db, 'companies', companyId, 'chats', chatId, 'mensagens');
    const newMessage = {
      cpfEnvio: messageData.cpfEnvio || '',
      nomeEnvio: messageData.nomeEnvio || '',
      conteudo: messageData.conteudo || '',
      tipo: messageData.tipo || 'texto', // texto, arquivo, pdf, foto
      arquivo: messageData.arquivo || null,
      anexos: messageData.anexos || [],
      dataCriacao: new Date().toISOString(),
      lido: false
    };
    
    const docRef = await addDoc(mensagensRef, newMessage);
    
    // Atualizar última mensagem do chat
    const chatRef = doc(db, 'companies', companyId, 'chats', chatId);
    await updateDoc(chatRef, {
      ultimaMensagem: messageData.nomeEnvio + ': ' + messageData.conteudo.substring(0, 50),
      ultimaMensagemData: new Date().toISOString()
    });
    
    return { id: docRef.id, ...newMessage };
  } catch (err) {
    console.error('Erro ao enviar mensagem:', err);
    throw err;
  }
}

export async function listMessages(cnpj, chatId, limitCount = 100) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  
  try {
    const mensagensRef = collection(db, 'companies', companyId, 'chats', chatId, 'mensagens');
    const q = query(mensagensRef, orderBy('dataCriacao', 'asc'), limit(limitCount));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error('Erro ao listar mensagens:', err);
    throw err;
  }
}

export async function markMessageAsRead(cnpj, chatId, messageId) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  
  try {
    const msgRef = doc(db, 'companies', companyId, 'chats', chatId, 'mensagens', messageId);
    await updateDoc(msgRef, { lido: true });
  } catch (err) {
    console.error('Erro ao marcar mensagem como lida:', err);
    throw err;
  }
}

export async function deleteMessage(cnpj, chatId, messageId) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  
  try {
    const msgRef = doc(db, 'companies', companyId, 'chats', chatId, 'mensagens', messageId);
    await deleteDoc(msgRef);
  } catch (err) {
    console.error('Erro ao deletar mensagem:', err);
    throw err;
  }
}

export async function deleteChat(cnpj, chatId) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  
  try {
    // Deletar todas as mensagens do chat primeiro
    const messagesRef = collection(db, 'companies', companyId, 'chats', chatId, 'mensagens');
    const messagesDocs = await getDocs(messagesRef);
    
    for (const msgDoc of messagesDocs.docs) {
      await deleteDoc(msgDoc.ref);
    }
    
    // Depois deletar o chat
    const chatRef = doc(db, 'companies', companyId, 'chats', chatId);
    await deleteDoc(chatRef);
    
    console.log('✅ Chat e mensagens deletados com sucesso');
  } catch (err) {
    console.error('Erro ao deletar chat:', err);
    throw err;
  }
}

export async function updateUserStatus(cnpj, cpf, status) {
  const companyId = normalizeCnpj(cnpj);
  if (!companyId) throw new Error('CNPJ inválido');
  
  try {
    const usuariosRef = collection(db, 'companies', companyId, 'usuarios');
    const q = query(usuariosRef, where('cpf', '==', cpf));
    const snap = await getDocs(q);
    
    if (!snap.empty) {
      const userDoc = snap.docs[0];
      await updateDoc(userDoc.ref, {
        status: status, // online, offline
        ultimaAtividade: new Date().toISOString()
      });
    }
  } catch (err) {
    console.error('Erro ao atualizar status do usuário:', err);
    throw err;
  }
}

export async function sendWhatsAppMessage(cnpj, phoneNumber, message) {
  try {
    console.log('🔄 Iniciando envio de mensagem WhatsApp para:', phoneNumber);
    
    // Formatar número
    let phone = phoneNumber.replace(/\D/g, '');
    if (!phone.startsWith('55') && phone.length === 11) {
      phone = '55' + phone;
    }

    console.log('📱 Número formatado:', phone);

    // URL do backend com NGROK (deve ser configurada no ambiente)
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
    console.log('🌐 URL do backend:', backendUrl);
    
    const payload = { phone, message };
    console.log('📤 Enviando payload:', JSON.stringify(payload));
    
    const response = await fetch(`${backendUrl}/api/whatsapp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    console.log('📥 Resposta do servidor - Status:', response.status);
    
    const result = await response.json();
    console.log('📋 Resposta JSON:', result);
    
    if (!response.ok) {
      throw new Error(result.error || `Erro HTTP ${response.status}`);
    }

    console.log('✅ Mensagem WhatsApp enviada com sucesso:', result);
    return result;
  } catch (err) {
    console.error('❌ Erro ao enviar mensagem WhatsApp:', err.message);
    console.error('Stack:', err.stack);
    // Não lançar erro para não quebrar o fluxo - apenas logar
    return { success: false, error: err.message };
  }
}

export async function getReceivedWhatsAppMessages(phoneNumber) {
  try {
    console.log('🔄 Buscando mensagens recebidas do cliente:', phoneNumber);
    
    // Formatar número: remover tudo exceto dígitos e garantir 55 no início
    let phone = phoneNumber.replace(/\D/g, '');
    if (!phone.startsWith('55')) {
      phone = '55' + phone;
    }
    
    console.log('📱 Número formatado para busca:', phone);
    
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
    
    const response = await fetch(`${backendUrl}/api/whatsapp/messages?phone=${phone}`);
    const result = await response.json();
    
    console.log('✅ Mensagens recebidas:', result);
    return result;
  } catch (err) {
    console.error('❌ Erro ao buscar mensagens WhatsApp:', err.message);
    return { messages: [] };
  }
}

// ===== SATISFAÇÃO DO CLIENTE =====

export async function saveSatisfactionRating(cnpj, rating) {
  try {
    const satisfacaoRef = collection(db, 'companies', cnpj, 'satisfacao');
    
    const docRef = await addDoc(satisfacaoRef, {
      nota: rating,
      data: new Date().toISOString(),
      mes: new Date().getMonth() + 1,
      ano: new Date().getFullYear()
    });
    
    console.log('✅ Avaliação de satisfação registrada:', docRef.id);
    return docRef.id;
  } catch (err) {
    console.error('❌ Erro ao registrar satisfação:', err);
    throw err;
  }
}

export async function getSatisfactionRatings(cnpj, filters = {}) {
  try {
    const satisfacaoRef = collection(db, 'companies', cnpj, 'satisfacao');
    let q = query(satisfacaoRef, orderBy('data', 'desc'));
    
    const snapshot = await getDocs(q);
    const ratings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('✅ Avaliações carregadas:', ratings.length);
    return ratings;
  } catch (err) {
    console.error('❌ Erro ao buscar satisfações:', err);
    return [];
  }
}

export async function getMonthSatisfactionAverage(cnpj, mes = null, ano = null) {
  try {
    const now = new Date();
    const mesAtual = mes || (now.getMonth() + 1);
    const anoAtual = ano || now.getFullYear();
    
    const satisfacaoRef = collection(db, 'companies', cnpj, 'satisfacao');
    
    const snapshot = await getDocs(satisfacaoRef);
    const ratings = snapshot.docs
      .map(doc => doc.data())
      .filter(r => r.mes === mesAtual && r.ano === anoAtual);
    
    if (ratings.length === 0) return 0;
    
    const media = ratings.reduce((acc, r) => acc + (r.nota || 0), 0) / ratings.length;
    console.log(`📊 Média de satisfação (${mesAtual}/${anoAtual}):`, media.toFixed(1));
    return parseFloat(media.toFixed(1));
  } catch (err) {
    console.error('❌ Erro ao calcular média de satisfação:', err);
    return 0;
  }
}

export default { 
  identifyCnpj, 
  checkUser, 
  login, 
  registerUser, 
  recoverPassword, 
  listCompanyUsers, 
  getActiveUsers, 
  createCompany, 
  updateUser, 
  deleteUser, 
  createServiceOrder, 
  listServiceOrders, 
  updateServiceOrder, 
  deleteServiceOrder,
  createSupplier,
  listSuppliers,
  updateSupplier,
  deleteSupplier,
  createPurchaseOrder,
  listPurchaseOrders,
  updatePurchaseOrder,
  deletePurchaseOrder,
  createQuotation,
  listQuotations,
  updateQuotation,
  createInvoice,
  listInvoices,
  updateInvoice,
  createProduct,
  listProducts,
  updateProduct,
  deleteProduct,
  addToStock,
  removeFromStock,
  getStockLevel,
  createCategory,
  listCategories,
  deleteCategory,
  createMovementRecord,
  listMovements,
  listAllMovements,
  deleteMovementRecord,
  createNotification,
  notifyAllUsers,
  listNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadCount,
  subscribeToNotifications,
  // Chat functions
  createChat,
  listChats,
  getChat,
  sendMessage,
  listMessages,
  markMessageAsRead,
  deleteMessage,
  deleteChat,
  updateUserStatus,
  // WhatsApp functions
  sendWhatsAppMessage,
  getReceivedWhatsAppMessages,
  // Satisfação functions
  saveSatisfactionRating,
  getSatisfactionRatings,
  getMonthSatisfactionAverage
};
