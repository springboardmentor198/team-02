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

import com.realestate.due_diligence_agent.dto.ReportHistoryStatsResponse;
import com.realestate.due_diligence_agent.entity.DueDiligenceReport;
import com.realestate.due_diligence_agent.exception.ResourceNotFoundException;
import com.realestate.due_diligence_agent.repository.DueDiligenceReportRepository;

import jakarta.persistence.criteria.Predicate;

@Service
public class ReportHistoryServiceImpl implements ReportHistoryService {

    @Autowired
    private DueDiligenceReportRepository dueDiligenceReportRepository;

    @Override
    public Page<DueDiligenceReport> search(
            String reportNumber,
            String property,
            String requestedBy,
            String reportType,
            String status,
            LocalDate dateFrom,
            LocalDate dateTo,
            Pageable pageable) {

        Specification<DueDiligenceReport> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (hasText(reportNumber)) {
                predicates.add(cb.like(cb.lower(root.get("reportNumber")), like(reportNumber)));
            }

            if (hasText(property)) {
                try {
                    Long propertyId = Long.parseLong(property.trim());
                    predicates.add(cb.equal(root.get("propertyId"), propertyId));
                } catch (NumberFormatException ex) {
                    predicates.add(cb.like(cb.lower(root.get("propertyTitle")), like(property)));
                }
            }

            if (hasText(requestedBy)) {
                predicates.add(cb.like(cb.lower(root.get("requestedByName")), like(requestedBy)));
            }

            if (hasText(reportType)) {
                predicates.add(cb.equal(root.get("reportType"), reportType));
            }

            if (hasText(status)) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (dateFrom != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("generatedAt"), dateFrom.atStartOfDay()));
            }

            if (dateTo != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("generatedAt"), dateTo.atTime(LocalTime.MAX)));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return dueDiligenceReportRepository.findAll(spec, pageable);
    }

    @Override
    public ReportHistoryStatsResponse getStats() {
        long total = dueDiligenceReportRepository.count();
        long completed = dueDiligenceReportRepository.countByStatus("COMPLETED");
        long today = dueDiligenceReportRepository.countByGeneratedAtGreaterThanEqual(
                LocalDate.now().atStartOfDay());

        return new ReportHistoryStatsResponse(total, completed, today);
    }

    @Override
    public DueDiligenceReport findByIdOrThrow(Long id) {
        return dueDiligenceReportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found: " + id));
    }

    @Override
    public DueDiligenceReport recordDownload(Long reportId, long fileSizeBytes) {
        DueDiligenceReport report = findByIdOrThrow(reportId);
        applyDownload(report, fileSizeBytes);
        return dueDiligenceReportRepository.save(report);
    }

    @Override
    public DueDiligenceReport recordDownloadForProperty(Long propertyId, long fileSizeBytes) {
        DueDiligenceReport report =
                dueDiligenceReportRepository.findFirstByPropertyIdOrderByGeneratedAtDesc(propertyId);

        if (report == null) {
            return null;
        }

        applyDownload(report, fileSizeBytes);
        return dueDiligenceReportRepository.save(report);
    }

    private void applyDownload(DueDiligenceReport report, long fileSizeBytes) {
        int currentCount = report.getDownloadCount() != null ? report.getDownloadCount() : 0;
        report.setDownloadCount(currentCount + 1);
        report.setFileSizeBytes(fileSizeBytes);
        report.setLastAccessedAt(LocalDateTime.now());
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private String like(String value) {
        return "%" + value.trim().toLowerCase() + "%";
    }
}
