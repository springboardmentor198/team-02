package com.realestate.due_diligence_agent.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import com.realestate.due_diligence_agent.dto.DueDiligenceReportResponse;

import java.awt.Color;
import java.io.ByteArrayOutputStream;

/**
 * Renders the due diligence report as a branded Excel workbook that mirrors
 * the "Diligence Ledger" web UI (pages/DueDiligenceReport.jsx) — a title
 * band, a risk summary strip colored per risk level (see
 * components/risk/riskConfig.js), and the same section groupings — rather
 * than a bare two-column "Field / Value" dump.
 */
@Service
public class ExcelExportService {

    private static final Color NAVY = new Color(0x1B, 0x23, 0x38);
    private static final Color NAVY_LIGHT = new Color(0x30, 0x47, 0x63);
    private static final Color GOLD = new Color(0xC8, 0x95, 0x46);
    private static final Color CREAM = new Color(0xF8, 0xF6, 0xF0);
    private static final Color BORDER = new Color(0xE3, 0xDD, 0xCE);
    private static final Color TEXT_MUTED = new Color(0x6B, 0x72, 0x80);
    private static final Color ROW_ALT = new Color(0xFB, 0xFA, 0xF6);
    private static final Color WHITE = Color.WHITE;

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
            sheet.setColumnWidth(0, 32 * 256);
            sheet.setColumnWidth(1, 60 * 256);
            sheet.setDisplayGridlines(false);

            Styles styles = new Styles(workbook);
            RiskStyle risk = RiskStyle.of(report.getRiskLevel());

            int r = 0;
            r = writeTitleBand(sheet, styles, report, r);
            r = writeRiskStrip(sheet, styles, workbook, report, risk, r);
            r++;

            r = writeSection(sheet, styles, "PROPERTY DETAILS", r, List.of(
                    new String[]{"Property Type", str(report.getPropertyType())},
                    new String[]{"Address", str(report.getAddress())},
                    new String[]{"City", str(report.getCity())},
                    new String[]{"State", str(report.getState())},
                    new String[]{"Area", formatArea(report.getArea())},
                    new String[]{"Price", formatCurrency(report.getPrice())}
            ));

            r = writeSection(sheet, styles, "OWNERSHIP", r, List.of(
                    new String[]{"Owner Name", str(report.getOwnerName())},
                    new String[]{"Owner Verified", formatBoolean(report.getOwnerVerified())},
                    new String[]{"Ownership Type", str(report.getOwnershipType())},
                    new String[]{"Remarks", str(report.getOwnershipRemarks())}
            ));

            r = writeSection(sheet, styles, "LEGAL RECORDS", r, List.of(
                    new String[]{"Court Cases", str(report.getCourtCases())},
                    new String[]{"Case Status", str(report.getCaseStatus())},
                    new String[]{"Legal Remarks", str(report.getLegalRemarks())}
            ));

            r = writeSection(sheet, styles, "FLOOD ZONE, TAX & ZONING", r, List.of(
                    new String[]{"Flood Risk Level", str(report.getFloodRiskLevel())},
                    new String[]{"Latest Tax Status", str(report.getLatestTaxStatus())},
                    new String[]{"Zone Type", str(report.getZoneType())},
                    new String[]{"Construction Allowed", str(report.getConstructionAllowed())}
            ));

            r++;
            writeRecommendation(sheet, styles, report, risk, r);

