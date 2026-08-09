package com.realestate.due_diligence_agent.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.realestate.due_diligence_agent.dto.AuditLogStatsResponse;
import com.realestate.due_diligence_agent.entity.AuditLog;
import com.realestate.due_diligence_agent.exception.ResourceNotFoundException;
import com.realestate.due_diligence_agent.repository.AuditLogRepository;

import jakarta.persistence.criteria.Predicate;
import jakarta.servlet.http.HttpServletRequest;

@Service
public class AuditLogServiceImpl implements AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Override
    public AuditLog save(AuditLog auditLog) {
        return auditLogRepository.save(auditLog);
    }

    @Override
    public AuditLog record(AuditLog entry) {
        if (entry.getActionTime() == null) {
            entry.setActionTime(LocalDateTime.now());
        }
        if (entry.getIpAddress() == null) {
            entry.setIpAddress(resolveClientIp());
        }
        if (entry.getStatus() == null) {
            entry.setStatus("SUCCESS");
        }
        return auditLogRepository.save(entry);
    }

    @Override
    public AuditLog findByIdOrThrow(Long id) {
        return auditLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Audit log not found: " + id));
    }

    @Override
    public Page<AuditLog> search(
            String user,
            String property,
            String reportNumber,
            String action,
            String role,
            String status,
            LocalDate dateFrom,
            LocalDate dateTo,
            Pageable pageable) {

        Specification<AuditLog> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (hasText(user)) {
                predicates.add(cb.like(cb.lower(root.get("username")), like(user)));
            }

            if (hasText(property)) {
                try {
                    Long propertyId = Long.parseLong(property.trim());
                    predicates.add(cb.equal(root.get("propertyId"), propertyId));
                } catch (NumberFormatException ex) {
                    predicates.add(cb.like(cb.lower(root.get("description")), like(property)));
                }
            }

            if (hasText(reportNumber)) {
                predicates.add(cb.like(cb.lower(root.get("description")), like(reportNumber)));
            }

            if (hasText(action)) {
                predicates.add(cb.equal(root.get("action"), action));
            }

            if (hasText(role)) {
                predicates.add(cb.equal(root.get("role"), role));
            }

            if (hasText(status)) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (dateFrom != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("actionTime"), dateFrom.atStartOfDay()));
            }

            if (dateTo != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("actionTime"), dateTo.atTime(LocalTime.MAX)));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return auditLogRepository.findAll(spec, pageable);
    }

    @Override
    public AuditLogStatsResponse getStats() {
        long total = auditLogRepository.count();
        long successful = auditLogRepository.countByStatus("SUCCESS");
        long failed = auditLogRepository.countByStatus("FAILED");
        long today = auditLogRepository.countByActionTimeGreaterThanEqual(
                LocalDate.now().atStartOfDay());

        return new AuditLogStatsResponse(total, successful, failed, today);
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private String like(String value) {
        return "%" + value.trim().toLowerCase() + "%";
    }

    private String resolveClientIp() {
        try {
            ServletRequestAttributes attrs =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs == null) {
                return null;
            }
            HttpServletRequest request = attrs.getRequest();
            String forwardedFor = request.getHeader("X-Forwarded-For");
            if (forwardedFor != null && !forwardedFor.isBlank()) {
                return forwardedFor.split(",")[0].trim();
            }
            return request.getRemoteAddr();
        } catch (Exception ex) {
            return null;
        }
    }
}
