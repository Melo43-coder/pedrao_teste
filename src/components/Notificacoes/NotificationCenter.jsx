import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  listNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadCount,
  subscribeToNotifications
} from "../../services/firebase";

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentCnpj, setCurrentCnpj] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");

  // Carregar CNPJ e UserId
  useEffect(() => {
    const cnpj = localStorage.getItem("userCnpj");
    const userId = localStorage.getItem("userId");
    
    if (cnpj && userId) {
      setCurrentCnpj(cnpj);
      setCurrentUserId(userId);
      loadNotifications(cnpj, userId);
      loadUnreadCount(cnpj, userId);
      
      // Monitorar notificações em tempo real
      const unsubscribe = subscribeToNotifications(cnpj, userId, (newNotifications) => {
        setNotifications(newNotifications);
      });
      
      return () => {
        if (typeof unsubscribe === 'function') unsubscribe();
      };
    }
  }, []);

  // Carregar notificações
  const loadNotifications = useCallback(async (cnpj, userId) => {
    setLoading(true);
    try {
      const notifs = await listNotifications(cnpj, userId);
      setNotifications(notifs);
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar contagem de não lidas
  const loadUnreadCount = useCallback(async (cnpj, userId) => {
    try {
      const count = await getUnreadCount(cnpj, userId);
      setUnreadCount(count);
    } catch (error) {
      console.error("Erro ao carregar contagem:", error);
    }
  }, []);

  // Marcar como lida
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(currentCnpj, notificationId);
      setNotifications(prevNotifs =>
        prevNotifs.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      await loadUnreadCount(currentCnpj, currentUserId);
    } catch (error) {
      console.error("Erro ao marcar como lida:", error);
    }
  };

  // Marcar todas como lidas
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead(currentCnpj, currentUserId);
      setNotifications(prevNotifs =>
        prevNotifs.map(n => ({ ...n, isRead: true }))
      );
      await loadUnreadCount(currentCnpj, currentUserId);
    } catch (error) {
      console.error("Erro ao marcar todas como lidas:", error);
    }
  };

  // Deletar notificação
  const handleDelete = async (notificationId) => {
    try {
      await deleteNotification(currentCnpj, notificationId);
      setNotifications(prevNotifs =>
        prevNotifs.filter(n => n.id !== notificationId)
      );
      await loadUnreadCount(currentCnpj, currentUserId);
    } catch (error) {
      console.error("Erro ao deletar notificação:", error);
    }
  };

  // Estilos
  const styles = {
    bellIcon: {
      position: "relative",
      cursor: "pointer",
      fontSize: "1.5rem",
      color: "#374151"
    },
    badge: {
      position: "absolute",
      top: "-8px",
      right: "-8px",
      backgroundColor: "#ef4444",
      color: "white",
      borderRadius: "50%",
      width: "24px",
      height: "24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "0.75rem",
      fontWeight: "bold"
    },
    panel: {
      position: "fixed",
      top: "60px",
      right: "20px",
      width: "400px",
      maxHeight: "600px",
      backgroundColor: "white",
      borderRadius: "12px",
      boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
      zIndex: 1000,
      display: "flex",
      flexDirection: "column"
    },
    header: {
      padding: "16px",
      borderBottom: "1px solid #e5e7eb",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    },
    headerTitle: {
      fontSize: "1.125rem",
      fontWeight: 600,
      color: "#111827"
    },
    clearButton: {
      backgroundColor: "transparent",
      border: "none",
      cursor: "pointer",
      color: "#0ea5e9",
      fontSize: "0.875rem",
      fontWeight: 500,
      textDecoration: "underline"
    },
    notificationsList: {
      overflowY: "auto",
      flex: 1,
      padding: "0"
    },
    notificationItem: (isRead) => ({
      padding: "12px 16px",
      borderBottom: "1px solid #f3f4f6",
      backgroundColor: isRead ? "white" : "#f0f9ff",
      cursor: "pointer",
      transition: "all 0.2s ease",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "12px"
    }),
    notificationContent: {
      flex: 1,
      minWidth: 0
    },
    notificationType: {
      fontSize: "0.875rem",
      fontWeight: 600,
      color: "#0ea5e9",
      marginBottom: "4px"
    },
    notificationTitle: {
      fontSize: "0.95rem",
      fontWeight: 500,
      color: "#111827",
      marginBottom: "4px"
    },
    notificationMessage: {
      fontSize: "0.875rem",
      color: "#6b7280",
      marginBottom: "4px",
      lineHeight: "1.4"
    },
    notificationTime: {
      fontSize: "0.75rem",
      color: "#9ca3af"
    },
    deleteButton: {
      backgroundColor: "#fee2e2",
      border: "none",
      color: "#dc2626",
      borderRadius: "4px",
      cursor: "pointer",
      padding: "4px 8px",
      fontSize: "0.75rem",
      fontWeight: 600,
      flexShrink: 0
    },
    emptyState: {
      padding: "32px 16px",
      textAlign: "center",
      color: "#6b7280"
    },
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 999
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return "Agora";
    if (diff < 3600) return `${Math.floor(diff / 60)}m atrás`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  const getNotificationIcon = (type) => {
    const icons = {
      "nova_os": "📋",
      "estoque_baixo": "⚠️",
      "os_concluida": "✅",
      "alteracao_estoque": "📦",
      "novo_pedido": "🛒",
      "pedido_entregue": "✓"
    };
    return icons[type] || "🔔";
  };

  return (
    <>
      {/* Bell Icon */}
      <div
        style={styles.bellIcon}
        onClick={() => setShowPanel(!showPanel)}
        title="Notificações"
      >
        🔔
        {unreadCount > 0 && (
          <div style={styles.badge}>{unreadCount > 9 ? "9+" : unreadCount}</div>
        )}
      </div>

      {/* Overlay */}
      {showPanel && (
        <div style={styles.overlay} onClick={() => setShowPanel(false)} />
      )}

      {/* Notification Panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            style={styles.panel}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={styles.header}>
              <h3 style={styles.headerTitle}>Notificações</h3>
              {unreadCount > 0 && (
                <button
                  style={styles.clearButton}
                  onClick={handleMarkAllAsRead}
                >
                  Marcar como lidas
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div style={styles.notificationsList}>
              {loading ? (
                <div style={styles.emptyState}>
                  <p>Carregando notificações...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div style={styles.emptyState}>
                  <p style={{ fontSize: "2rem" }}>🔔</p>
                  <p>Nenhuma notificação</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {notifications.map((notif) => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      style={styles.notificationItem(notif.isRead)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = notif.isRead
                          ? "#f9fafb"
                          : "#ecf7ff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = notif.isRead
                          ? "white"
                          : "#f0f9ff";
                      }}
                      onClick={() => {
                        if (!notif.isRead) handleMarkAsRead(notif.id);
                      }}
                    >
                      <div style={styles.notificationContent}>
                        <div style={styles.notificationType}>
                          {getNotificationIcon(notif.type)} {notif.type}
                        </div>
                        <div style={styles.notificationTitle}>
                          {notif.titulo || "Notificação"}
                        </div>
                        <div style={styles.notificationMessage}>
                          {notif.mensagem || notif.message}
                        </div>
                        <div style={styles.notificationTime}>
                          {formatTime(notif.createdAt)}
                        </div>
                      </div>
                      <button
                        style={styles.deleteButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notif.id);
                        }}
                      >
                        ✕
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
