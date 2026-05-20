package com.studentEnrollmentSystem.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.studentEnrollmentSystem.models.Student;
import com.studentEnrollmentSystem.services.StudentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/students")
public class StudentController {
	private final StudentService studentService;
	public StudentController(StudentService studentService) {
		this.studentService = studentService;
	}
	@PostMapping
	public ResponseEntity<Student> create(@Valid  @RequestBody Student student, BindingResult result){
		return ResponseEntity.ok(studentService.create(student));
	}
	@GetMapping("/{id}")
    public ResponseEntity<Student> findById(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getStudentById(id));
    }
	@GetMapping("/cnie/{cnie}")
    public ResponseEntity<Student> findByCnie(@PathVariable String cnie) {
        return ResponseEntity.ok(studentService.getStudentByCNIE(cnie));
    }
}
