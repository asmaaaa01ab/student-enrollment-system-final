package com.studentEnrollmentSystem.services;

import org.springframework.stereotype.Service;

import com.studentEnrollmentSystem.exceptions.StudentNotFoundException;
import com.studentEnrollmentSystem.models.Student;
import com.studentEnrollmentSystem.repository.StudentRepository;

@Service
public class StudentService {
	public final StudentRepository studentRepository;
	public StudentService(StudentRepository studentRepository) {
		this.studentRepository = studentRepository;
	}
	public Student create(Student student) {
		return studentRepository.save(student);
	}
	public Student getStudentById(Long id) {
		return studentRepository.findById(id).orElseThrow(() -> new StudentNotFoundException(id));
	}
	public Student getStudentByCNIE(String cnie) {
		return studentRepository.findByCnie(cnie).orElseThrow(() -> new StudentNotFoundException(cnie)); 
	}
}
