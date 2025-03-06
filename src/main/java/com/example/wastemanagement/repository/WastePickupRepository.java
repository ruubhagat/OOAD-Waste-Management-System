package com.example.wastemanagement.repository;

import com.example.wastemanagement.model.WastePickup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface WastePickupRepository extends JpaRepository<WastePickup, Long> {
    List<WastePickup> findByStatus(String status);
    List<WastePickup> findByUserName(String userName);
    List<WastePickup> findByPickupDateTimeBefore(LocalDateTime dateTime);
}