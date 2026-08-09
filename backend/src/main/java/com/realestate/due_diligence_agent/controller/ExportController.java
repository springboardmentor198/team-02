package com.realestate.due_diligence_agent.controller;

import com.realestate.due_diligence_agent.entity.AuditLog;
import com.realestate.due_diligence_agent.entity.DueDiligenceReport;
import com.realestate.due_diligence_agent.entity.User;
import com.realestate.due_diligence_agent.service.AuditLogService;
import com.realestate.due_diligence_agent.service.ExcelExportService;
import com.realestate.due_diligence_agent.service.PdfExportService;
import com.realestate.due_diligence_agent.service.ReportHistoryService;
import com.realestate.due_diligence_agent.service.UserService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/export")
public class ExportController {

    private final PdfExportService pdfExportService;
    private final ExcelExportService excelExportService;
    private final ReportHistoryService reportHistoryService;
    private final AuditLogService auditLogService;
    private final UserService userService;

    public ExportController(
            PdfExportService pdfExportService,
            ExcelExportService excelExportService,
            ReportHistoryService reportHistoryService,
            AuditLogService auditLogService,
            UserService userService) {

        this.pdfExportService = pdfExportService;
        this.excelExportService = excelExportService;
        this.reportHistoryService = reportHistoryService;
        this.auditLogService = auditLogService;
        this.userService = userService;
    }

    @GetMapping("/pdf/{propertyId}")
    public ResponseEntity<byte[]> exportPdf(
            @PathVariable Long propertyId) {

        byte[] pdf = pdfExportService.exportPdf(propertyId);

        trackDownload(propertyId, pdf.length, "PDF");

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=DueDiligenceReport.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/excel/{propertyId}")
    public ResponseEntity<byte[]> exportExcel(
            @PathVariable Long propertyId) {

        byte[] excel = excelExportService.exportExcel(propertyId);

        trackDownload(propertyId, excel.length, "Excel");

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=DueDiligenceReport.xlsx")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excel);
    }

    // Task 7: records the download against report history (count, file
    // size, last accessed) and writes an audit log entry, without letting
    // either of those failing take down a download that already succeeded.
    private void trackDownload(Long propertyId, long fileSizeBytes, String format) {
        try {
            DueDiligenceReport report =
                    reportHistoryService.recordDownloadForProperty(propertyId, fileSizeBytes);

            User user = userService.getLoggedInUser();

            AuditLog entry = new AuditLog();
            entry.setUserId(user.getId());
            entry.setUsername(user.getFullName());
            entry.setRole(user.getRole().name());
            entry.setPropertyId(propertyId);
            entry.setAction("DOWNLOAD_REPORT");
            entry.setModule("Report History");
            entry.setEntityType("REPORT");
            entry.setStatus("SUCCESS");

            if (report != null) {
                entry.setEntityId(report.getId());
                entry.setDescription("Downloaded " + format + " for report " + report.getReportNumber());
            } else {
                entry.setDescription("Downloaded " + format + " for property ID " + propertyId);
            }

            auditLogService.record(entry);
        } catch (Exception ignored) {
            // Never fail a successful export because tracking/logging it failed.
        }
    }
}
