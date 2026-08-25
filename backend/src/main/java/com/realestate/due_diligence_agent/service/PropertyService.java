package com.realestate.due_diligence_agent.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.realestate.due_diligence_agent.dto.AddressValidationResponse;
import com.realestate.due_diligence_agent.exception.BadRequestException;
import com.realestate.due_diligence_agent.exception.ResourceNotFoundException;
import com.realestate.due_diligence_agent.dto.EnvironmentalResponse;
import com.realestate.due_diligence_agent.dto.FloodZoneResponse;
import com.realestate.due_diligence_agent.dto.LandRegistryResponse;
import com.realestate.due_diligence_agent.dto.LegalRecordResponse;
import com.realestate.due_diligence_agent.dto.OwnershipResponse;
import com.realestate.due_diligence_agent.dto.PermitResponse;
import com.realestate.due_diligence_agent.dto.PropertyDetailsResponse;
import com.realestate.due_diligence_agent.dto.PropertyRequest;
import com.realestate.due_diligence_agent.dto.VerificationResult;
import com.realestate.due_diligence_agent.dto.ZoningResponse;
import com.realestate.due_diligence_agent.entity.Property;
import com.realestate.due_diligence_agent.entity.User;
import com.realestate.due_diligence_agent.repository.PropertyRepository;

@Service
public class PropertyService {

    private static final Logger logger = LoggerFactory.getLogger(PropertyService.class);

    private final PropertyRepository propertyRepository;
    private final AddressValidationService addressValidationService;
    private final VerificationService verificationService;
    private final LandRegistryService landRegistryService;
    private final OwnershipService ownershipService;
    private final LegalRecordService legalRecordService;
    private final ZoningService zoningService;
    private final FloodZoneService floodZoneService;
    private final PermitService permitService;
private final EnvironmentalService environmentalService;

    public PropertyService(PropertyRepository propertyRepository,
            AddressValidationService addressValidationService,
            VerificationService verificationService,
            LandRegistryService landRegistryService,
            OwnershipService ownershipService, LegalRecordService legalRecordService,
                           ZoningService zoningService,
FloodZoneService floodZoneService,
PermitService permitService,
EnvironmentalService environmentalService     ) {

        this.propertyRepository = propertyRepository;
        this.addressValidationService = addressValidationService;
        this.verificationService = verificationService;
        this.landRegistryService = landRegistryService;
        this.ownershipService = ownershipService;
        this.legalRecordService = legalRecordService;
        this.zoningService = zoningService;
        this.floodZoneService = floodZoneService;
        this.permitService = permitService;
        this.environmentalService = environmentalService;

    }

    // ==========================================
    // Get Logged In User
    // ==========================================
    private User getLoggedInUser() {

        Authentication authentication
                = SecurityContextHolder.getContext().getAuthentication();

        return (User) authentication.getPrincipal();
    }

    // ==========================================
    // Build a complete address string for geocoding
    // ==========================================
    // AddressValidationService.validateAddress() requires the geocoder to
    // resolve a house number, road, locality (city) AND country. The
    // "address" field on PropertyRequest is only the street portion (e.g.
    // "221B Baker Street") — city/state live in their own fields — so it
    // must never be sent to the geocoder on its own; a bare street address
    // is frequently too ambiguous to resolve to a fully-specific match.
    // Combining address + city + state here mirrors the same pattern
    // already used for display/export purposes (see the joinNonBlank(...)
    // helper in ExcelExportService/PdfExportService).
    private String buildFullAddress(PropertyRequest request) {
        return Stream.of(request.getAddress(), request.getCity(), request.getState())
                .filter(part -> part != null && !part.isBlank())
                .collect(Collectors.joining(", "));
    }

