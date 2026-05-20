package com.studentEnrollmentSystem.course_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.studentEnrollmentSystem")
@EnableJpaRepositories(basePackages = "com.studentEnrollmentSystem.repository")
@EntityScan(basePackages = "com.studentEnrollmentSystem.models")
@EnableDiscoveryClient
public class CourseServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(CourseServiceApplication.class, args);
	}

}