            workbook.write(outputStream);
            return outputStream.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error generating Excel report", e);
        }
    }

    // ---------------------------------------------------------------
    private int writeTitleBand(XSSFSheet sheet, Styles styles, DueDiligenceReportResponse report, int r) {
        Row kicker = sheet.createRow(r++);
        kicker.setHeightInPoints(16);
        setCell(kicker, 0, "DILIGENCE LEDGER", styles.kicker);
        setCell(kicker, 1, "", styles.navyBg);

        Row titleRow = sheet.createRow(r++);
        titleRow.setHeightInPoints(28);
        setCell(titleRow, 0, str(report.getPropertyTitle(), "Due Diligence Report"), styles.title);
        setCell(titleRow, 1, "", styles.navyBg);
        sheet.addMergedRegion(new CellRangeAddress(titleRow.getRowNum(), titleRow.getRowNum(), 0, 1));

        String address = joinNonBlank(", ", report.getAddress(), report.getCity(), report.getState());
        Row addrRow = sheet.createRow(r++);
        addrRow.setHeightInPoints(16);
        setCell(addrRow, 0, address.isBlank() ? " " : address, styles.subtitle);
        setCell(addrRow, 1, "", styles.navyBg);
        sheet.addMergedRegion(new CellRangeAddress(addrRow.getRowNum(), addrRow.getRowNum(), 0, 1));

        Row dateRow = sheet.createRow(r++);
        dateRow.setHeightInPoints(16);
        setCell(dateRow, 0, "Generated " + LocalDate.now().format(DateTimeFormatter.ofPattern("MMMM d, yyyy")), styles.dateMuted);
        setCell(dateRow, 1, "", styles.navyBg);
        sheet.addMergedRegion(new CellRangeAddress(dateRow.getRowNum(), dateRow.getRowNum(), 0, 1));

        return r;
    }

    private int writeRiskStrip(XSSFSheet sheet, Styles styles, XSSFWorkbook workbook,
                                DueDiligenceReportResponse report, RiskStyle risk, int r) {
        CellStyle riskLabelStyle = riskCellStyle(workbook, risk, true, false);
        CellStyle riskValueStyle = riskCellStyle(workbook, risk, false, false);

        Row row = sheet.createRow(r++);
        row.setHeightInPoints(22);
        Object score = report.getTotalRiskScore();
        setCell(row, 0, "RISK SCORE", riskLabelStyle);
        setCell(row, 1, (score == null ? "—" : score.toString()) + " / 100  ·  " + risk.label, riskValueStyle);

        return r;
    }

    private void writeRecommendation(XSSFSheet sheet, Styles styles, DueDiligenceReportResponse report,
                                      RiskStyle risk, int r) {
        Row heading = sheet.createRow(r++);
        heading.setHeightInPoints(18);
        setCell(heading, 0, "AI RECOMMENDATION", styles.sectionTitle);
        setCell(heading, 1, "", styles.sectionTitle);
        sheet.addMergedRegion(new CellRangeAddress(heading.getRowNum(), heading.getRowNum(), 0, 1));

        Row sub = sheet.createRow(r++);
        setCell(sub, 0, "Generated from current risk signals", styles.dateMutedLight);
        setCell(sub, 1, "", styles.dateMutedLight);
        sheet.addMergedRegion(new CellRangeAddress(sub.getRowNum(), sub.getRowNum(), 0, 1));

        Row body = sheet.createRow(r);
        body.setHeightInPoints(48);
        String text = str(report.getRecommendation(), "No recommendation available.");
        setCell(body, 0, text, styles.recommendationBody);
        setCell(body, 1, "", styles.recommendationBody);
        sheet.addMergedRegion(new CellRangeAddress(body.getRowNum(), body.getRowNum(), 0, 1));
    }

    private int writeSection(XSSFSheet sheet, Styles styles, String title, int r, List<String[]> fields) {
        Row titleRow = sheet.createRow(r++);
        titleRow.setHeightInPoints(20);
        setCell(titleRow, 0, title, styles.sectionTitle);
        setCell(titleRow, 1, "", styles.sectionTitle);
        sheet.addMergedRegion(new CellRangeAddress(titleRow.getRowNum(), titleRow.getRowNum(), 0, 1));

        for (int i = 0; i < fields.size(); i++) {
            Row row = sheet.createRow(r++);
            row.setHeightInPoints(18);
            CellStyle labelStyle = i % 2 == 0 ? styles.labelWhite : styles.labelAlt;
            CellStyle valueStyle = i % 2 == 0 ? styles.valueWhite : styles.valueAlt;
            setCell(row, 0, fields.get(i)[0].toUpperCase(Locale.ROOT), labelStyle);
            setCell(row, 1, fields.get(i)[1], valueStyle);
        }
        r++; // blank spacer row between sections
        return r;
    }

    private void setCell(Row row, int col, String value, CellStyle style) {
        Cell cell = row.createCell(col);
        cell.setCellValue(value);
        cell.setCellStyle(style);
    }

    private CellStyle riskCellStyle(XSSFWorkbook workbook, RiskStyle risk, boolean label, boolean bold) {
        XSSFCellStyle style = workbook.createCellStyle();
        style.setFillForegroundColor(toXssfColor(risk.bg));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        XSSFColor borderColor = toXssfColor(risk.border);
        style.setTopBorderColor(borderColor);
        style.setBottomBorderColor(borderColor);
        style.setLeftBorderColor(borderColor);
        style.setRightBorderColor(borderColor);
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) (label ? 9 : 11));
        style.setFont(font);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setIndention((short) 1);
        // Font color uses the risk accent color directly.
        XSSFFontColorHelper.setColor(workbook, style, risk.color);
        return style;
    }

    private String str(Object value) {
        return str(value, "—");
    }

    private String str(Object value, String fallback) {
        if (value == null) return fallback;
        String s = value.toString().trim();
        return s.isEmpty() ? fallback : s;
    }

    private String formatBoolean(Boolean value) {
        if (value == null) return "—";
        return value ? "Verified" : "Not Verified";
    }

    private String formatCurrency(Object value) {
        if (value == null) return "—";
        try {
            double d = Double.parseDouble(value.toString());
            return "$" + String.format(Locale.US, "%,.0f", d);
        } catch (NumberFormatException e) {
            return str(value);
        }
    }

    private String formatArea(Object value) {
        if (value == null) return "—";
        try {
            double d = Double.parseDouble(value.toString());
            return String.format(Locale.US, "%,.0f", d) + " sqft";
        } catch (NumberFormatException e) {
            return str(value);
        }
    }

    private String joinNonBlank(String sep, String... parts) {
        StringBuilder sb = new StringBuilder();
        for (String p : parts) {
            if (p != null && !p.isBlank()) {
                if (sb.length() > 0) sb.append(sep);
                sb.append(p.trim());
            }
        }
        return sb.toString();
    }

    private static XSSFColor toXssfColor(Color c) {
        return new XSSFColor(c, null);
    }

    /** Risk-level color/label/background, mirroring components/risk/riskConfig.js. */
    private static final class RiskStyle {
        final Color color;
        final Color bg;
        final Color border;
        final String label;

        private RiskStyle(Color color, Color bg, Color border, String label) {
            this.color = color;
            this.bg = bg;
            this.border = border;
            this.label = label;
        }

        static RiskStyle of(String raw) {
            String key = raw == null ? "MEDIUM" : raw.toUpperCase(Locale.ROOT).replace('_', ' ').trim();
            return switch (key) {
                case "VERY LOW" -> new RiskStyle(new Color(0x2F, 0x64, 0x49), new Color(0xED, 0xF5, 0xEE), new Color(0xCF, 0xE3, 0xD4), "VERY LOW RISK");
                case "LOW" -> new RiskStyle(new Color(0x3F, 0x76, 0x57), new Color(0xED, 0xF5, 0xEE), new Color(0xCF, 0xE3, 0xD4), "LOW RISK");
                case "HIGH" -> new RiskStyle(new Color(0xB3, 0x40, 0x2F), new Color(0xFB, 0xED, 0xE9), new Color(0xEF, 0xD3, 0xCB), "HIGH RISK");
                case "VERY HIGH" -> new RiskStyle(new Color(0x8C, 0x2F, 0x22), new Color(0xFB, 0xED, 0xE9), new Color(0xEF, 0xD3, 0xCB), "VERY HIGH RISK");
                default -> new RiskStyle(new Color(0xA8, 0x75, 0x2C), new Color(0xFB, 0xF3, 0xE4), new Color(0xEE, 0xDF, 0xC3), "MODERATE RISK");
            };
        }
    }

    /** All reusable cell styles, built once per workbook. */
    private static final class Styles {
        final CellStyle kicker;
        final CellStyle title;
        final CellStyle subtitle;
        final CellStyle dateMuted;
        final CellStyle dateMutedLight;
        final CellStyle navyBg;
        final CellStyle sectionTitle;
        final CellStyle labelWhite;
        final CellStyle labelAlt;
        final CellStyle valueWhite;
        final CellStyle valueAlt;
        final CellStyle recommendationBody;

        Styles(XSSFWorkbook wb) {
            navyBg = solid(wb, NAVY_LIGHT, null, 10, false, WHITE);

            Font kickerFont = wb.createFont();
            kickerFont.setBold(true);
            kickerFont.setFontHeightInPoints((short) 8);
            XSSFCellStyle kickerStyle = wb.createCellStyle();
            kickerStyle.setFillForegroundColor(toXssfColor(NAVY_LIGHT));
            kickerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            kickerStyle.setFont(kickerFont);
            XSSFFontColorHelper.setColor(wb, kickerStyle, GOLD);
            kicker = kickerStyle;

            title = solid(wb, NAVY_LIGHT, null, 16, true, WHITE);
            subtitle = solid(wb, NAVY_LIGHT, null, 10, false, new Color(0xCB, 0xD1, 0xDE));
            dateMuted = solid(wb, NAVY_LIGHT, null, 8, false, new Color(0x9A, 0xA4, 0xB8));
            dateMutedLight = solid(wb, WHITE, null, 8, false, TEXT_MUTED);

            sectionTitle = solid(wb, CREAM, BORDER, 10, true, NAVY);

            labelWhite = fieldStyle(wb, WHITE, true);
            labelAlt = fieldStyle(wb, ROW_ALT, true);
            valueWhite = fieldStyle(wb, WHITE, false);
            valueAlt = fieldStyle(wb, ROW_ALT, false);

            XSSFCellStyle rec = (XSSFCellStyle) solid(wb, WHITE, BORDER, 12, false, NAVY);
            rec.setWrapText(true);
            rec.setVerticalAlignment(VerticalAlignment.TOP);
            recommendationBody = rec;
        }

        private CellStyle fieldStyle(XSSFWorkbook wb, Color bg, boolean label) {
            XSSFCellStyle style = wb.createCellStyle();
            style.setFillForegroundColor(toXssfColor(bg));
            style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            style.setBorderLeft(BorderStyle.THIN);
            style.setBorderRight(BorderStyle.THIN);
            style.setLeftBorderColor(toXssfColor(BORDER));
            style.setRightBorderColor(toXssfColor(BORDER));
            Font font = wb.createFont();
            font.setFontHeightInPoints((short) (label ? 9 : 10));
            font.setBold(label);
            style.setFont(font);
            XSSFFontColorHelper.setColor(wb, style, label ? TEXT_MUTED : NAVY);
            style.setVerticalAlignment(VerticalAlignment.CENTER);
            style.setWrapText(!label);
            return style;
        }

        private CellStyle solid(XSSFWorkbook wb, Color bg, Color border, int fontSize, boolean bold, Color fontColor) {
            XSSFCellStyle style = wb.createCellStyle();
            style.setFillForegroundColor(toXssfColor(bg));
            style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            if (border != null) {
                style.setBorderTop(BorderStyle.THIN);
                style.setBorderBottom(BorderStyle.THIN);
                style.setBorderLeft(BorderStyle.THIN);
                style.setBorderRight(BorderStyle.THIN);
                XSSFColor bc = toXssfColor(border);
                style.setTopBorderColor(bc);
                style.setBottomBorderColor(bc);
                style.setLeftBorderColor(bc);
                style.setRightBorderColor(bc);
            }
            Font font = wb.createFont();
            font.setFontHeightInPoints((short) fontSize);
            font.setBold(bold);
            style.setFont(font);
            XSSFFontColorHelper.setColor(wb, style, fontColor);
            style.setVerticalAlignment(VerticalAlignment.CENTER);
            return style;
        }
    }

    /**
     * Font color has to be set on the underlying XSSFFont (not the cell
     * style) for a custom RGB — routed through a tiny helper so callers
     * don't have to re-create/re-fetch the font each time.
     */
    private static final class XSSFFontColorHelper {
        static void setColor(XSSFWorkbook wb, XSSFCellStyle style, Color color) {
            org.apache.poi.xssf.usermodel.XSSFFont font = (org.apache.poi.xssf.usermodel.XSSFFont) style.getFont();
            org.apache.poi.xssf.usermodel.XSSFFont newFont = wb.createFont();
            newFont.setBold(font.getBold());
            newFont.setFontHeightInPoints(font.getFontHeightInPoints());
            newFont.setColor(new XSSFColor(color, null));
            style.setFont(newFont);
        }
    }

}
