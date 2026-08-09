package com.realestate.due_diligence_agent.dto;

import java.util.List;
import java.util.Map;

public class AdminDashboardResponse {

    private Long totalProperties;
    private Long verifiedProperties;
    private Long pendingReviews;
    private Long rejectedProperties;

    private Double verificationRate;
    private Double averageVerificationScore;
    private Double totalPropertyValue;

    private Map<String, Long> verificationStatusDistribution;
    private Map<String, Long> propertyTypeDistribution;
    private Map<String, Long> cityDistribution;

    private List<PropertySummaryResponse> recentProperties;

    public AdminDashboardResponse() {
    }

    public AdminDashboardResponse(
            Long totalProperties,
            Long verifiedProperties,
            Long pendingReviews,
            Long rejectedProperties,
            Double verificationRate,
            Double averageVerificationScore,
            Double totalPropertyValue,
            Map<String, Long> verificationStatusDistribution,
            Map<String, Long> propertyTypeDistribution,
            Map<String, Long> cityDistribution,
            List<PropertySummaryResponse> recentProperties) {

        this.totalProperties = totalProperties;
        this.verifiedProperties = verifiedProperties;
        this.pendingReviews = pendingReviews;
        this.rejectedProperties = rejectedProperties;
        this.verificationRate = verificationRate;
        this.averageVerificationScore = averageVerificationScore;
        this.totalPropertyValue = totalPropertyValue;
        this.verificationStatusDistribution = verificationStatusDistribution;
        this.propertyTypeDistribution = propertyTypeDistribution;
        this.cityDistribution = cityDistribution;
        this.recentProperties = recentProperties;
    }

    public Long getTotalProperties() {
        return totalProperties;
    }

    public void setTotalProperties(Long totalProperties) {
        this.totalProperties = totalProperties;
    }

    public Long getVerifiedProperties() {
        return verifiedProperties;
    }

    public void setVerifiedProperties(Long verifiedProperties) {
        this.verifiedProperties = verifiedProperties;
    }

    public Long getPendingReviews() {
        return pendingReviews;
    }

    public void setPendingReviews(Long pendingReviews) {
        this.pendingReviews = pendingReviews;
    }

    public Long getRejectedProperties() {
        return rejectedProperties;
    }

    public void setRejectedProperties(Long rejectedProperties) {
        this.rejectedProperties = rejectedProperties;
    }

    public Double getVerificationRate() {
        return verificationRate;
    }

    public void setVerificationRate(Double verificationRate) {
        this.verificationRate = verificationRate;
    }

    public Double getAverageVerificationScore() {
        return averageVerificationScore;
    }

    public void setAverageVerificationScore(Double averageVerificationScore) {
        this.averageVerificationScore = averageVerificationScore;
    }

    public Double getTotalPropertyValue() {
        return totalPropertyValue;
    }

    public void setTotalPropertyValue(Double totalPropertyValue) {
        this.totalPropertyValue = totalPropertyValue;
    }

    public Map<String, Long> getVerificationStatusDistribution() {
        return verificationStatusDistribution;
    }

    public void setVerificationStatusDistribution(
            Map<String, Long> verificationStatusDistribution) {
        this.verificationStatusDistribution = verificationStatusDistribution;
    }

    public Map<String, Long> getPropertyTypeDistribution() {
        return propertyTypeDistribution;
    }

    public void setPropertyTypeDistribution(
            Map<String, Long> propertyTypeDistribution) {
        this.propertyTypeDistribution = propertyTypeDistribution;
    }

    public Map<String, Long> getCityDistribution() {
        return cityDistribution;
    }

    public void setCityDistribution(
            Map<String, Long> cityDistribution) {
        this.cityDistribution = cityDistribution;
    }

    public List<PropertySummaryResponse> getRecentProperties() {
        return recentProperties;
    }

    public void setRecentProperties(
            List<PropertySummaryResponse> recentProperties) {
        this.recentProperties = recentProperties;
    }
}