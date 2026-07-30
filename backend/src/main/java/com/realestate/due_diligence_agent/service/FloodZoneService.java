package com.realestate.due_diligence_agent.service;

import org.springframework.stereotype.Service;

import com.realestate.due_diligence_agent.dto.FloodZoneResponse;
import com.realestate.due_diligence_agent.entity.Property;
import com.realestate.due_diligence_agent.repository.PropertyRepository;

@Service
public class FloodZoneService {

    private final PropertyRepository propertyRepository;

    public FloodZoneService(PropertyRepository propertyRepository) {
        this.propertyRepository = propertyRepository;
    }

    public FloodZoneResponse getFloodZone(Long id) {

        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        return new FloodZoneResponse(
                "Zone A",
                "Low",
                "NO",
                property.getCity() + " Flood Monitoring Authority"
        );
    }
}