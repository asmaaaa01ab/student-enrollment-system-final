package com.studentEnrollmentSystem.exceptions;

public class EnrollmentCancellationExpiredException extends RuntimeException{
	public EnrollmentCancellationExpiredException(Long id) {
        super("Cannot delete enrollment #" + id + ": the 24-hour cancellation window has passed");
    }
}
