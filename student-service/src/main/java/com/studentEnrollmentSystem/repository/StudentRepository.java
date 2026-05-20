package com.studentEnrollmentSystem.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.studentEnrollmentSystem.models.Student;

@Repository
public interface StudentRepository extends JpaRepository<Student,Long>{
	Optional<Student> findByCnie(String cnie);
	boolean existsByCnie(String cnie);
}
