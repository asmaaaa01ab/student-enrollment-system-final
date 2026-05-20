package com.studentEnrollmentSystem.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.studentEnrollmentSystem.exceptions.CourseNotFoundException;
import com.studentEnrollmentSystem.models.Course;
import com.studentEnrollmentSystem.repository.CourseRepository;

@Service
public class CourseService {
	private final CourseRepository courseRepository;
	public CourseService(CourseRepository courseRepository) {
		this.courseRepository = courseRepository;
	}
	
	public List<Course> findAll() {
        return courseRepository.findAll();
    }

    public Course findById(Long id) {
        return courseRepository.findById(id).orElseThrow(() -> new CourseNotFoundException(id));
    }

    public List<Course> search(String keyword) {
        return courseRepository.findByTitleContainingIgnoreCase(keyword);
    }

    public Course create(Course course) {
        return courseRepository.save(course);
    }

    public void delete(Long id) {
        findById(id);
        courseRepository.deleteById(id);
    }
}
