package com.realestate.due_diligence_agent.notification.dto;

import com.realestate.due_diligence_agent.notification.Notification;
import com.realestate.due_diligence_agent.notification.NotificationStatus;

import java.time.LocalDateTime;

/**
 * What the frontend actually receives. Keeping a DTO here (instead of
 * returning the entity directly) means the API shape stays stable even
 * if the Notification entity changes later.
 */
public record NotificationResponse(
        Long id,
        Long reportId,
        String message,
        NotificationStatus status,
        LocalDateTime createdAt
) {
    public static NotificationResponse from(Notification n) {
        return new NotificationResponse(
                n.getId(),
                n.getReportId(),
                n.getMessage(),
                n.getStatus(),
                n.getCreatedAt()
        );
    }
}
