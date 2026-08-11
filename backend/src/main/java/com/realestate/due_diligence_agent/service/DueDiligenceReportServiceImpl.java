package com.realestate.due_diligence_agent.service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.realestate.due_diligence_agent.dto.DueDiligenceReportResponse;
import com.realestate.due_diligence_agent.entity.AuditLog;
import com.realestate.due_diligence_agent.entity.DueDiligenceReport;
import com.realestate.due_diligence_agent.entity.FloodZone;
import com.realestate.due_diligence_agent.entity.LegalRecord;
import com.realestate.due_diligence_agent.entity.Ownership;
import com.realestate.due_diligence_agent.entity.Property;
import com.realestate.due_diligence_agent.entity.PropertyTaxHistory;
import com.realestate.due_diligence_agent.entity.RiskAssessment;
import com.realestate.due_diligence_agent.entity.User;
import com.realestate.due_diligence_agent.entity.Zoning;
import com.realestate.due_diligence_agent.notification.NotificationService;
import com.realestate.due_diligence_agent.repository.DueDiligenceReportRepository;
import com.realestate.due_diligence_agent.repository.FloodZoneRepository;
import com.realestate.due_diligence_agent.repository.LegalRecordRepository;
import com.realestate.due_diligence_agent.repository.OwnershipRepository;
import com.realestate.due_diligence_agent.repository.PropertyRepository;
import com.realestate.due_diligence_agent.repository.PropertyTaxHistoryRepository;
import com.realestate.due_diligence_agent.repository.RiskAssessmentRepository;
import com.realestate.due_diligence_agent.repository.ZoningRepository;

@Service
public class DueDiligenceReportServiceImpl implements DueDiligenceReportService {

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private OwnershipRepository ownershipRepository;

    @Autowired
    private LegalRecordRepository legalRecordRepository;

    @Autowired
    private FloodZoneRepository floodZoneRepository;

    @Autowired
    private PropertyTaxHistoryRepository propertyTaxHistoryRepository;

    @Autowired
    private ZoningRepository zoningRepository;

    @Autowired
    private RiskAssessmentRepository riskAssessmentRepository;

    @Autowired
    private DueDiligenceReportRepository dueDiligenceReportRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private UserService userService;

    @Autowired
    private NotificationService notificationService;

    @Override
    public DueDiligenceReportResponse generateReport(Long propertyId) {

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        DueDiligenceReportResponse response = new DueDiligenceReportResponse();

        // Property Details
        response.setPropertyId(property.getId());
        response.setPropertyTitle(property.getTitle());
        response.setOwnerName(property.getOwnerName());
        response.setPropertyType(property.getPropertyType());
        response.setAddress(property.getAddress());
        response.setCity(property.getCity());
        response.setState(property.getState());
        response.setArea(property.getArea());
        response.setPrice(property.getPrice());

        // Ownership
        ownershipRepository.findByPropertyId(propertyId).ifPresent(ownership -> {
            response.setOwnerVerified(ownership.isOwnerVerified());
            response.setOwnershipType(ownership.getOwnershipType());
            response.setOwnershipRemarks(ownership.getRemarks());
        });

        // Legal Record
        legalRecordRepository.findByPropertyId(propertyId).ifPresent(legal -> {
            response.setCourtCases(legal.getCourtCases());
            response.setCaseStatus(legal.getCaseStatus());
            response.setLegalRemarks(legal.getRemarks());
        });

        // Flood Zone
        floodZoneRepository.findByPropertyId(propertyId).ifPresent(flood ->
                response.setFloodRiskLevel(flood.getRiskLevel())
        );

        // Tax History
        List<PropertyTaxHistory> taxes =
                propertyTaxHistoryRepository.findByPropertyId(propertyId);

        taxes.stream()
                .max(Comparator.comparing(PropertyTaxHistory::getTaxYear))
                .ifPresent(latest ->
                        response.setLatestTaxStatus(latest.getPaymentStatus()));

        // Zoning
        zoningRepository.findByPropertyId(propertyId).ifPresent(zoning -> {
            response.setZoneType(zoning.getZoneType());
            response.setConstructionAllowed(zoning.getConstructionAllowed());
        });

        // Risk Assessment
        riskAssessmentRepository.findByPropertyId(propertyId).ifPresent(risk -> {
            response.setTotalRiskScore(risk.getTotalScore());
            response.setRiskLevel(risk.getRiskLevel());
            response.setRecommendation(risk.getRecommendation());


        });

        // Who's actually generating this — falls back to an unattributed
        // system entry if called outside a request (e.g. a scheduled job),
        // rather than the previous hardcoded placeholder user id.
        User requestedBy = null;
        try {
            requestedBy = userService.getLoggedInUser();
        } catch (Exception ignored) {
            // no authenticated context available
        }

        // Save report history
        DueDiligenceReport report = new DueDiligenceReport();
        report.setPropertyId(response.getPropertyId());
        report.setPropertyTitle(response.getPropertyTitle());
        report.setOwnerName(response.getOwnerName());
        report.setTotalRiskScore(response.getTotalRiskScore());
        report.setRiskLevel(response.getRiskLevel());
        report.setRecommendation(response.getRecommendation());
        report.setGeneratedAt(LocalDateTime.now());
        report.setReportType("DUE_DILIGENCE");
        report.setStatus("COMPLETED");
        report.setDownloadCount(0);
        if (requestedBy != null) {
            report.setRequestedByUserId(requestedBy.getId());
            report.setRequestedByName(requestedBy.getFullName());
        }

        dueDiligenceReportRepository.save(report);

        // Report number depends on the generated id, so it's assigned in a
        // second save once the row actually has one.
        report.setReportNumber(buildReportNumber(report));
        dueDiligenceReportRepository.save(report);

        // Save audit log
        AuditLog auditLog = new AuditLog();
        auditLog.setPropertyId(propertyId);
        auditLog.setAction("GENERATE_REPORT");
        auditLog.setModule("Due Diligence");
        auditLog.setEntityType("REPORT");
        auditLog.setEntityId(report.getId());
        auditLog.setStatus("SUCCESS");
        auditLog.setDescription("Generated " + report.getReportNumber()
                + " (due diligence report) for property ID " + propertyId);

        if (requestedBy != null) {
            auditLog.setUserId(requestedBy.getId());
            auditLog.setUsername(requestedBy.getFullName());
            auditLog.setRole(requestedBy.getRole().name());
        }

        auditLogService.record(auditLog);

        // Notify the requesting user their report is ready — this is the
        // call NotificationService.createReportCompletedNotification's own
        // doc comment says should happen "right after a report finishes
        // generating", but nothing was actually invoking it, so the bell/
        // /api/notifications endpoints were always returning an empty list.
        // Guarded on requestedBy since Notification.userId is NOT NULL and
        // there's no authenticated user on e.g. a scheduled/system call.
        if (requestedBy != null) {
            try {
                notificationService.createReportCompletedNotification(
                        requestedBy.getId(), report.getId(), report.getPropertyTitle());
            } catch (Exception ignored) {
                // A notification failing to save should never fail report
                // generation itself — the report and audit log are already
                // committed above.
            }
        }

        return response;
    }

    private String buildReportNumber(DueDiligenceReport report) {
        int year = report.getGeneratedAt() != null
                ? report.getGeneratedAt().getYear()
                : LocalDateTime.now().getYear();
        return "RPT-" + year + "-" + String.format("%06d", report.getId());
    }
}
