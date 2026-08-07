// hooks/useNotifications.js
//
// Single source of truth for notification state, shared by NotificationBell
// (dropdown preview) and pages/Notifications.jsx (full history) so they
// never drift out of sync. Resolves the numeric userId once (see
// getCurrentUserId in services/api.js — the JWT itself has no user id) and
// polls for unread count so the bell badge updates without a refresh.
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getCurrentUserId,
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/api";

const POLL_INTERVAL_MS = 20000;

export function useNotifications({ poll = true } = {}) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userIdRef = useRef(null);

  const resolveUserId = useCallback(async () => {
    if (userIdRef.current) return userIdRef.current;
    const id = await getCurrentUserId();
    userIdRef.current = id;
    return id;
  }, []);

  const refresh = useCallback(async () => {
    try {
      const userId = await resolveUserId();
      if (!userId) throw new Error("No authenticated user id available");
      const [list, count] = await Promise.all([
        getNotifications(userId),
        getUnreadCount(userId),
      ]);
      setNotifications(list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setUnreadCount(count);
      setError(null);
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setError("Couldn't load notifications.");
    } finally {
      setLoading(false);
    }
  }, [resolveUserId]);

  const refreshCountOnly = useCallback(async () => {
    try {
      const userId = await resolveUserId();
      if (!userId) return;
      const count = await getUnreadCount(userId);
      setUnreadCount(count);
    } catch (err) {
      console.error("Failed to refresh unread count:", err);
    }
  }, [resolveUserId]);

  useEffect(() => {
    refresh();
    if (!poll) return;
    const interval = setInterval(refreshCountOnly, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh, refreshCountOnly, poll]);

  const markRead = useCallback(async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: "READ" } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await markNotificationRead(id);
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      refresh();
    }
  }, [refresh]);

  const markAllRead = useCallback(async () => {
    const userId = await resolveUserId();
    if (!userId) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, status: "READ" })));
    setUnreadCount(0);
    try {
      await markAllNotificationsRead(userId);
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      refresh();
    }
  }, [resolveUserId, refresh]);

  return { notifications, unreadCount, loading, error, refresh, markRead, markAllRead };
}
