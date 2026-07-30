package com.realestate.due_diligence_agent.service;

import org.springframework.stereotype.Service;

import com.realestate.due_diligence_agent.dto.PermitResponse;
import com.realestate.due_diligence_agent.entity.Property;

@Service
public class PermitService {

    public PermitResponse getPermit(Property property) {

        return new PermitResponse(
                "PMT-" + property.getId(),
                "Residential Building Permit",
                "Approved",
                property.getCity() + " Municipal Corporation"
        );
    }
}