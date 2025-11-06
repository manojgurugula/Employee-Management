package com.example.demo.controller;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "http://localhost:3000")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/swipe/{userId}")
    public ResponseEntity<String> swipe(@PathVariable Long userId, @RequestBody Map<String, String> payload) {
        String type = payload.get("type");

        try {
            attendanceService.swipe(userId, type);
            return ResponseEntity.ok("Swipe successful.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Invalid swipe type or user not found.");
        }
    }

    @GetMapping("/total-hours/{userId}")
    public ResponseEntity<Double> getTotalHours(@PathVariable Long userId) {
        double totalHours = attendanceService.calculateTotalHours(userId);
        return ResponseEntity.ok(totalHours);
    }
}