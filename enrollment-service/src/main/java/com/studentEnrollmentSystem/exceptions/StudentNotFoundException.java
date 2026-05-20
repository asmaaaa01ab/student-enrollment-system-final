package com.studentEnrollmentSystem.exceptions;

public class StudentNotFoundException extends RuntimeException{
	public StudentNotFoundException(Long id) {
		super("Student not found with this id : " + id);
	}
	public StudentNotFoundException(String cnie) {
		super("Student not found with this CNIE : " + cnie);
	}
}
