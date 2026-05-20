package com.studentEnrollmentSystem.exceptions;

public class UserAlreadyExistsException extends RuntimeException{
    public UserAlreadyExistsException(String message) {
        super(message);
    }
    public static UserAlreadyExistsException forEmail(String email) {
        return new UserAlreadyExistsException("A user with email '" + email + "' already exists");
    }
    public static UserAlreadyExistsException forCnie(String cnie) {
        return new UserAlreadyExistsException("A user with CNIE '" + cnie + "' already exists");
    }
}
