package com.realestate.due_diligence_agent.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

// Doubles as the Report History table for Task 7 — every generated report
// already lands a row here (see DueDiligenceReportServiceImpl), so Report
// History is just this same table read back with a global, cross-property
// view instead of the per-property one DueDiligenceReportController already
// exposes. Kept as one table rather than a second one to avoid two sources
// of truth for "reports that were generated".
@Entity
@Table(name = "due_diligence_reports")
public class DueDiligenceReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long propertyId;

    private String propertyTitle;

    private String ownerName;

    private Integer totalRiskScore;

    private String riskLevel;

    @Column(length = 1000)
    private String recommendation;

    private LocalDateTime generatedAt;

    // ===== Task 7: Report History =====

    @Column(unique = true)
    private String reportNumber;

    private Long requestedByUserId;

    private String requestedByName;

    // Currently always "DUE_DILIGENCE" — kept as a free string rather than
    // an enum since every export type this platform produces today derives
    // from the same due diligence report; a future report type can just
    // start passing a different value.
    private String reportType;

    // Populated the first time the report is actually downloaded (see
    // ExportController) — a generated-but-never-downloaded report has no
    // file yet, so this starts null rather than 0.
    private Long fileSizeBytes;

    private Integer downloadCount = 0;

    private LocalDateTime lastAccessedAt;

    // COMPLETED | FAILED | PROCESSING
    private String status;

    public DueDiligenceReport() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPropertyId() {
        return propertyId;
    }

    public void setPropertyId(Long propertyId) {
        this.propertyId = propertyId;
    }

    public String getPropertyTitle() {
        return propertyTitle;
    }

    public void setPropertyTitle(String propertyTitle) {
        this.propertyTitle = propertyTitle;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public Integer getTotalRiskScore() {
        return totalRiskScore;
    }

    public void setTotalRiskScore(Integer totalRiskScore) {
        this.totalRiskScore = totalRiskScore;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public String getRecommendation() {
        return recommendation;
    }

    public void setRecommendation(String recommendation) {
        this.recommendation = recommendation;
    }

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(LocalDateTime generatedAt) {
        this.generatedAt = generatedAt;
    }

    public String getReportNumber() {
        return reportNumber;
    }

    public void setReportNumber(String reportNumber) {
        this.reportNumber = reportNumber;
    }

    public Long getRequestedByUserId() {
        return requestedByUserId;
    }

    public void setRequestedByUserId(Long requestedByUserId) {
        this.requestedByUserId = requestedByUserId;
    }

    public String getRequestedByName() {
        return requestedByName;
    }

    public void setRequestedByName(String requestedByName) {
        this.requestedByName = requestedByName;
    }

    public String getReportType() {
        return reportType;
    }

    public void setReportType(String reportType) {
        this.reportType = reportType;
    }

    public Long getFileSizeBytes() {
        return fileSizeBytes;
    }

    public void setFileSizeBytes(Long fileSizeBytes) {
        this.fileSizeBytes = fileSizeBytes;
    }

    public Integer getDownloadCount() {
        return downloadCount;
    }

    public void setDownloadCount(Integer downloadCount) {
        this.downloadCount = downloadCount;
    }

    public LocalDateTime getLastAccessedAt() {
        return lastAccessedAt;
    }

    public void setLastAccessedAt(LocalDateTime lastAccessedAt) {
        this.lastAccessedAt = lastAccessedAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
