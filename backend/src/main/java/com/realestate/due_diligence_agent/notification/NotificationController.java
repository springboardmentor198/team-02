package com.realestate.due_diligence_agent.notification;

import com.realestate.due_diligence_agent.notification.dto.NotificationResponse;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * API consumed by the dashboard's notification bell / list.
 *
 * NOTE on userId: below it's taken as a @RequestParam so this compiles and
 * is testable standalone. In your real app, once Spring Security is wired
 * in, swap that for the authenticated user, e.g.:
 *
 *   @GetMapping
 *   public List<NotificationResponse> getMyNotifications(Authentication authentication) {
 *       Long userId = ((YourUserPrincipal) authentication.getPrincipal()).getId();
 *       ...
 *   }
 *
 * so a user can only ever see their own notifications.
 */
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<NotificationResponse> getNotifications(@RequestParam Long userId) {
        return notificationService.getNotificationsForUser(userId)
                .stream()
                .map(NotificationResponse::from)
                .collect(Collectors.toList());
    }

    @GetMapping("/unread")
    public List<NotificationResponse> getUnreadNotifications(@RequestParam Long userId) {
        return notificationService.getUnreadNotifications(userId)
                .stream()
                .map(NotificationResponse::from)
                .collect(Collectors.toList());
    }

    @GetMapping("/unread/count")
    public Map<String, Long> getUnreadCount(@RequestParam Long userId) {
        return Map.of("unreadCount", notificationService.getUnreadCount(userId));
    }

    @PutMapping("/{id}/read")
    public NotificationResponse markAsRead(@PathVariable Long id) {
        return NotificationResponse.from(notificationService.markAsRead(id));
    }

    @PutMapping("/read-all")
    public void markAllAsRead(@RequestParam Long userId) {
        notificationService.markAllAsRead(userId);
    }
}
