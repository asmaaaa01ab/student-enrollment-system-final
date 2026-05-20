package com.studentEnrollmentSystem.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.studentEnrollmentSystem.dtos.AuthResponse;
import com.studentEnrollmentSystem.dtos.LoginRequest;
import com.studentEnrollmentSystem.dtos.RegisterRequest;
import com.studentEnrollmentSystem.dtos.StudentRequest;
import com.studentEnrollmentSystem.exceptions.UserAlreadyExistsException;
import com.studentEnrollmentSystem.models.User;
import com.studentEnrollmentSystem.repository.UserRepository;
import com.studentEnrollmentSystem.security.JwtUtil;

@Service
public class AuthService {
	private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final WebClient.Builder webClientBuilder;
    public AuthService(UserRepository userRepository,PasswordEncoder passwordEncoder,JwtUtil jwtUtil,WebClient.Builder webClientBuilder) {
    		this.userRepository = userRepository;
    		this.passwordEncoder = passwordEncoder;
    		this.jwtUtil = jwtUtil;
    		this.webClientBuilder = webClientBuilder;
    }
    
    @Value("${student-service.url}")
    private String studentServiceUrl;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
        		throw UserAlreadyExistsException.forEmail(request.getEmail());
        }
        if (userRepository.existsByCnie(request.getCnie())) {
        		throw UserAlreadyExistsException.forCnie(request.getCnie());
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setCnie(request.getCnie());
        userRepository.save(user);

        StudentRequest studentRequest = new StudentRequest(
            request.getCnie(),
            request.getFirstName(),
            request.getLastName(),
            request.getEmail()
        );

        webClientBuilder.build()
            .post()
            .uri(studentServiceUrl + "/students")
            .bodyValue(studentRequest)
            .retrieve()
            .bodyToMono(Void.class)
            .subscribe();

        String token = jwtUtil.generateToken(user.getEmail(), user.getCnie());
        return new AuthResponse(token, user.getCnie(), user.getEmail());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("Email introuvable"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Mot de passe incorrect");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getCnie());
        return new AuthResponse(token, user.getCnie(), user.getEmail());
    }

    public boolean validateToken(String token) {
        return jwtUtil.validateToken(token);
    }
}
