package com.studentEnrollmentSystem.clients;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import reactor.core.publisher.Mono;

@Component
public class CourseClient {
	private final WebClient webClient;
	public CourseClient(WebClient.Builder webClientBuilder) {
		this.webClient = webClientBuilder.baseUrl("http://course-service").build();
	}
	public Mono<Map> getCourseById(Long id) {
        return webClient.get().uri("/courses/{id}", id).retrieve().bodyToMono(Map.class);
    }

    public Mono<List> getAllCourses() {
        return webClient.get().uri("/courses").retrieve().bodyToMono(List.class);
    }
}
