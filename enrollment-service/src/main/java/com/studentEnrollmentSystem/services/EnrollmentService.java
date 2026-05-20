package com.studentEnrollmentSystem.services;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.studentEnrollmentSystem.clients.CourseClient;
import com.studentEnrollmentSystem.clients.StudentClient;
import com.studentEnrollmentSystem.dtos.EnrollmentRequest;
import com.studentEnrollmentSystem.dtos.EnrollmentResponseDTO;
import com.studentEnrollmentSystem.exceptions.AlreadyEnrolledException;
import com.studentEnrollmentSystem.exceptions.CourseFullException;
import com.studentEnrollmentSystem.exceptions.CourseNotFoundException;
import com.studentEnrollmentSystem.exceptions.EnrollmentCancellationExpiredException;
import com.studentEnrollmentSystem.exceptions.EnrollmentNotFoundException;
import com.studentEnrollmentSystem.exceptions.StudentNotFoundException;
import com.studentEnrollmentSystem.models.Enrollment;
import com.studentEnrollmentSystem.repository.EnrollmentRepository;

import reactor.core.publisher.Mono;

@Service
public class EnrollmentService {
	private final EnrollmentRepository enrollmentRepository;
	private final StudentClient studentClient;
	private final CourseClient courseClient;
	public EnrollmentService(EnrollmentRepository enrollmentRepository,StudentClient studentClient,CourseClient courseClient) {
		this.enrollmentRepository = enrollmentRepository;
		this.studentClient = studentClient;
		this.courseClient = courseClient;
	}
	private static final int MaxStudent = 3;
    private static final int PeriodeLimite = 24;
    
    public Mono<Enrollment> enrollStudent(EnrollmentRequest request) {
        Long studentId = request.getStudentId();
        Long courseId = request.getCourseId();

        Mono<Map> studentCheck = studentClient.getStudentById(studentId).onErrorMap(e -> new StudentNotFoundException(studentId));
        Mono<Map> courseCheck = courseClient.getCourseById(courseId).onErrorMap(e -> new CourseNotFoundException(courseId)); 

        return Mono.zip(studentCheck, courseCheck)
            .flatMap(tuple -> {
                if (enrollmentRepository.existsByStudentIdAndCourseId(studentId, courseId)) {
                		return Mono.error(new AlreadyEnrolledException(studentId, courseId));
                }
                long count = enrollmentRepository.countByCourseId(courseId);
                if (count >= MaxStudent) {
                    return Mono.error(new CourseFullException(courseId));
                }
                Enrollment enrollment = new Enrollment();
                enrollment.setStudentId(studentId);
                enrollment.setCourseId(courseId);
                enrollment.setEnrollmentDate(LocalDateTime.now());
                return Mono.just(enrollmentRepository.save(enrollment));
            });
    }
    
    private Mono<EnrollmentResponseDTO> buildDTO(Enrollment enrollment, String cnie) {
        return courseClient.getCourseById(enrollment.getCourseId())
            .map(course -> {
                EnrollmentResponseDTO dto = new EnrollmentResponseDTO();
                dto.setEnrollmentId(enrollment.getId());
                dto.setStudentCnie(cnie);
                dto.setCourseName(course.get("title").toString());
                dto.setCourseDescription(
                    course.get("description") != null ? course.get("description").toString() : ""
                );
                dto.setCourseCredits(
                    course.get("credits") != null ? Integer.parseInt(course.get("credits").toString()) : 0
                );
                String isoDate = enrollment.getEnrollmentDate()
                        .format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                    dto.setDate(isoDate);
                    dto.setEnrollmentDate(isoDate);

                boolean deletable = enrollment.getEnrollmentDate()
                    .isAfter(LocalDateTime.now().minusHours(PeriodeLimite));
                dto.setDeletable(deletable);

                return dto;
            });
    }
    
    public Mono<List<EnrollmentResponseDTO>> getMyEnrollments(String cnie) {
        return studentClient.getStudentByCnie(cnie)
            .onErrorMap(e -> new StudentNotFoundException(cnie))
            .flatMap(student -> {
                Long studentId = Long.valueOf(student.get("id").toString());
                List<Enrollment> enrollments = enrollmentRepository.findByStudentId(studentId);

                if (enrollments.isEmpty()) {
                    return Mono.just(Collections.emptyList());
                }

                List<Mono<EnrollmentResponseDTO>> dtoMonos = enrollments.stream()
                    .map(enrollment -> buildDTO(enrollment, cnie))
                    .collect(Collectors.toList());

                return Mono.zip(dtoMonos, results ->
                    Arrays.stream(results)         
                        .map(r -> (EnrollmentResponseDTO) r)
                        .collect(Collectors.toList())
                );                                             
            });
    }
    
    public Mono<Void> deleteEnrollment(Long enrollmentId) {
        return Mono.fromRunnable(() -> {          
            Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new EnrollmentNotFoundException(enrollmentId));

            boolean deletable = enrollment.getEnrollmentDate()
                .isAfter(LocalDateTime.now().minusHours(PeriodeLimite));

            if (!deletable) {
                throw new EnrollmentCancellationExpiredException(enrollmentId);
            }

            enrollmentRepository.deleteById(enrollmentId);
        });
    }
    
    public Mono<List> getAllCourses() {
        return courseClient.getAllCourses();
    }
	
}
