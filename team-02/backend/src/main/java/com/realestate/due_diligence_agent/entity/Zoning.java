package com.realestate.due_diligence_agent.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "zoning")
public class Zoning {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String zoneType;

    private String constructionAllowed;

    private String authority;

    // Owning side of the link back to Property. @JsonIgnore stops Jackson
    // from walking Property -> this -> Property -> ... in an infinite loop
    // when a Property entity is serialized directly by the controller.
    @OneToOne
    @JoinColumn(name = "property_id", unique = true)
    @JsonIgnore
    private Property property;

    public Zoning() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getZoneType() {
        return zoneType;
    }

    public void setZoneType(String zoneType) {
        this.zoneType = zoneType;
    }

    public String getConstructionAllowed() {
        return constructionAllowed;
    }

    public void setConstructionAllowed(String constructionAllowed) {
        this.constructionAllowed = constructionAllowed;
    }

    public String getAuthority() {
        return authority;
    }

    public void setAuthority(String authority) {
        this.authority = authority;
    }

    public Property getProperty() {
        return property;
    }

    public void setProperty(Property property) {
        this.property = property;
    }
}