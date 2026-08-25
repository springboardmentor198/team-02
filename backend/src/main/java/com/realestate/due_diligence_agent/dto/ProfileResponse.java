package com.realestate.due_diligence_agent.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProfileResponse {

    private Long id;
    private String fullName;
    private String email;
    private String role;

    // Full URL the frontend can drop straight into an <img src>, or null if
    // the user hasn't uploaded a photo (frontend shows the initials avatar).
    private String profileImageUrl;

}
