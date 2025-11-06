package com.example.demo.controller;

import com.example.demo.entity.Profile;
import com.example.demo.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "http://localhost:3000")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @GetMapping("/{userId}")
    public ResponseEntity<Profile> getProfile(@PathVariable Long userId) {
        Profile profile = profileService.getProfileByUserId(userId);
        if (profile != null) {
            return ResponseEntity.ok(profile);
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{userId}")
    public ResponseEntity<Profile> updateProfile(@PathVariable Long userId, @RequestBody Profile profileData) {
        Profile updatedProfile = profileService.updateProfile(userId, profileData);
        if (updatedProfile != null) {
            return ResponseEntity.ok(updatedProfile);
        }
        return ResponseEntity.notFound().build();
    }
}