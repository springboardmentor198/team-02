package com.realestate.due_diligence_agent.notification;

import java.util.List;

public interface NotificationService {

    /**
     * Called right after a report finishes generating.
     * Builds the "Your Due Diligence Report for X has been completed
     * successfully." message and saves it, status = UNREAD.
     */
    Notification createReportCompletedNotification(Long userId, Long reportId, String propertyName);

    /** All notifications for a user, newest first — for the dashboard list. */
    List<Notification> getNotificationsForUser(Long userId);

    /** Only the unread ones. */
    List<Notification> getUnreadNotifications(Long userId);

    /** For a badge/counter, e.g. "3 new". */
    long getUnreadCount(Long userId);

    /** Marks a single notification as read (e.g. user clicked it). */
    Notification markAsRead(Long notificationId);

    /** Marks everything for a user as read (e.g. "mark all as read" button). */
    void markAllAsRead(Long userId);
}
