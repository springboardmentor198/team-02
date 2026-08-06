package com.realestate.due_diligence_agent.notification;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // All notifications for a user, newest first — powers the dashboard list.
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Just the unread ones, newest first.
    List<Notification> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, NotificationStatus status);

    // For a small "3 new notifications" badge/counter on the dashboard.
    long countByUserIdAndStatus(Long userId, NotificationStatus status);
}
