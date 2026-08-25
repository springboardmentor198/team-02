package com.realestate.due_diligence_agent.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.due_diligence_agent.dto.AdminDashboardStatsResponse;
import com.realestate.due_diligence_agent.dto.AdminUserResponse;
import com.realestate.due_diligence_agent.dto.UpdateUserRoleRequest;
import com.realestate.due_diligence_agent.entity.Role;
import com.realestate.due_diligence_agent.entity.User;
import com.realestate.due_diligence_agent.exception.BadRequestException;
import com.realestate.due_diligence_agent.exception.ResourceNotFoundException;
import com.realestate.due_diligence_agent.repository.AuditLogRepository;
import com.realestate.due_diligence_agent.repository.DueDiligenceReportRepository;
import com.realestate.due_diligence_agent.repository.PropertyRepository;
import com.realestate.due_diligence_agent.repository.UserRepository;

// Locked to ADMIN only — see SecurityConfig ("/api/admin/**" → hasRole("ADMIN")).
// Every figure below is a real repository count against Postgres; nothing
// here is placeholder/mock data except the two fields called out on
// AdminDashboardStatsResponse, since this app has no monitoring stack wired
// up to source real uptime/health from.
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final DueDiligenceReportRepository reportRepository;
    private final AuditLogRepository auditLogRepository;

    public AdminController(UserRepository userRepository,
            PropertyRepository propertyRepository,
            DueDiligenceReportRepository reportRepository,
            AuditLogRepository auditLogRepository) {
        this.userRepository = userRepository;
        this.propertyRepository = propertyRepository;
        this.reportRepository = reportRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<AdminDashboardStatsResponse> dashboardStats() {

        List<User> allUsers = userRepository.findAll();

        Map<String, Long> usersByRole = allUsers.stream()
                .collect(Collectors.groupingBy(
                        u -> u.getRole() != null ? u.getRole().name() : "UNKNOWN",
                        Collectors.counting()));

        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        LocalDateTime twentyFourHoursAgo = LocalDateTime.now().minusHours(24);

        AdminDashboardStatsResponse stats = new AdminDashboardStatsResponse();
        stats.setTotalUsers(allUsers.size());
        stats.setUsersByRole(usersByRole);
        stats.setTotalProperties(propertyRepository.count());
        stats.setTotalReports(reportRepository.count());
        stats.setReportsLast7Days(reportRepository.countByGeneratedAtGreaterThanEqual(sevenDaysAgo));
        stats.setPendingReports(reportRepository.countByStatus("PENDING"));
        stats.setTotalAuditLogs(auditLogRepository.count());
        stats.setAuditEventsLast24h(auditLogRepository.countByActionTimeGreaterThanEqual(twentyFourHoursAgo));
        stats.setFailedAuditEvents(auditLogRepository.countByStatus("FAILED"));

        // Placeholder until real infra monitoring (Prometheus/Grafana, per the
        // milestone architecture diagram) is wired up — documented on the DTO.
        stats.setSystemHealth("OPERATIONAL");
        stats.setApiUptimePercent(99.9);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponse>> listUsers() {
        List<AdminUserResponse> users = userRepository.findAll().stream()
                .map(u -> new AdminUserResponse(
                        u.getId(),
                        u.getFullName(),
                        u.getEmail(),
                        u.getRole() != null ? u.getRole().name() : null))
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<AdminUserResponse> updateUserRole(
            @PathVariable Long id,
            @RequestBody UpdateUserRoleRequest request) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        Role newRole;
        try {
            newRole = Role.valueOf(request.getRole().trim().toUpperCase());
        } catch (Exception e) {
            throw new BadRequestException("Invalid role: " + request.getRole());
        }

        user.setRole(newRole);
        userRepository.save(user);

        return ResponseEntity.ok(new AdminUserResponse(
                user.getId(), user.getFullName(), user.getEmail(), user.getRole().name()));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/system-health")
    public ResponseEntity<Map<String, Object>> systemHealth() {
        // Same caveat as dashboardStats(): no monitoring integration exists
        // yet, so this reports static "all good" values rather than measured
        // ones. Wire this up to real infra metrics before relying on it.
        return ResponseEntity.ok(Map.of(
                "status", "OPERATIONAL",
                "apiUptimePercent", 99.9,
                "database", "CONNECTED",
                "note", "Static placeholder — no monitoring stack integrated yet"));
    }
}
