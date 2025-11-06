package com.example.demo.service;

import com.example.demo.entity.Profile;
import com.example.demo.entity.User;
import com.example.demo.repository.ProfileRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ProfileService {

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private UserRepository userRepository;

    public Profile getProfileByUserId(Long userId) {
        return profileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId).orElse(null);
                    if (user != null) {
                        Profile newProfile = new Profile(user);
                        return profileRepository.save(newProfile);
                    }
                    return null;
                });
    }

    public Profile updateProfile(Long userId, Profile profileData) {
        Profile profile = getProfileByUserId(userId);
        if (profile != null) {
            profile.setPhone(profileData.getPhone());
            profile.setAddress(profileData.getAddress());
            profile.setDateOfBirth(profileData.getDateOfBirth());
            profile.setJoinDate(profileData.getJoinDate());
            profile.setDepartment(profileData.getDepartment());
            profile.setPosition(profileData.getPosition());
            profile.setEmergencyContact(profileData.getEmergencyContact());
            profile.setEmergencyPhone(profileData.getEmergencyPhone());
            return profileRepository.save(profile);
        }
        return null;
    }
}