package com.realestate.due_diligence_agent.service;

import java.time.LocalDate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.realestate.due_diligence_agent.dto.AuditLogStatsResponse;
import com.realestate.due_diligence_agent.entity.AuditLog;

public interface AuditLogService {

    AuditLog save(AuditLog auditLog);

    /**
     * Fills in actionTime and (when not already set by the caller)
     * ipAddress from the current request, then persists. This is the one
     * call site every controller/service should use to record an activity —
     * keeps IP resolution and timestamping in one place instead of
     * repeated at every call site.
     */
    AuditLog record(AuditLog entry);

    AuditLog findByIdOrThrow(Long id);

    Page<AuditLog> search(
            String user,
            String property,
            String reportNumber,
            String action,
            String role,
            String status,
            LocalDate dateFrom,
            LocalDate dateTo,
            Pageable pageable);

    AuditLogStatsResponse getStats();
}
