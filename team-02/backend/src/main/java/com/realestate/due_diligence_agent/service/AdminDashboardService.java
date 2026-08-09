package com.realestate.due_diligence_agent.service;

import com.realestate.due_diligence_agent.dto.AdminDashboardResponse;
import com.realestate.due_diligence_agent.dto.PropertySummaryResponse;
import com.realestate.due_diligence_agent.entity.Property;
import com.realestate.due_diligence_agent.repository.PropertyRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class AdminDashboardService {

    private final PropertyRepository propertyRepository;

    public AdminDashboardService(PropertyRepository propertyRepository) {
        this.propertyRepository = propertyRepository;
    }

    public AdminDashboardResponse getAdminDashboard() {

        // Get ALL properties for admin analytics
        List<Property> properties = propertyRepository.findAll();

        long totalProperties = properties.size();

        // Verification status counts
        long verifiedProperties = properties.stream()
                .filter(p -> "VERIFIED".equalsIgnoreCase(p.getVerificationStatus()))
                .count();

        long pendingReviews = properties.stream()
                .filter(p -> "PENDING".equalsIgnoreCase(p.getVerificationStatus()))
                .count();

        long rejectedProperties = properties.stream()
                .filter(p -> "REJECTED".equalsIgnoreCase(p.getVerificationStatus()))
                .count();

        // Verification rate
        double verificationRate = totalProperties == 0
                ? 0.0
                : (verifiedProperties * 100.0) / totalProperties;

        // Average verification score
        double averageVerificationScore = properties.stream()
                .map(Property::getVerificationScore)
                .filter(Objects::nonNull)
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0.0);

        // Total property value
        double totalPropertyValue = properties.stream()
                .map(Property::getPrice)
                .filter(Objects::nonNull)
                .mapToDouble(Double::doubleValue)
                .sum();

        // Verification Status Distribution
        Map<String, Long> verificationStatusDistribution =
                properties.stream()
                        .map(Property::getVerificationStatus)
                        .filter(Objects::nonNull)
                        .collect(Collectors.groupingBy(
                                Function.identity(),
                                LinkedHashMap::new,
                                Collectors.counting()
                        ));

        // Property Type Distribution
        Map<String, Long> propertyTypeDistribution =
                properties.stream()
                        .map(Property::getPropertyType)
                        .filter(Objects::nonNull)
                        .collect(Collectors.groupingBy(
                                Function.identity(),
                                LinkedHashMap::new,
                                Collectors.counting()
                        ));

        // City Distribution
        Map<String, Long> cityDistribution =
                properties.stream()
                        .map(Property::getCity)
                        .filter(Objects::nonNull)
                        .collect(Collectors.groupingBy(
                                Function.identity(),
                                LinkedHashMap::new,
                                Collectors.counting()
                        ));

        // Recent 5 Properties
        List<PropertySummaryResponse> recentProperties = properties.stream()
                .sorted(Comparator.comparing(
                        Property::getRegistrationDate,
                        Comparator.nullsLast(Comparator.reverseOrder())
                ))
                .limit(5)
                .map(this::convertToSummaryResponse)
                .collect(Collectors.toList());

        return new AdminDashboardResponse(
                totalProperties,
                verifiedProperties,
                pendingReviews,
                rejectedProperties,
                verificationRate,
                averageVerificationScore,
                totalPropertyValue,
                verificationStatusDistribution,
                propertyTypeDistribution,
                cityDistribution,
                recentProperties
        );
    }

    private PropertySummaryResponse convertToSummaryResponse(Property property) {

        PropertySummaryResponse response = new PropertySummaryResponse();

        response.setId(property.getId());
        response.setTitle(property.getTitle());
        response.setCity(property.getCity());
        response.setPropertyType(property.getPropertyType());
        response.setPrice(property.getPrice());
        response.setVerificationStatus(property.getVerificationStatus());
        response.setVerificationScore(property.getVerificationScore());

        return response;
    }
}