    // ==========================================
    // Add Property
    // ==========================================
    @Transactional
    public Property addProperty(PropertyRequest request) {

        AddressValidationResponse validation
                = addressValidationService.validateAddress(buildFullAddress(request));

        if (!validation.isValid()) {
            throw new BadRequestException(validation.getMessage());
        }

        User loggedInUser = getLoggedInUser();

        Property property = new Property();

        property.setTitle(request.getTitle());
        property.setAddress(request.getAddress());
        property.setCity(request.getCity());
        property.setState(request.getState());
        property.setPropertyType(request.getPropertyType());
        property.setPrice(request.getPrice());
        property.setArea(request.getArea());
        property.setOwnerName(request.getOwnerName());

        property.setUser(loggedInUser);

        property.setVerificationStatus("Pending");
        property.setVerificationScore(0.0);
        property.setRegistrationDate(LocalDate.now());
        property.setVerificationDate(null);

        // Every due-diligence section the seller filled in on Add Property is
        // attached to the property here. Property is the cascade root, so
        // saving it below persists all of these child rows in one go.
        if (request.getLandRegistry() != null) {
            property.setLandRegistry(
                    landRegistryService.buildFromRequest(request.getLandRegistry(), property));
        }
        if (request.getOwnership() != null) {
            property.setOwnership(
                    ownershipService.buildFromRequest(request.getOwnership(), property));
        }
        if (request.getLegalRecord() != null) {
            property.setLegalRecord(
                    legalRecordService.buildFromRequest(request.getLegalRecord(), property));
        }
        if (request.getZoning() != null) {
            property.setZoning(
                    zoningService.buildFromRequest(request.getZoning(), property));
        }
        if (request.getFloodZone() != null) {
            property.setFloodZone(
                    floodZoneService.buildFromRequest(request.getFloodZone(), property));
        }
        if (request.getPermit() != null) {
            property.setPermit(
                    permitService.buildFromRequest(request.getPermit(), property));
        }
        if (request.getEnvironmental() != null) {
            property.setEnvironmental(
                    environmentalService.buildFromRequest(request.getEnvironmental(), property));
        }

        return propertyRepository.save(property);
    }

