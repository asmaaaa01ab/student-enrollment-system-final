package com.studentEnrollmentSystem.controllers;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;

@Controller
public class GlobalErrorController implements ErrorController{
	@RequestMapping("/error")
    public String handleError(HttpServletRequest request, Model model) {
        Object statusCode = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        if (statusCode != null) {
            int status = Integer.parseInt(statusCode.toString());
            if (status == HttpStatus.NOT_FOUND.value()) {
                model.addAttribute("message",
                    "La page que vous cherchez n'existe pas ou a été déplacée.");
                return "errors/404";
            }

            if (status == HttpStatus.FORBIDDEN.value()) {
                model.addAttribute("message",
                    "Vous n'avez pas la permission d'accéder à cette page.");
                return "errors/404"; 
            }

            if (status == HttpStatus.INTERNAL_SERVER_ERROR.value()) {
                model.addAttribute("message",
                    "Une erreur inattendue s'est produite. Veuillez réessayer plus tard.");
                return "errors/500";
            }
        }
        model.addAttribute("message",
            "Une erreur inattendue s'est produite.");
        return "errors/500";
    }
}
