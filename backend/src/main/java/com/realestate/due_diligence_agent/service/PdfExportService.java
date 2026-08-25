package com.realestate.due_diligence_agent.service;

import java.awt.Color;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfPageEventHelper;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import com.realestate.due_diligence_agent.dto.DueDiligenceReportResponse;

import java.io.ByteArrayOutputStream;

/**
 * Renders the due diligence report as a branded PDF that mirrors the
 * "Diligence Ledger" web UI (pages/DueDiligenceReport.jsx): the same navy
 * header band, card sections in the same order, and the same risk-level
 * color language as components/risk/riskConfig.js — rather than a plain,
 * unstyled dump of field/value pairs.
 */
@Service
public class PdfExportService {

    // ---- Palette lifted from the frontend (tailwind arbitrary-value hexes) ----
    private static final Color NAVY = new Color(0x1B, 0x23, 0x38);
    private static final Color NAVY_LIGHT = new Color(0x30, 0x47, 0x63);
    private static final Color GOLD = new Color(0xC8, 0x95, 0x46);
    private static final Color CREAM = new Color(0xF8, 0xF6, 0xF0);
    private static final Color BORDER = new Color(0xE3, 0xDD, 0xCE);
    private static final Color TEXT_MUTED = new Color(0x6B, 0x72, 0x80);
    private static final Color WHITE = Color.WHITE;

    private final DueDiligenceReportService dueDiligenceReportService;

    public PdfExportService(DueDiligenceReportService dueDiligenceReportService) {
        this.dueDiligenceReportService = dueDiligenceReportService;
    }

    public byte[] exportPdf(Long propertyId) {

        DueDiligenceReportResponse report =
                dueDiligenceReportService.generateReport(propertyId);

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 24, 44);

        try {
            PdfWriter writer = PdfWriter.getInstance(document, outputStream);
            writer.setPageEvent(new FooterEvent(report));
            document.open();

            RiskStyle risk = RiskStyle.of(report.getRiskLevel());

            document.add(buildHeader(report, risk));
            document.add(spacer(16));

            document.add(sectionCard("PROPERTY DETAILS", new String[][]{
                    {"Property Type", str(report.getPropertyType())},
                    {"Address", str(report.getAddress())},
                    {"City", str(report.getCity())},
                    {"State", str(report.getState())},
                    {"Area", formatArea(report.getArea())},
                    {"Price", formatCurrency(report.getPrice())},
            }));

            document.add(sectionCard("OWNERSHIP", new String[][]{
                    {"Owner Name", str(report.getOwnerName())},
                    {"Owner Verified", formatBoolean(report.getOwnerVerified(), "Verified", "Not Verified")},
                    {"Ownership Type", str(report.getOwnershipType())},
                    {"Remarks", str(report.getOwnershipRemarks())},
            }));

            document.add(sectionCard("LEGAL RECORDS", new String[][]{
                    {"Court Cases", str(report.getCourtCases())},
                    {"Case Status", str(report.getCaseStatus())},
                    {"Legal Remarks", str(report.getLegalRemarks())},
            }));

            document.add(sectionCard("FLOOD ZONE, TAX & ZONING", new String[][]{
                    {"Flood Risk Level", str(report.getFloodRiskLevel())},
                    {"Latest Tax Status", str(report.getLatestTaxStatus())},
                    {"Zone Type", str(report.getZoneType())},
                    {"Construction Allowed", str(report.getConstructionAllowed())},
            }));

            document.add(spacer(4));
            document.add(recommendationPanel(report, risk));

        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF report", e);
        } finally {
            document.close();
        }

