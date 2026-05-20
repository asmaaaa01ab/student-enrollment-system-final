package com.studentEnrollmentSystem.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.studentEnrollmentSystem.models.User;

public interface UserRepository extends JpaRepository<User,Long>{
	Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByCnie(String cnie);
}