    // ==========================================
    // Verify Property
    // ==========================================
    @Transactional
    public VerificationResult verifyProperty(Long propertyId) {

        User loggedInUser = getLoggedInUser();

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));

        if (!property.getUser().getId().equals(loggedInUser.getId())) {
            throw new AccessDeniedException("Access denied");
        }

        VerificationResult result = verificationService.verify(property);

        property.setVerificationScore(result.getScore());
        property.setVerificationStatus(result.getStatus());
        property.setVerificationDate(LocalDate.now());

        propertyRepository.save(property);

        return result;
    }

    // ==========================================
    // Get All Properties
    // ==========================================
    // Marketplace-wide: every authenticated user (buyer, agent, etc.) can
    // browse every listed property, not just ones they added themselves.
    public List<Property> getAllProperties() {
        return propertyRepository.findAll();
    }

    // ==========================================
    // Get Property By Id
    // ==========================================
    // Read-only lookup, open to any authenticated user (marketplace model).
    // Ownership is still enforced for mutations (verify/update/delete below).
    public Property getPropertyById(Long id) {
        return propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));
    }

    // ==========================================
    // Update Property
    // ==========================================
    @Transactional
    public Property updateProperty(Long id, PropertyRequest request) {

        User user = getLoggedInUser();

        Property property = propertyRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));

        AddressValidationResponse validation
                = addressValidationService.validateAddress(buildFullAddress(request));

        if (!validation.isValid()) {
            throw new BadRequestException(validation.getMessage());
        }

        property.setTitle(request.getTitle());
        property.setAddress(request.getAddress());
        property.setCity(request.getCity());
        property.setState(request.getState());
        property.setPropertyType(request.getPropertyType());
        property.setPrice(request.getPrice());
        property.setArea(request.getArea());
        property.setOwnerName(request.getOwnerName());

        // A section is only touched when it is present in the request body.
        // When present, an existing child row is updated in place; only a
        // brand-new section creates a new row. This is what keeps Edit
        // Property from ever inserting duplicate due-diligence records.
        if (request.getLandRegistry() != null) {
            if (property.getLandRegistry() == null) {
                property.setLandRegistry(
                        landRegistryService.buildFromRequest(request.getLandRegistry(), property));
            } else {
                landRegistryService.applyRequest(property.getLandRegistry(), request.getLandRegistry());
            }
        }
        if (request.getOwnership() != null) {
            if (property.getOwnership() == null) {
                property.setOwnership(
                        ownershipService.buildFromRequest(request.getOwnership(), property));
            } else {
                ownershipService.applyRequest(property.getOwnership(), request.getOwnership());
            }
        }
        if (request.getLegalRecord() != null) {
            if (property.getLegalRecord() == null) {
                property.setLegalRecord(
                        legalRecordService.buildFromRequest(request.getLegalRecord(), property));
            } else {
                legalRecordService.applyRequest(property.getLegalRecord(), request.getLegalRecord());
            }
        }
        if (request.getZoning() != null) {
            if (property.getZoning() == null) {
                property.setZoning(
                        zoningService.buildFromRequest(request.getZoning(), property));
            } else {
                zoningService.applyRequest(property.getZoning(), request.getZoning());
            }
        }
        if (request.getFloodZone() != null) {
            if (property.getFloodZone() == null) {
                property.setFloodZone(
                        floodZoneService.buildFromRequest(request.getFloodZone(), property));
            } else {
                floodZoneService.applyRequest(property.getFloodZone(), request.getFloodZone());
            }
        }
        if (request.getPermit() != null) {
            if (property.getPermit() == null) {
                property.setPermit(
                        permitService.buildFromRequest(request.getPermit(), property));
            } else {
                permitService.applyRequest(property.getPermit(), request.getPermit());
            }
        }
        if (request.getEnvironmental() != null) {
            if (property.getEnvironmental() == null) {
                property.setEnvironmental(
                        environmentalService.buildFromRequest(request.getEnvironmental(), property));
            } else {
                environmentalService.applyRequest(property.getEnvironmental(), request.getEnvironmental());
            }
        }

        return propertyRepository.save(property);
    }

    // ==========================================
    // Delete Property
    // ==========================================
    public void deleteProperty(Long id) {

        User user = getLoggedInUser();

        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));

        if (!property.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Access denied");
        }

        propertyRepository.delete(property);

        logger.debug("Property {} deleted by user {}", id, user.getId());
    }

    // ==========================================
    // Filter by City
    // ==========================================
    // Marketplace-wide (see getAllProperties). Pushed down to Postgres via a
    // case-insensitive derived query rather than loading everything and
    // filtering in Java.
    public List<Property> getPropertiesByCity(String city) {
        return propertyRepository.findByCityIgnoreCase(city);
    }

    // ==========================================
    // Filter by Property Type
    // ==========================================
    public List<Property> getPropertiesByType(String propertyType) {
        return propertyRepository.findByPropertyTypeIgnoreCase(propertyType);
    }

    // ==========================================
    // Filter by Price
    // ==========================================
    public List<Property> getPropertiesByPrice(Double minPrice,
            Double maxPrice) {
        return propertyRepository.findByPriceBetween(minPrice, maxPrice);
    }

    // ==========================================
    // Property Statistics
    // ==========================================
    // Marketplace-wide stats (see getAllProperties).
    public Map<String, Long> getPropertyTypeStats() {

        return propertyRepository.findAll()
                .stream()
                .collect(Collectors.groupingBy(
                        Property::getPropertyType,
                        Collectors.counting()));
    }
    //=========================
    //get property by id
    //=========================

    @Transactional(readOnly = true)
    public PropertyDetailsResponse getPropertyDetailsById(Long id) {

        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));

        // Every section below is read straight off the Property entity that
        // was just loaded from PostgreSQL — no mock/generated values.
        LandRegistryResponse landRegistry =
                landRegistryService.getRegistryDetails(property);

        OwnershipResponse ownership =
                ownershipService.getOwnershipDetails(property);

        LegalRecordResponse legalRecord =
                legalRecordService.getLegalRecord(property);

        ZoningResponse zoning =
                zoningService.getZoning(property);

        FloodZoneResponse floodZone =
                floodZoneService.getFloodZone(property);

        PermitResponse permit =
                permitService.getPermit(property);

        EnvironmentalResponse environmental =
                environmentalService.getEnvironmental(property);

        return new PropertyDetailsResponse(
                property.getId(),
                property.getTitle(),
                property.getAddress(),
                property.getCity(),
                property.getState(),
                property.getPropertyType(),
                property.getPrice(),
                property.getArea(),
                property.getOwnerName(),
                property.getVerificationStatus(),
                property.getVerificationScore(),
                property.getRegistrationDate(),
                property.getVerificationDate(),
                landRegistry,
                ownership,
                legalRecord,
                zoning,
                floodZone,
                permit,
                environmental
        );
    }
}