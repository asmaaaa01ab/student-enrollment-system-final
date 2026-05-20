package com.studentEnrollmentSystem.exceptions;

public class CourseFullException extends RuntimeException{
	public CourseFullException(Long id) {
		super("This course is full!");
	}
}
