package com.example.wastemanagement.service;

import com.example.wastemanagement.model.WastePickup;
import com.example.wastemanagement.repository.WastePickupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class WastePickupService {

    @Autowired
    private WastePickupRepository wastePickupRepository;

    public List<WastePickup> getAllPickups() {
        // Check for pickups with passed time and update them
        updateCompletedPickups();
        return wastePickupRepository.findAll();
    }

    public Optional<WastePickup> getPickupById(Long id) {
        return wastePickupRepository.findById(id);
    }

    public WastePickup createPickup(WastePickup pickup) {
        // Set default status to "Pending" if not specified
        if (pickup.getStatus() == null || pickup.getStatus().isEmpty()) {
            pickup.setStatus("Pending");
        }
        return wastePickupRepository.save(pickup);
    }

    public WastePickup updatePickup(Long id, WastePickup updatedPickup) {
        return wastePickupRepository.findById(id).map(pickup -> {
            pickup.setLocation(updatedPickup.getLocation());
            pickup.setPickupDateTime(updatedPickup.getPickupDateTime());
            pickup.setStatus(updatedPickup.getStatus());
            pickup.setWasteType(updatedPickup.getWasteType());
            pickup.setUserName(updatedPickup.getUserName());
            return wastePickupRepository.save(pickup);
        }).orElseThrow(() -> new RuntimeException("Pickup not found with id " + id));
    }

    public void deletePickup(Long id) {
        wastePickupRepository.deleteById(id);
    }
    
    public List<WastePickup> getPickupsByStatus(String status) {
        return wastePickupRepository.findByStatus(status);
    }
    
    public List<WastePickup> getPickupsByUser(String userName) {
        return wastePickupRepository.findByUserName(userName);
    }
    
    // Method to update completed pickups
    private void updateCompletedPickups() {
        LocalDateTime now = LocalDateTime.now();
        List<WastePickup> passedPickups = wastePickupRepository.findByPickupDateTimeBefore(now);
        
        for (WastePickup pickup : passedPickups) {
            if (!pickup.getStatus().equals("Completed")) {
                pickup.setStatus("Completed");
                wastePickupRepository.save(pickup);
            }
        }
    }
}