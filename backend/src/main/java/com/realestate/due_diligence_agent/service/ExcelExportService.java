package com.realestate.due_diligence_agent.service;

import com.realestate.due_diligence_agent.dto.DueDiligenceReportResponse;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
public class ExcelExportService {

    private final DueDiligenceReportService dueDiligenceReportService;

    public ExcelExportService(DueDiligenceReportService dueDiligenceReportService) {
        this.dueDiligenceReportService = dueDiligenceReportService;
    }

    public byte[] exportExcel(Long propertyId) {

        DueDiligenceReportResponse report =
                dueDiligenceReportService.generateReport(propertyId);

        try (
                XSSFWorkbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream outputStream = new ByteArrayOutputStream()
        ) {

            XSSFSheet sheet = workbook.createSheet("Due Diligence Report");

            int rowNum = 0;

            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Field");
            row.createCell(1).setCellValue("Value");

            // =========================
            // Property Details
            // =========================

            row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Property ID");
            row.createCell(1).setCellValue(report.getPropertyId());

            row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Property Title");
            row.createCell(1).setCellValue(report.getPropertyTitle());

            row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Owner");
            row.createCell(1).setCellValue(report.getOwnerName());

            row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Property Type");
            row.createCell(1).setCellValue(report.getPropertyType());

            row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Address");
            row.createCell(1).setCellValue(report.getAddress());

            row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue("City");
            row.createCell(1).setCellValue(report.getCity());

            row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue("State");
            row.createCell(1).setCellValue(report.getState());

            row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Area");
            row.createCell(1).setCellValue(report.getArea());

            row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Price");
            row.createCell(1).setCellValue(report.getPrice());

            // =========================
            // Ownership
            // =========================

            row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Owner Verified");
            row.createCell(1).setCellValue(
                    report.getOwnerVerified() == null ? "N/A"
                            : report.getOwnerVerified().toString());

            row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Ownership Type");
            row.createCell(1).setCellValue(
                    report.getOwnershipType() == null ? "N/A"
                            : report.getOwnershipType());

            row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Ownership Remarks");
            row.createCell(1).setCellValue(
                    report.getOwnershipRemarks() == null ? "N/A"
                            : report.getOwnershipRemarks());

            // =========================
            // Legal
            // =========================

            row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Court Cases");
            row.createCell(1).setCellValue(
                    report.getCourtCases() == null ? "N/A"
                            : report.getCourtCases());

            row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Case Status");
            row.createCell(1).setCellValue(
                    report.getCaseStatus() == null ? "N/A"
                            : report.getCaseStatus());

            row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Legal Remarks");
            row.createCell(1).setCellValue(
                    report.getLegalRemarks() == null ? "N/A"
                            : report.getLegalRemarks());

            // =========================
            // Flood Zone
            // =========================

            row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Flood Risk Level");
            row.createCell(1).setCellValue(
                    report.getFloodRiskLevel() == null ? "N/A"
                            : report.getFloodRiskLevel());

            // =========================
            // Tax
            // =========================

            row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Latest Tax Status");
            row.createCell(1).setCellValue(
                    report.getLatestTaxStatus() == null ? "N/A"
                            : report.getLatestTaxStatus());

            // =========================
            // Zoning
            // =========================

            row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Zone Type");
            row.createCell(1).setCellValue(
                    report.getZoneType() == null ? "N/A"
                            : report.getZoneType());

            row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Construction Allowed");
            row.createCell(1).setCellValue(
                    report.getConstructionAllowed() == null ? "N/A"
                            : report.getConstructionAllowed().toString());

            // =========================
            // Risk Assessment
            // =========================

            row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Risk Score");
            row.createCell(1).setCellValue(
                    report.getTotalRiskScore() == null ? "N/A"
                            : report.getTotalRiskScore().toString());

            row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Risk Level");
            row.createCell(1).setCellValue(
                    report.getRiskLevel() == null ? "N/A"
                            : report.getRiskLevel());

            row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Recommendation");
            row.createCell(1).setCellValue(
                    report.getRecommendation() == null ? "N/A"
                            : report.getRecommendation());

            // Auto-size columns
            sheet.autoSizeColumn(0);
            sheet.autoSizeColumn(1);

            workbook.write(outputStream);

            return outputStream.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error generating Excel report", e);
        }
    }
}