package com.example.wastemanagement.controller;

import com.example.wastemanagement.model.WastePickup;
import com.example.wastemanagement.service.WastePickupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/waste-pickups")
public class WastePickupController {

    @Autowired
    private WastePickupService wastePickupService;

    @GetMapping
    public List<WastePickup> getAllPickups() {
        return wastePickupService.getAllPickups();
    }

    @GetMapping("/{id}")
    public ResponseEntity<WastePickup> getPickupById(@PathVariable Long id) {
        Optional<WastePickup> pickup = wastePickupService.getPickupById(id);
        return pickup.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/status/{status}")
    public List<WastePickup> getPickupsByStatus(@PathVariable String status) {
        return wastePickupService.getPickupsByStatus(status);
    }

    @GetMapping("/user/{userName}")
    public List<WastePickup> getPickupsByUser(@PathVariable String userName) {
        return wastePickupService.getPickupsByUser(userName);
    }

    @PostMapping
    public WastePickup createPickup(@RequestBody WastePickup pickup) {
        return wastePickupService.createPickup(pickup);
    }

    @PutMapping("/{id}")
    public ResponseEntity<WastePickup> updatePickup(@PathVariable Long id, @RequestBody WastePickup updatedPickup) {
        try {
            WastePickup updated = wastePickupService.updatePickup(id, updatedPickup);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePickup(@PathVariable Long id) {
        try {
            wastePickupService.deletePickup(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}