package com.realestate.due_diligence_agent.controller;

import java.time.LocalDate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.due_diligence_agent.dto.AuditLogStatsResponse;
import com.realestate.due_diligence_agent.dto.PageResponse;
import com.realestate.due_diligence_agent.entity.AuditLog;
import com.realestate.due_diligence_agent.service.AuditLogService;

/**
 * Task 7 — Activity Logs (read side). Writes happen at the call sites that
 * actually perform the action (AuthController/UserService for LOGIN,
 * PropertyController for property CRUD + VIEW, DueDiligenceReportServiceImpl
 * for GENERATE_REPORT, ExportController for DOWNLOAD_REPORT) via
 * AuditLogService.record(...).
 */
@RestController
@RequestMapping("/api/audit-logs")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping({"", "/search"})
    public ResponseEntity<PageResponse<AuditLog>> list(
            @RequestParam(required = false) String user,
            @RequestParam(required = false) String property,
            @RequestParam(required = false) String reportNumber,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "actionTime"));

        Page<AuditLog> result = auditLogService.search(
                user, property, reportNumber, action, role, status, dateFrom, dateTo, pageable);

        return ResponseEntity.ok(PageResponse.from(result));
    }

    @GetMapping("/stats")
    public ResponseEntity<AuditLogStatsResponse> stats() {
        return ResponseEntity.ok(auditLogService.getStats());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuditLog> getById(@PathVariable Long id) {
        return ResponseEntity.ok(auditLogService.findByIdOrThrow(id));
    }
}