        return outputStream.toByteArray();
    }

    // ---------------------------------------------------------------
    // Header band (mirrors ReportHero.jsx: navy gradient, serif title,
    // address, generated date, risk score + level badge on the right)
    // ---------------------------------------------------------------
    private PdfPTable buildHeader(DueDiligenceReportResponse report, RiskStyle risk) {
        PdfPTable outer = new PdfPTable(1);
        outer.setWidthPercentage(100);

        PdfPTable inner = new PdfPTable(new float[]{68, 32});
        inner.setWidthPercentage(100);

        // Left: brand kicker, title, address, generated date
        PdfPTable left = new PdfPTable(1);
        left.setWidthPercentage(100);
        left.getDefaultCell().setBorder(Rectangle.NO_BORDER);

        Font kickerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, GOLD);
        left.addCell(borderlessCell(new Phrase("D I L I G E N C E   L E D G E R", kickerFont), NAVY_LIGHT, 0));

        Font titleFont = FontFactory.getFont(FontFactory.TIMES_BOLD, 24, WHITE);
        Paragraph title = new Paragraph(str(report.getPropertyTitle(), "Due Diligence Report"), titleFont);
        title.setSpacingBefore(6f);
        PdfPCell titleCell = borderlessCell(title, NAVY_LIGHT, 0);
        left.addCell(titleCell);

        String address = joinNonBlank(", ", report.getAddress(), report.getCity(), report.getState());
        if (!address.isBlank()) {
            Font addrFont = FontFactory.getFont(FontFactory.HELVETICA, 10, new Color(0xCB, 0xD1, 0xDE));
            Paragraph addrPara = new Paragraph(address, addrFont);
            addrPara.setSpacingBefore(4f);
            left.addCell(borderlessCell(addrPara, NAVY_LIGHT, 0));
        }

        Font dateFont = FontFactory.getFont(FontFactory.HELVETICA, 8, new Color(0x9A, 0xA4, 0xB8));
        Paragraph datePara = new Paragraph(
                "Generated " + LocalDate.now().format(DateTimeFormatter.ofPattern("MMMM d, yyyy")),
                dateFont);
        datePara.setSpacingBefore(6f);
        left.addCell(borderlessCell(datePara, NAVY_LIGHT, 0));

        PdfPCell leftWrap = new PdfPCell(left);
        leftWrap.setBorder(Rectangle.NO_BORDER);
        leftWrap.setBackgroundColor(NAVY_LIGHT);
        leftWrap.setPadding(0);
        inner.addCell(leftWrap);

        // Right: risk score + risk level badge, colored per risk level
        PdfPTable right = new PdfPTable(1);
        right.setWidthPercentage(100);
        right.getDefaultCell().setBorder(Rectangle.NO_BORDER);

        Font scoreFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 30, WHITE);
        Object scoreVal = report.getTotalRiskScore();
        Paragraph score = new Paragraph((scoreVal == null ? "—" : scoreVal.toString()) + " / 100", scoreFont);
        score.setAlignment(Element.ALIGN_RIGHT);
        right.addCell(borderlessCell(score, NAVY_LIGHT, 0));

        PdfPCell badge = new PdfPCell(new Phrase(risk.label, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, WHITE)));
        badge.setBackgroundColor(risk.color);
        badge.setBorder(Rectangle.NO_BORDER);
        badge.setPadding(6f);
        badge.setHorizontalAlignment(Element.ALIGN_RIGHT);
        badge.setPaddingRight(10f);
        badge.setPaddingLeft(10f);
        PdfPTable badgeWrap = new PdfPTable(1);
        badgeWrap.setHorizontalAlignment(Element.ALIGN_RIGHT);
        badgeWrap.addCell(badge);
        PdfPCell badgeWrapCell = new PdfPCell(badgeWrap);
        badgeWrapCell.setBorder(Rectangle.NO_BORDER);
        badgeWrapCell.setBackgroundColor(NAVY_LIGHT);
        badgeWrapCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        badgeWrapCell.setPaddingTop(4f);
        right.addCell(badgeWrapCell);

        PdfPCell rightWrap = new PdfPCell(right);
        rightWrap.setBorder(Rectangle.NO_BORDER);
        rightWrap.setBackgroundColor(NAVY_LIGHT);
        rightWrap.setPadding(0);
        rightWrap.setVerticalAlignment(Element.ALIGN_MIDDLE);
        inner.addCell(rightWrap);

        PdfPCell innerWrap = new PdfPCell(inner);
        innerWrap.setBackgroundColor(NAVY);
        innerWrap.setBorder(Rectangle.NO_BORDER);
        innerWrap.setPadding(20f);
        outer.addCell(innerWrap);

        return outer;
    }

    // ---------------------------------------------------------------
    // Section card (mirrors components/report/ReportSectionCard.jsx: a
    // white/cream card with a bordered outline, an uppercase navy title,
    // and label/value rows)
    // ---------------------------------------------------------------
    private PdfPTable sectionCard(String title, String[][] fields) {
        PdfPTable card = new PdfPTable(1);
        card.setWidthPercentage(100);
        card.setSpacingAfter(12f);

        // Title bar
        PdfPTable titleBar = new PdfPTable(1);
        titleBar.setWidthPercentage(100);
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, NAVY);
        Chunk titleChunk = new Chunk(title, titleFont);
        titleChunk.setCharacterSpacing(0.8f);
        PdfPCell titleCell = new PdfPCell(new Phrase(titleChunk));
        titleCell.setBackgroundColor(CREAM);
        titleCell.setBorder(Rectangle.BOX);
        titleCell.setBorderColor(BORDER);
        titleCell.setBorderWidthBottom(0f);
        titleCell.setPadding(9f);
        titleBar.addCell(titleCell);
        card.addCell(wrapNoBorder(titleBar));

        // Field rows
        PdfPTable fieldTable = new PdfPTable(new float[]{32, 68});
        fieldTable.setWidthPercentage(100);

        Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, TEXT_MUTED);
        Font valueFont = FontFactory.getFont(FontFactory.HELVETICA, 10, NAVY);

        for (int i = 0; i < fields.length; i++) {
            boolean last = i == fields.length - 1;
            Color rowBg = i % 2 == 0 ? WHITE : new Color(0xFB, 0xFA, 0xF6);

            PdfPCell labelCell = new PdfPCell(new Phrase(fields[i][0].toUpperCase(Locale.ROOT), labelFont));
            styleFieldCell(labelCell, rowBg, last);
            fieldTable.addCell(labelCell);

            PdfPCell valueCell = new PdfPCell(new Phrase(fields[i][1], valueFont));
            styleFieldCell(valueCell, rowBg, last);
            fieldTable.addCell(valueCell);
        }

        card.addCell(wrapNoBorder(fieldTable));
        return card;
    }

    private void styleFieldCell(PdfPCell cell, Color bg, boolean lastRow) {
        cell.setBackgroundColor(bg);
        cell.setBorder(Rectangle.LEFT | Rectangle.RIGHT | (lastRow ? Rectangle.BOTTOM : 0));
        cell.setBorderColor(BORDER);
        cell.setPadding(8f);
        cell.setVerticalAlignment(Element.ALIGN_TOP);
    }

    // ---------------------------------------------------------------
    // Recommendation panel (mirrors RecommendationPanel.jsx)
    // ---------------------------------------------------------------
    private PdfPTable recommendationPanel(DueDiligenceReportResponse report, RiskStyle risk) {
        PdfPTable panel = new PdfPTable(new float[]{3, 97});
        panel.setWidthPercentage(100);

        PdfPCell accent = new PdfPCell();
        accent.setBackgroundColor(risk.color);
        accent.setBorder(Rectangle.NO_BORDER);
        panel.addCell(accent);

        PdfPTable content = new PdfPTable(1);
        content.setWidthPercentage(100);

        Font headingFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, NAVY);
        content.addCell(borderlessCell(new Phrase("AI Recommendation", headingFont), WHITE, 0));

        Font subFont = FontFactory.getFont(FontFactory.HELVETICA, 8, TEXT_MUTED);
        Chunk subChunk = new Chunk("GENERATED FROM CURRENT RISK SIGNALS", subFont);
        subChunk.setCharacterSpacing(0.6f);
        Paragraph sub = new Paragraph(subChunk);
        sub.setSpacingBefore(2f);
        sub.setSpacingAfter(10f);
        content.addCell(borderlessCell(sub, WHITE, 0));

        Font bodyFont = FontFactory.getFont(FontFactory.TIMES_ROMAN, 13, NAVY);
        String text = str(report.getRecommendation(), "No recommendation available.");
        Paragraph body = new Paragraph(text, bodyFont);
        body.setLeading(19f);
        content.addCell(borderlessCell(body, WHITE, 0));

        PdfPCell contentCell = new PdfPCell(content);
        contentCell.setBackgroundColor(WHITE);
        contentCell.setBorder(Rectangle.TOP | Rectangle.RIGHT | Rectangle.BOTTOM);
        contentCell.setBorderColor(BORDER);
        contentCell.setPadding(16f);
        panel.addCell(contentCell);

        return panel;
    }

    // ---------------------------------------------------------------
    // Small helpers
    // ---------------------------------------------------------------
    private PdfPCell borderlessCell(Phrase phrase, Color bg, int padding) {
        PdfPCell cell = new PdfPCell(phrase);
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setBackgroundColor(bg);
        cell.setPadding(padding);
        return cell;
    }

    private PdfPCell wrapNoBorder(PdfPTable table) {
        PdfPCell cell = new PdfPCell(table);
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(0);
        return cell;
    }

    private PdfPTable spacer(float height) {
        PdfPTable t = new PdfPTable(1);
        t.setWidthPercentage(100);
        PdfPCell c = new PdfPCell();
        c.setBorder(Rectangle.NO_BORDER);
        c.setFixedHeight(height);
        t.addCell(c);
        return t;
    }

    private String str(Object value) {
        return str(value, "—");
    }

    private String str(Object value, String fallback) {
        if (value == null) return fallback;
        String s = value.toString().trim();
        return s.isEmpty() ? fallback : s;
    }

    private String formatBoolean(Boolean value, String whenTrue, String whenFalse) {
        if (value == null) return "—";
        return value ? whenTrue : whenFalse;
    }

    // Matches utils/format.js formatCurrency: "$" + grouped number, no decimals.
    private String formatCurrency(Object value) {
        if (value == null) return "—";
        try {
            double d = Double.parseDouble(value.toString());
            NumberFormat nf = NumberFormat.getIntegerInstance(Locale.US);
            return "$" + nf.format(d);
        } catch (NumberFormatException e) {
            return str(value);
        }
    }

    // Matches utils/format.js formatArea: grouped number + " sqft".
    private String formatArea(Object value) {
        if (value == null) return "—";
        try {
            double d = Double.parseDouble(value.toString());
            NumberFormat nf = NumberFormat.getIntegerInstance(Locale.US);
            return nf.format(d) + " sqft";
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

    /** Risk-level color/label, mirroring components/risk/riskConfig.js. */
    private static final class RiskStyle {
        final Color color;
        final String label;

        private RiskStyle(Color color, String label) {
            this.color = color;
            this.label = label;
        }

        static RiskStyle of(String raw) {
            String key = raw == null ? "MEDIUM" : raw.toUpperCase(Locale.ROOT).replace('_', ' ').trim();
            return switch (key) {
                case "VERY LOW" -> new RiskStyle(new Color(0x2F, 0x64, 0x49), "VERY LOW RISK");
                case "LOW" -> new RiskStyle(new Color(0x3F, 0x76, 0x57), "LOW RISK");
                case "HIGH" -> new RiskStyle(new Color(0xB3, 0x40, 0x2F), "HIGH RISK");
                case "VERY HIGH" -> new RiskStyle(new Color(0x8C, 0x2F, 0x22), "VERY HIGH RISK");
                default -> new RiskStyle(new Color(0xA8, 0x75, 0x2C), "MODERATE RISK");
            };
        }
    }

    /** Footer: report number + page numbers, same on every page. */
    private static final class FooterEvent extends PdfPageEventHelper {
        private final DueDiligenceReportResponse report;

        FooterEvent(DueDiligenceReportResponse report) {
            this.report = report;
        }

        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            Font footerFont = FontFactory.getFont(FontFactory.HELVETICA, 8, TEXT_MUTED);
            Phrase left = new Phrase(
                    "Diligence Ledger · Property ID " + report.getPropertyId(), footerFont);
            Phrase right = new Phrase("Page " + writer.getPageNumber(), footerFont);

            com.lowagie.text.pdf.ColumnText.showTextAligned(
                    writer.getDirectContent(), Element.ALIGN_LEFT, left,
                    document.left(), document.bottom() - 18, 0);
            com.lowagie.text.pdf.ColumnText.showTextAligned(
                    writer.getDirectContent(), Element.ALIGN_RIGHT, right,
                    document.right(), document.bottom() - 18, 0);
        }
    }
}
