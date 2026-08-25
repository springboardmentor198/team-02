package com.realestate.due_diligence_agent.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.realestate.due_diligence_agent.entity.Property;
import com.realestate.due_diligence_agent.entity.User;

public interface PropertyRepository extends JpaRepository<Property, Long> {

    List<Property> findByUser(User user);

    List<Property> findByCity(String city);

    List<Property> findByPropertyType(String propertyType);

    List<Property> findByPriceBetween(Double minPrice, Double maxPrice);

    Optional<Property> findByIdAndUser(Long id, User user);

    List<Property> findByCityAndPropertyType(String city, String propertyType);

    // Marketplace-wide (not user-scoped) filters: this is a shared property
    // directory, so every authenticated user should be able to browse and
    // filter every listed property, not just their own. Case-insensitive
    // since these back free-text-ish filter dropdowns/search.
    List<Property> findByCityIgnoreCase(String city);

    List<Property> findByPropertyTypeIgnoreCase(String propertyType);
}