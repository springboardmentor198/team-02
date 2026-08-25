package com.realestate.due_diligence_agent.dto;

public class AddressValidationResponse {

    private boolean valid;
    private String message;

    // Populated on a successful lookup (from the geocoder's best match) so
    // the frontend can show the canonical address / drop a pin, without
    // requiring the caller to pass anything extra.
    private String formattedAddress;
    private Double latitude;
    private Double longitude;

    public AddressValidationResponse() {
    }

    public AddressValidationResponse(boolean valid, String message) {
        this.valid = valid;
        this.message = message;
    }

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getFormattedAddress() {
        return formattedAddress;
    }

    public void setFormattedAddress(String formattedAddress) {
        this.formattedAddress = formattedAddress;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }
}
