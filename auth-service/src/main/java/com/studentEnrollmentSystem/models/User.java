package com.studentEnrollmentSystem.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "users")
public class User {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	@Column(unique = true, nullable = false)
	@Email(message = "Please provide a valid email address")
    private String email;
    @Column(nullable = false)
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    private String password;
    @Column(unique = true, nullable = false)
    private String cnie;
    public Long getId() { 
    		return id; 
    	}
    public String getEmail() { 
    		return email; 
    	}
    public void setEmail(String email) { 
    		this.email = email; 
    	}
    public String getPassword() { 
    		return password; 
    	}
    public void setPassword(String password) { 
    		this.password = password; 
    	}
    public String getCnie() { 
    		return cnie; 
    	}
    public void setCnie(String cnie) { 
    		this.cnie = cnie; 
    	}
}
