package com.studentEnrollmentSystem.dtos;

public class StudentRequest {
	private String cnie;
    private String firstName;
    private String lastName;
    private String email;

    public StudentRequest(String cnie, String firstName, String lastName, String email) {
        this.cnie = cnie;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
    }

    public String getCnie() { return cnie; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getEmail() { return email; }
}
