package com.studentEnrollmentSystem.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.studentEnrollmentSystem.models.Enrollment;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment,Long>{
    List<Enrollment> findByStudentId(Long studentId);
    long countByCourseId(Long courseId); //utiliser pour la contrainte de <3
    boolean existsByStudentIdAndCourseId(Long studentId, Long courseId);
}
