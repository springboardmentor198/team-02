package com.realestate.due_diligence_agent.service;

import java.time.LocalDate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.realestate.due_diligence_agent.dto.ReportHistoryStatsResponse;
import com.realestate.due_diligence_agent.entity.DueDiligenceReport;

public interface ReportHistoryService {

    Page<DueDiligenceReport> search(
            String reportNumber,
            String property,
            String requestedBy,
            String reportType,
            String status,
            LocalDate dateFrom,
            LocalDate dateTo,
            Pageable pageable);

    ReportHistoryStatsResponse getStats();

    DueDiligenceReport findByIdOrThrow(Long id);

    /**
     * Called after a PDF/Excel export actually succeeds — bumps download
     * count, stamps lastAccessedAt, and records the file size of whichever
     * export was just produced.
     */
    DueDiligenceReport recordDownload(Long reportId, long fileSizeBytes);

    /**
     * Same as recordDownload, but keyed by propertyId — used by
     * ExportController's existing /api/export/{pdf|excel}/{propertyId}
     * routes, which only know the property, not a specific report id. Finds
     * that property's most recently generated report and updates it.
     */
    DueDiligenceReport recordDownloadForProperty(Long propertyId, long fileSizeBytes);
}
