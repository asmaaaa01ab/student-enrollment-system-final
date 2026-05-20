package com.studentEnrollmentSystem.exceptions;

public class EnrollmentNotFoundException extends RuntimeException{
	public EnrollmentNotFoundException(Long id) {
		super("Enrollment not found with this id : " + id);
	}

}
