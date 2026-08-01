package com.realestate.due_diligence_agent.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Seller-submitted Ownership section of the Add/Edit Property form.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OwnershipRequest {

    private String ownershipType;
    private String ownershipSince;
    private boolean ownerVerified;
    private String remarks;
}
