package com.realestate.due_diligence_agent.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

import com.realestate.due_diligence_agent.dto.VerificationResult;
import com.realestate.due_diligence_agent.entity.Property;

/**
 * Unit tests for VerificationService — the scoring rules that decide whether
 * a seller-entered property is "Verified", "Needs Review", or "Rejected".
 * No mocks needed: verify() is pure logic over a Property.
 */
class VerificationServiceTest {

    private final VerificationService verificationService = new VerificationService();

    private Property completeProperty() {
        Property property = new Property();
        property.setAddress("221B Baker Street");
        property.setOwnerName("John Doe");
        property.setPropertyType("Residential");
        property.setPrice(500000.0);
        property.setArea(1200.0);
        return property;
    }

    @Test
    void allFieldsValid_scoresOneHundred_andIsVerified() {
        Property property = completeProperty();

        VerificationResult result = verificationService.verify(property);

        assertThat(result.getScore()).isEqualTo(100.0);
        assertThat(result.getStatus()).isEqualTo("Verified");
        assertThat(result.getIssues()).isEmpty();
    }

    @Test
    void missingAddressOnly_scoresEighty_andNeedsReview() {
        Property property = completeProperty();
        property.setAddress(null);

        VerificationResult result = verificationService.verify(property);

        assertThat(result.getScore()).isEqualTo(80.0);
        assertThat(result.getStatus()).isEqualTo("Needs Review");
        assertThat(result.getIssues()).containsExactly("Address is missing");
    }

    @Test
    void blankAddress_isTreatedAsMissing() {
        Property property = completeProperty();
        property.setAddress("   ");

        VerificationResult result = verificationService.verify(property);

        assertThat(result.getIssues()).contains("Address is missing");
    }

    @Test
    void zeroPrice_isInvalid_andFlagged() {
        Property property = completeProperty();
        property.setPrice(0.0);

        VerificationResult result = verificationService.verify(property);

        assertThat(result.getIssues()).contains("Invalid property price");
        assertThat(result.getScore()).isEqualTo(80.0);
    }

    @Test
    void negativeArea_isInvalid_andFlagged() {
        Property property = completeProperty();
        property.setArea(-50.0);

        VerificationResult result = verificationService.verify(property);

        assertThat(result.getIssues()).contains("Invalid property area");
    }

    @Test
    void onlyTwoFieldsValid_scoresForty_andIsRejected() {
        Property property = new Property();
        property.setAddress("221B Baker Street");
        property.setOwnerName("John Doe");
        // propertyType, price, area all left null

        VerificationResult result = verificationService.verify(property);

        assertThat(result.getScore()).isEqualTo(40.0);
        assertThat(result.getStatus()).isEqualTo("Rejected");
        assertThat(result.getIssues()).hasSize(3);
    }

    @Test
    void emptyProperty_scoresZero_andIsRejected() {
        Property property = new Property();

        VerificationResult result = verificationService.verify(property);

        assertThat(result.getScore()).isEqualTo(0.0);
        assertThat(result.getStatus()).isEqualTo("Rejected");
        assertThat(result.getIssues()).hasSize(5);
    }

    @Test
    void scoreOfExactlySixty_isNeedsReview_notRejected() {
        // Address + owner + propertyType valid = 60; price + area invalid.
        Property property = new Property();
        property.setAddress("221B Baker Street");
        property.setOwnerName("John Doe");
        property.setPropertyType("Residential");

        VerificationResult result = verificationService.verify(property);

        assertThat(result.getScore()).isEqualTo(60.0);
        assertThat(result.getStatus()).isEqualTo("Needs Review");
    }
}
