package com.studentEnrollmentSystem.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.studentEnrollmentSystem.models.Course;

@Repository
public interface CourseRepository extends JpaRepository<Course,Long>{
	List<Course> findByTitleContainingIgnoreCase(String keyword);
}
