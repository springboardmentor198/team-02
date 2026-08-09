package com.realestate.due_diligence_agent.controller;

import java.util.List;
import java.util.Map;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

import com.realestate.due_diligence_agent.dto.PropertyDetailsResponse;
import com.realestate.due_diligence_agent.dto.PropertyRequest;
import com.realestate.due_diligence_agent.dto.VerificationResult;
import com.realestate.due_diligence_agent.entity.AuditLog;
import com.realestate.due_diligence_agent.entity.Property;
import com.realestate.due_diligence_agent.entity.User;
import com.realestate.due_diligence_agent.service.AuditLogService;
import com.realestate.due_diligence_agent.service.PropertyService;
import com.realestate.due_diligence_agent.dto.FloodZoneResponse;
import com.realestate.due_diligence_agent.service.FloodZoneService;
import com.realestate.due_diligence_agent.service.UserService;

@RestController
@RequestMapping("/api/properties")
public class PropertyController {

    private final PropertyService propertyService;
    private final FloodZoneService floodZoneService;
    private final AuditLogService auditLogService;
    private final UserService userService;

    public PropertyController(PropertyService propertyService,
                          FloodZoneService floodZoneService,
                          AuditLogService auditLogService,
                          UserService userService) {
    this.propertyService = propertyService;
    this.floodZoneService = floodZoneService;
    this.auditLogService = auditLogService;
    this.userService = userService;
}

    @PostMapping
    public Property addProperty(@Valid @RequestBody PropertyRequest request) {
        Property saved = propertyService.addProperty(request);
        logPropertyAction("CREATE_PROPERTY", saved.getId(),
                "Created property \"" + saved.getTitle() + "\".");
        return saved;
    }

    @PostMapping("/{id}/verify")
    public VerificationResult verifyProperty(@PathVariable Long id) {
        return propertyService.verifyProperty(id);
    }

    @GetMapping
    public List<Property> getAllProperties() {
        return propertyService.getAllProperties();
    }

    @PutMapping("/{id}")
    public Property updateProperty(@PathVariable Long id,
                                   @Valid @RequestBody PropertyRequest request) {
        Property updated = propertyService.updateProperty(id, request);
        logPropertyAction("UPDATE_PROPERTY", id,
                "Updated property \"" + updated.getTitle() + "\".");
        return updated;
    }

    @DeleteMapping("/{id}")
    public String deleteProperty(@PathVariable Long id) {
        propertyService.deleteProperty(id);
        logPropertyAction("DELETE_PROPERTY", id,
                "Deleted property ID " + id + ".");
        return "Property deleted successfully.";
    }

    @GetMapping("/city/{city}")
    public List<Property> getByCity(@PathVariable String city) {
        return propertyService.getPropertiesByCity(city);
    }

    @GetMapping("/type/{type}")
    public List<Property> getByType(@PathVariable String type) {
        return propertyService.getPropertiesByType(type);
    }

    @GetMapping("/price")
    public List<Property> getByPrice(@RequestParam Double min,
                                     @RequestParam Double max) {
        return propertyService.getPropertiesByPrice(min, max);
    }

    @GetMapping("/stats")
    public Map<String, Long> getStats() {
        return propertyService.getPropertyTypeStats();
    }

    @GetMapping("/{id}")
    public PropertyDetailsResponse getPropertyById(@PathVariable Long id) {
        PropertyDetailsResponse response = propertyService.getPropertyDetailsById(id);
        logPropertyAction("VIEW_PROPERTY", id, "Viewed property ID " + id + ".");
        return response;
    }
    @GetMapping("/{id}/flood-zone")
    public FloodZoneResponse getFloodZone(@PathVariable Long id) {
    return floodZoneService.getFloodZone(id);
}

    // Task 7: best-effort activity logging for property CRUD + views.
    // Failures here never surface to the caller — an audit-log write
    // shouldn't be able to break an otherwise-successful property action.
    private void logPropertyAction(String action, Long propertyId, String description) {
        try {
            User user = userService.getLoggedInUser();

            AuditLog entry = new AuditLog();
            entry.setUserId(user.getId());
            entry.setUsername(user.getFullName());
            entry.setRole(user.getRole().name());
            entry.setPropertyId(propertyId);
            entry.setAction(action);
            entry.setModule("Property");
            entry.setEntityType("PROPERTY");
            entry.setEntityId(propertyId);
            entry.setStatus("SUCCESS");
            entry.setDescription(description);

            auditLogService.record(entry);
        } catch (Exception ignored) {
        }
    }
}
