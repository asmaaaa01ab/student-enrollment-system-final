package com.studentEnrollmentSystem.dtos;


public class EnrollmentResponseDTO {
	private Long enrollmentId;
	private String studentCnie;
	private String courseName;
	private String date; 
	private boolean deletable;
	private String courseDescription;
    private int courseCredits;
    private String enrollmentDate;
	public Long getEnrollmentId() { return enrollmentId; }
    public void setEnrollmentId(Long enrollmentId) { this.enrollmentId = enrollmentId; }
    public String getStudentCnie() { return studentCnie; }
    public void setStudentCnie(String studentCnie) { this.studentCnie = studentCnie; }
    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }
    public String getCourseDescription() { return courseDescription; }
    public void setCourseDescription(String courseDescription) { this.courseDescription = courseDescription; }
    public int getCourseCredits() { return courseCredits; }
    public void setCourseCredits(int courseCredits) { this.courseCredits = courseCredits; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public boolean isDeletable() { return deletable; }
    public void setDeletable(boolean deletable) { this.deletable = deletable; }
    public String getEnrollmentDate() { return enrollmentDate; }
    public void setEnrollmentDate(String enrollmentDate) { this.enrollmentDate = enrollmentDate; }

}
