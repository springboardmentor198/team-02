package com.realestate.due_diligence_agent.controller;

import java.time.LocalDate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.due_diligence_agent.dto.PageResponse;
import com.realestate.due_diligence_agent.dto.ReportHistoryStatsResponse;
import com.realestate.due_diligence_agent.entity.AuditLog;
import com.realestate.due_diligence_agent.entity.DueDiligenceReport;
import com.realestate.due_diligence_agent.entity.User;
import com.realestate.due_diligence_agent.service.AuditLogService;
import com.realestate.due_diligence_agent.service.ExcelExportService;
import com.realestate.due_diligence_agent.service.PdfExportService;
import com.realestate.due_diligence_agent.service.ReportHistoryService;
import com.realestate.due_diligence_agent.service.UserService;

/**
 * Task 7 — Report History (read + download side). Every row here is a
 * DueDiligenceReport already written by DueDiligenceReportServiceImpl when
 * a report is generated (see that class for reportNumber/requestedBy
 * population). Downloads go through the same PdfExportService /
 * ExcelExportService the existing per-property /api/export/** routes use —
 * this controller just also records the download against report history and
 * writes an audit log entry, which the plain /api/export/** routes do too
 * (see ExportController).
 */
@RestController
@RequestMapping("/api/report-history")
public class ReportHistoryController {

    private final ReportHistoryService reportHistoryService;
    private final PdfExportService pdfExportService;
    private final ExcelExportService excelExportService;
    private final AuditLogService auditLogService;
    private final UserService userService;

    public ReportHistoryController(
            ReportHistoryService reportHistoryService,
            PdfExportService pdfExportService,
            ExcelExportService excelExportService,
            AuditLogService auditLogService,
            UserService userService) {
        this.reportHistoryService = reportHistoryService;
        this.pdfExportService = pdfExportService;
        this.excelExportService = excelExportService;
        this.auditLogService = auditLogService;
        this.userService = userService;
    }

    @GetMapping({"", "/search"})
    public ResponseEntity<PageResponse<DueDiligenceReport>> list(
            @RequestParam(required = false) String reportNumber,
            @RequestParam(required = false) String property,
            @RequestParam(required = false) String requestedBy,
            @RequestParam(required = false) String reportType,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "generatedAt"));

        Page<DueDiligenceReport> result = reportHistoryService.search(
                reportNumber, property, requestedBy, reportType, status, dateFrom, dateTo, pageable);

        return ResponseEntity.ok(PageResponse.from(result));
    }

    @GetMapping("/stats")
    public ResponseEntity<ReportHistoryStatsResponse> stats() {
        return ResponseEntity.ok(reportHistoryService.getStats());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DueDiligenceReport> getById(@PathVariable Long id) {
        return ResponseEntity.ok(reportHistoryService.findByIdOrThrow(id));
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable Long id) {
        DueDiligenceReport report = reportHistoryService.findByIdOrThrow(id);
        byte[] pdf = pdfExportService.exportPdf(report.getPropertyId());

        reportHistoryService.recordDownload(id, pdf.length);
        logDownload(report, "PDF");

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=" + report.getReportNumber() + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/{id}/excel")
    public ResponseEntity<byte[]> downloadExcel(@PathVariable Long id) {
        DueDiligenceReport report = reportHistoryService.findByIdOrThrow(id);
        byte[] excel = excelExportService.exportExcel(report.getPropertyId());

        reportHistoryService.recordDownload(id, excel.length);
        logDownload(report, "Excel");

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=" + report.getReportNumber() + ".xlsx")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excel);
    }

    private void logDownload(DueDiligenceReport report, String format) {
        try {
            User user = userService.getLoggedInUser();

            AuditLog entry = new AuditLog();
            entry.setUserId(user.getId());
            entry.setUsername(user.getFullName());
            entry.setRole(user.getRole().name());
            entry.setPropertyId(report.getPropertyId());
            entry.setAction("DOWNLOAD_REPORT");
            entry.setModule("Report History");
            entry.setEntityType("REPORT");
            entry.setEntityId(report.getId());
            entry.setStatus("SUCCESS");
            entry.setDescription("Downloaded " + format + " for report " + report.getReportNumber());

            auditLogService.record(entry);
        } catch (Exception ignored) {
            // Audit logging should never block a download the export itself
            // already succeeded at.
        }
    }
}
