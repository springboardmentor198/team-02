package com.realestate.due_diligence_agent.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import com.realestate.due_diligence_agent.dto.RiskAssessmentResponse;
import com.realestate.due_diligence_agent.entity.Environmental;
import com.realestate.due_diligence_agent.entity.FloodZone;
import com.realestate.due_diligence_agent.entity.LegalRecord;
import com.realestate.due_diligence_agent.entity.Ownership;
import com.realestate.due_diligence_agent.entity.Permit;
import com.realestate.due_diligence_agent.entity.Property;
import com.realestate.due_diligence_agent.entity.RiskAssessment;
import com.realestate.due_diligence_agent.exception.ResourceNotFoundException;
import com.realestate.due_diligence_agent.repository.EnvironmentalRepository;
import com.realestate.due_diligence_agent.repository.FloodZoneRepository;
import com.realestate.due_diligence_agent.repository.LegalRecordRepository;
import com.realestate.due_diligence_agent.repository.OwnershipRepository;
import com.realestate.due_diligence_agent.repository.PermitRepository;
import com.realestate.due_diligence_agent.repository.PropertyRepository;
import com.realestate.due_diligence_agent.repository.PropertyTaxHistoryRepository;
import com.realestate.due_diligence_agent.repository.RiskAssessmentRepository;

/**
 * Unit tests for RiskAssessmentServiceImpl. The class uses Spring
 * @Autowired field injection with no constructor, so mocks are wired in via
 * ReflectionTestUtils rather than a constructor call.
 */
class RiskAssessmentServiceImplTest {

    private RiskAssessmentServiceImpl service;

    private RiskAssessmentRepository riskAssessmentRepository;
    private PropertyRepository propertyRepository;
    private LegalRecordRepository legalRecordRepository;
    private OwnershipRepository ownershipRepository;
    private FloodZoneRepository floodZoneRepository;
    private EnvironmentalRepository environmentalRepository;
    private PermitRepository permitRepository;
    private PropertyTaxHistoryRepository propertyTaxHistoryRepository;

    @BeforeEach
    void setUp() {
        service = new RiskAssessmentServiceImpl();

        riskAssessmentRepository = mock(RiskAssessmentRepository.class);
        propertyRepository = mock(PropertyRepository.class);
        legalRecordRepository = mock(LegalRecordRepository.class);
        ownershipRepository = mock(OwnershipRepository.class);
        floodZoneRepository = mock(FloodZoneRepository.class);
        environmentalRepository = mock(EnvironmentalRepository.class);
        permitRepository = mock(PermitRepository.class);
        propertyTaxHistoryRepository = mock(PropertyTaxHistoryRepository.class);

        ReflectionTestUtils.setField(service, "repository", riskAssessmentRepository);
        ReflectionTestUtils.setField(service, "propertyRepository", propertyRepository);
        ReflectionTestUtils.setField(service, "legalRecordRepository", legalRecordRepository);
        ReflectionTestUtils.setField(service, "ownershipRepository", ownershipRepository);
        ReflectionTestUtils.setField(service, "floodZoneRepository", floodZoneRepository);
        ReflectionTestUtils.setField(service, "environmentalRepository", environmentalRepository);
        ReflectionTestUtils.setField(service, "permitRepository", permitRepository);
        ReflectionTestUtils.setField(service, "propertyTaxHistoryRepository", propertyTaxHistoryRepository);

        // Default: no ancillary due-diligence records exist for the property
        // unless a specific test stubs one in.
        when(legalRecordRepository.findByPropertyId(1L)).thenReturn(Optional.empty());
        when(ownershipRepository.findByPropertyId(1L)).thenReturn(Optional.empty());
        when(floodZoneRepository.findByPropertyId(1L)).thenReturn(Optional.empty());
        when(environmentalRepository.findByPropertyId(1L)).thenReturn(Optional.empty());
        when(permitRepository.findByPropertyId(1L)).thenReturn(Optional.empty());
        when(propertyTaxHistoryRepository.findByPropertyId(1L)).thenReturn(List.of());
        when(riskAssessmentRepository.findByPropertyId(1L)).thenReturn(Optional.empty());
        when(riskAssessmentRepository.save(org.mockito.ArgumentMatchers.any(RiskAssessment.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
    }

    private Property fullyVerifiedProperty() {
        Property property = new Property();
        property.setId(1L);
        property.setVerificationStatus("VERIFIED");
        property.setVerificationScore(95.0);
        property.setPrice(500_000.0);
        property.setArea(1200.0);
        return property;
    }

    @Test
    void propertyNotFound_throwsResourceNotFoundException() {
        when(propertyRepository.findById(99L)).thenReturn(Optional.empty());

        org.junit.jupiter.api.Assertions.assertThrows(
                ResourceNotFoundException.class,
                () -> service.generateRiskAssessment(99L));
    }

    @Test
    void riskAssessmentNotFound_getRiskAssessment_throwsResourceNotFoundException() {
        when(riskAssessmentRepository.findByPropertyId(5L)).thenReturn(Optional.empty());

        org.junit.jupiter.api.Assertions.assertThrows(
                ResourceNotFoundException.class,
                () -> service.getRiskAssessment(5L));
    }

    @Test
    void bestCaseProperty_noPermit_hasDocumentationRisk_andIsLowOverall() {
        // Verified, high score, no permit record at all (missing permit = +10 doc risk),
        // no tax/legal/flood/environmental records, moderate price/area.
        Property property = fullyVerifiedProperty();
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));

        RiskAssessmentResponse response = service.generateRiskAssessment(1L);

        // documentationRisk = 10 (missing permit only) => totalScore = 10 => LOW
        assertThat(response.getTotalScore()).isEqualTo(10);
        assertThat(response.getRiskLevel()).isEqualTo("LOW");
        assertThat(response.getRecommendation()).contains("Obtain construction permit.");
    }

    @Test
    void unverifiedProperty_addsDocumentationRisk_andRecommendsVerification() {
        Property property = fullyVerifiedProperty();
        property.setVerificationStatus("PENDING");
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));

