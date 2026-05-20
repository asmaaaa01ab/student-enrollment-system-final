package com.studentEnrollmentSystem.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {
	@GetMapping("/")
	public String index() {
		return "redirect:/login"; 
	}

	@GetMapping("/login")
    public String login() {
        return "login";     
    }

    @GetMapping("/register")
    public String register() {
        return "register";   
    }

    @GetMapping("/home")
    public String home() {
        return "home";      
    }
}
