package com.studentEnrollmentSystem.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.studentEnrollmentSystem.dtos.EnrollmentRequest;
import com.studentEnrollmentSystem.dtos.EnrollmentResponseDTO;
import com.studentEnrollmentSystem.models.Enrollment;
import com.studentEnrollmentSystem.services.EnrollmentService;

import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/enrollments")
public class EnrollmentController {
	private final EnrollmentService enrollmentService;
    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }
    
    @PostMapping
    public Mono<ResponseEntity<Enrollment>> enrollStudent(@RequestBody EnrollmentRequest request) {
        return enrollmentService.enrollStudent(request)
            .map(enrollment -> ResponseEntity.ok(enrollment));
    }
    
    @GetMapping("/{cnie}")
    public Mono<ResponseEntity<List<EnrollmentResponseDTO>>> getMyEnrollments(@PathVariable String cnie) {
        return enrollmentService.getMyEnrollments(cnie)
            .map(list -> ResponseEntity.ok(list));
    }
    
    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<Void>> deleteEnrollment(@PathVariable Long id) {
        return enrollmentService.deleteEnrollment(id)
            .then(Mono.just(ResponseEntity.<Void>noContent().build()));
    }
    
    @GetMapping("/courses")
    public Mono<ResponseEntity<List>> getAllCourses() {
        return enrollmentService.getAllCourses()
            .map(courses -> ResponseEntity.ok(courses));
    }
    
}
