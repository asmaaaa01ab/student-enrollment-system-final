package com.studentEnrollmentSystem.exceptions;

public class CourseNotFoundException extends RuntimeException{
	public CourseNotFoundException(Long id) {
		super("Course not found with this id : " + id);
	}
}
