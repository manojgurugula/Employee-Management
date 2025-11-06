package com.example.demo.service;

import com.example.demo.entity.Attendance;
import com.example.demo.entity.User;
import com.example.demo.repository.AttendanceRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private UserRepository userRepository;

    public Attendance swipe(Long userId, String type) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Attendance attendance = new Attendance();
        attendance.setUser(user);
        attendance.setType(type.toUpperCase());
        attendance.setTimestamp(LocalDateTime.now());
        return attendanceRepository.save(attendance);
    }

    public double calculateTotalHours(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Attendance> logs = attendanceRepository.findByUser(user);
        double totalHours = 0.0;
        LocalDateTime lastSwipeIn = null;

        for (Attendance log : logs) {
            if ("IN".equals(log.getType())) {
                lastSwipeIn = log.getTimestamp();
            } else if ("OUT".equals(log.getType()) && lastSwipeIn != null) {
                Duration duration = Duration.between(lastSwipeIn, log.getTimestamp());
                totalHours += duration.toMillis() / (1000.0 * 60 * 60);
                lastSwipeIn = null;
            }
        }
        return totalHours;
    }
}