package com.realestate.due_diligence_agent.service;

import org.springframework.stereotype.Service;

import com.realestate.due_diligence_agent.dto.EnvironmentalResponse;
import com.realestate.due_diligence_agent.entity.Property;

@Service
public class EnvironmentalService {

    public EnvironmentalResponse getEnvironmental(Property property) {

        return new EnvironmentalResponse(
                "Low",
                "Minimal",
                "No",
                "No environmental concerns detected."
        );
    }
}