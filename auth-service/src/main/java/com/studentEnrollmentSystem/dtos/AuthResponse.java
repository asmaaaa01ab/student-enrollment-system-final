package com.studentEnrollmentSystem.dtos;

public class AuthResponse {
	private String token;
    private String cnie;
    private String email;

    public AuthResponse(String token, String cnie, String email) {
        this.token = token;
        this.cnie = cnie;
        this.email = email;
    }

    public String getToken() { return token; }
    public String getCnie() { return cnie; }
    public String getEmail() { return email; }
}