        RiskAssessmentResponse response = service.generateRiskAssessment(1L);

        // +20 (not verified) + 10 (missing permit) = 30 => MEDIUM
        assertThat(response.getTotalScore()).isEqualTo(30);
        assertThat(response.getRiskLevel()).isEqualTo("MEDIUM");
        assertThat(response.getRecommendation()).contains("Property verification is incomplete.");
    }

    @Test
    void highFloodRisk_addsToCrimeRiskBucket_andRecommendsInsurance() {
        Property property = fullyVerifiedProperty();
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));

        FloodZone floodZone = new FloodZone();
        floodZone.setRiskLevel("HIGH");
        when(floodZoneRepository.findByPropertyId(1L)).thenReturn(Optional.of(floodZone));

        RiskAssessmentResponse response = service.generateRiskAssessment(1L);

        // 10 (missing permit) + 20 (high flood risk) = 30 => MEDIUM
        assertThat(response.getTotalScore()).isEqualTo(30);
        assertThat(response.getRecommendation()).contains("Flood insurance is recommended.");
    }

    @Test
    void openCourtCase_addsLegalRisk_andRecommendsLegalVerification() {
        Property property = fullyVerifiedProperty();
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));

        LegalRecord legalRecord = new LegalRecord();
        legalRecord.setCourtCases("YES");
        legalRecord.setCaseStatus("OPEN");
        when(legalRecordRepository.findByPropertyId(1L)).thenReturn(Optional.of(legalRecord));

        RiskAssessmentResponse response = service.generateRiskAssessment(1L);

        // 10 (missing permit) + 20 (court cases) + 10 (case not closed) = 40 => MEDIUM
        assertThat(response.getTotalScore()).isEqualTo(40);
        assertThat(response.getRiskLevel()).isEqualTo("MEDIUM");
        assertThat(response.getRecommendation()).contains("Legal verification is recommended.");
    }

    @Test
    void unverifiedOwnership_addsLegalRisk() {
        Property property = fullyVerifiedProperty();
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));

        Ownership ownership = new Ownership();
        ownership.setOwnerVerified(false);
        when(ownershipRepository.findByPropertyId(1L)).thenReturn(Optional.of(ownership));

        RiskAssessmentResponse response = service.generateRiskAssessment(1L);

        // 10 (missing permit) + 10 (ownership unverified) = 20 => LOW
        assertThat(response.getTotalScore()).isEqualTo(20);
        assertThat(response.getRecommendation()).contains("Ownership verification is recommended.");
    }

    @Test
    void highEnvironmentalAndPollutionRisk_addsEnvironmentalRisk() {
        Property property = fullyVerifiedProperty();
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));

        Environmental environmental = new Environmental();
        environmental.setEnvironmentalRisk("HIGH");
        environmental.setPollutionLevel("HIGH");
        when(environmentalRepository.findByPropertyId(1L)).thenReturn(Optional.of(environmental));

        RiskAssessmentResponse response = service.generateRiskAssessment(1L);

        // 10 (missing permit) + 15 (env risk) + 5 (pollution) = 30 => MEDIUM
        assertThat(response.getTotalScore()).isEqualTo(30);
        assertThat(response.getRecommendation()).contains("Environmental assessment is recommended.");
    }

    @Test
    void highValueSmallProperty_addsMarketAndInfrastructureRisk() {
        Property property = fullyVerifiedProperty();
        property.setPrice(15_000_000.0);
        property.setArea(200.0);
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));

        RiskAssessmentResponse response = service.generateRiskAssessment(1L);

        // 10 (missing permit) + 5 (high price) + 5 (small area) = 20 => LOW
        assertThat(response.getTotalScore()).isEqualTo(20);
        assertThat(response.getRiskLevel()).isEqualTo("LOW");
    }

    @Test
    void veryHighCombinedRisk_isCappedAtVeryHighLevel() {
        Property property = new Property();
        property.setId(1L);
        property.setVerificationStatus("PENDING");   // +20
        property.setVerificationScore(20.0);          // +10
        property.setPrice(20_000_000.0);              // +5
        property.setArea(100.0);                      // +5
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));

        Permit permit = new Permit();
        permit.setPermitStatus("PENDING");            // +5
        when(permitRepository.findByPropertyId(1L)).thenReturn(Optional.of(permit));

        LegalRecord legalRecord = new LegalRecord();
        legalRecord.setCourtCases("YES");              // +20
        legalRecord.setCaseStatus("OPEN");              // +10
        when(legalRecordRepository.findByPropertyId(1L)).thenReturn(Optional.of(legalRecord));

        Ownership ownership = new Ownership();
        ownership.setOwnerVerified(false);              // +10
        when(ownershipRepository.findByPropertyId(1L)).thenReturn(Optional.of(ownership));

        FloodZone floodZone = new FloodZone();
        floodZone.setRiskLevel("HIGH");                 // +20
        when(floodZoneRepository.findByPropertyId(1L)).thenReturn(Optional.of(floodZone));

        Environmental environmental = new Environmental();
        environmental.setEnvironmentalRisk("HIGH");      // +15
        environmental.setPollutionLevel("HIGH");         // +5
        when(environmentalRepository.findByPropertyId(1L)).thenReturn(Optional.of(environmental));

        RiskAssessmentResponse response = service.generateRiskAssessment(1L);

        // documentationRisk = 20 (not verified) + 10 (score < 70) + 5 (permit pending, not missing) = 35
        // legalRisk         = 20 (court cases) + 10 (case open) + 10 (ownership unverified)        = 40
        // crimeRisk (flood) = 20 (high flood risk)
        // environmentalRisk = 15 (high env risk) + 5 (high pollution)                               = 20
        // marketRisk         = 5 (price > 10,000,000)
        // infrastructureRisk = 5 (area < 500)
        // total = 35 + 40 + 20 + 20 + 5 + 5 = 125 => VERY HIGH (any score > 75 is capped at this level)
        assertThat(response.getTotalScore()).isEqualTo(125);
        assertThat(response.getRiskLevel()).isEqualTo("VERY HIGH");
    }

    @Test
    void riskLevel_isCappedAtVeryHigh_regardlessOfHowFarScoreExceedsThreshold() {
        // Boundary check for the level-capping behavior this test class is named for:
        // once totalScore exceeds the HIGH threshold (75), riskLevel must read "VERY HIGH"
        // whether the score is just over the line or far past it — there is no higher level.
        Property justOverProperty = new Property();
        justOverProperty.setId(1L);
        justOverProperty.setVerificationStatus("PENDING"); // +20
        justOverProperty.setVerificationScore(20.0);        // +10
        // documentationRisk = 20 + 10 + 10 (missing permit) = 40
        // legalRisk = 20 (court cases) + 10 (case open) = 30
        // crimeRisk = 10 (medium flood) => total = 80 > 75
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(justOverProperty));

        LegalRecord legalRecord = new LegalRecord();
        legalRecord.setCourtCases("YES");
        legalRecord.setCaseStatus("OPEN");
        when(legalRecordRepository.findByPropertyId(1L)).thenReturn(Optional.of(legalRecord));

        FloodZone floodZone = new FloodZone();
        floodZone.setRiskLevel("MEDIUM");
        when(floodZoneRepository.findByPropertyId(1L)).thenReturn(Optional.of(floodZone));

        RiskAssessmentResponse response = service.generateRiskAssessment(1L);

        assertThat(response.getTotalScore()).isEqualTo(80);
        assertThat(response.getRiskLevel()).isEqualTo("VERY HIGH");
    }

    @Test
    void existingRiskAssessment_isUpdatedInPlace_notDuplicated() {
        Property property = fullyVerifiedProperty();
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));

        RiskAssessment existing = new RiskAssessment();
        existing.setId(42L);
        existing.setPropertyId(1L);
        when(riskAssessmentRepository.findByPropertyId(1L)).thenReturn(Optional.of(existing));

        service.generateRiskAssessment(1L);

        // The same entity instance (id=42) should have been the one saved/updated.
        org.mockito.ArgumentCaptor<RiskAssessment> captor =
                org.mockito.ArgumentCaptor.forClass(RiskAssessment.class);
        org.mockito.Mockito.verify(riskAssessmentRepository).save(captor.capture());
        assertThat(captor.getValue().getId()).isEqualTo(42L);
    }
}