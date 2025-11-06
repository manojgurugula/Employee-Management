package com.example.demo.controller;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.ManagerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ManagerService managerService;

    @PostMapping
    public ResponseEntity<User> register(@RequestBody User user) {
        if (user.getEmail() == null || user.getRole() == null) {
            return ResponseEntity.badRequest().body(null);
        }
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(null);
        }

        user.setRole(user.getRole().toUpperCase());

        if ("EMPLOYEE".equals(user.getRole())) {
            if (user.getManager() == null || user.getManager().getId() == null) {
                return ResponseEntity.badRequest().body(null);
            }
            Optional<User> manager = userRepository.findById(user.getManager().getId());
            if (manager.isEmpty() || !"MANAGER".equals(manager.get().getRole())) {
                return ResponseEntity.badRequest().body(null);
            }
            user.setManager(manager.get());
        } else if ("MANAGER".equals(user.getRole())) {
            user.setManager(null);
        }

        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(savedUser);
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/managers")
    public ResponseEntity<List<User>> getManagers() {
        List<User> managers = userRepository.findByRole("MANAGER");
        return ResponseEntity.ok(managers);
    }

    @GetMapping("/manager/{managerId}/employees")
    public ResponseEntity<List<User>> getEmployeesByManager(@PathVariable Long managerId) {
        return ResponseEntity.ok(managerService.getEmployeesOfManager(managerId));
    }
}