package com.realestate.due_diligence_agent.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.realestate.due_diligence_agent.entity.Property;
import com.realestate.due_diligence_agent.entity.User;

public interface PropertyRepository extends JpaRepository<Property, Long> {

    List<Property> findByCity(String city);

    List<Property> findByPropertyType(String propertyType);

    List<Property> findByPriceBetween(Double minPrice, Double maxPrice);

    // NEW
    List<Property> findByUser(User user);
    Optional<Property> findByIdAndUser(Long id, User user);

}
