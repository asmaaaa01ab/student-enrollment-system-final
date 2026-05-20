package com.studentEnrollmentSystem.dtos;

public class EnrollmentRequest {
	private Long studentId;
    private Long courseId;
    public Long getStudentId() { 
    		return studentId; 
    	}
    public void setStudentId(Long studentId) { 
    		this.studentId = studentId; 
    	}
    public Long getCourseId() { 
    		return courseId; 
    	}
    public void setCourseId(Long courseId) { 
    		this.courseId = courseId; 
    	}
}
