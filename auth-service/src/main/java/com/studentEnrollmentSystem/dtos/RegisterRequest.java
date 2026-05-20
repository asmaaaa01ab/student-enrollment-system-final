package com.studentEnrollmentSystem.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class RegisterRequest {
	@NotBlank(message = "CNIE is required")
    @Pattern(regexp = "^[A-Za-z]{1,2}[0-9]{4,6}$", message = "CNIE invalide (ex: CD2387)")
	private String cnie;
	@NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address") 
    private String email;
	@NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;
	@NotBlank(message = "First name is required")
    private String firstName;
	@NotBlank(message = "Last name is required")
    private String lastName;
    public String getCnie() { return cnie; }
    public void setCnie(String cnie) { this.cnie = cnie; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
}
