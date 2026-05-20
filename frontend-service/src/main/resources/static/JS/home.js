const TOKEN = localStorage.getItem('jwt_token');
const STORED_CNIE = localStorage.getItem('user_cnie');
if (!TOKEN) {
    window.location.href = '/login';
}

function authHeaders() {
    return TOKEN
        ? { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }
        : { 'Content-Type': 'application/json' };
}

let allCourses = [];
let currentKeyword = '';
let currentCnie = STUDENT_CNIE || STORED_CNIE || '';
let currentEnrollments = [];

const coursesContainer = document.getElementById('coursesList');
const coursesEmpty = document.getElementById('coursesEmpty');
const enrolledContainer = document.getElementById('enrolledList');
const searchInput = document.getElementById('searchInput');
const searchForm = document.getElementById('searchForm');
const cnieForm = document.getElementById('cnieForm');
const cnieInput = document.getElementById('cnieInput');

// ── Enroll modal elements ──────────────────────────────────────────────────
const modal = document.getElementById('enrollModal');
const modalClose = document.getElementById('modalClose');
const modalCancelBtn = document.getElementById('modalCancelBtn');
const modalCourseTitle = document.getElementById('modalCourseTitle');
const modalCourseDesc = document.getElementById('modalCourseDesc');
const modalCredits = document.getElementById('modalCredits');
const modalEnrollBtn = document.getElementById('modalEnrollBtn');
const modalFeedback = document.getElementById('modalFeedback');
let currentModalCourse = null;

// ── Course-full modal elements ─────────────────────────────────────────────
const courseFullModal = document.getElementById('courseFullModal');
const courseFullClose = document.getElementById('courseFullClose');
const courseFullOkBtn = document.getElementById('courseFullOkBtn');
const courseFullCourseName = document.getElementById('courseFullCourseName');
const deleteConfirmModal = document.getElementById('deleteConfirmModal');
const deleteConfirmClose = document.getElementById('deleteConfirmClose');
const deleteConfirmCancelBtn = document.getElementById('deleteConfirmCancelBtn');
const deleteConfirmOkBtn = document.getElementById('deleteConfirmOkBtn');
const deleteConfirmCourseName = document.getElementById('deleteConfirmCourseName');
const deleteConfirmTimeLeft = document.getElementById('deleteConfirmTimeLeft');
const deleteExpiredModal = document.getElementById('deleteExpiredModal');
const deleteExpiredClose = document.getElementById('deleteExpiredClose');
const deleteExpiredOkBtn = document.getElementById('deleteExpiredOkBtn');
const deleteExpiredCourseName = document.getElementById('deleteExpiredCourseName');
let pendingDeleteEnrollmentId = null;
let pendingDeleteCnie = null;
let countdownInterval = null;

async function resolveStudentId(cnie) {
    try {
        const res = await fetch(`${GATEWAY_URL}/students/cnie/${encodeURIComponent(cnie)}`, {
            headers: authHeaders()
        });
        if (!res.ok) return null;
        const student = await res.json();
        return student.id || null;
    } catch (e) {
        return null;
    }
}

async function init() {
    if (cnieInput && currentCnie) cnieInput.value = currentCnie;
    showCoursesPlaceholder();
    showEnrolledPlaceholder();
    setupEventListeners();
    if (searchInput) searchInput.value = currentKeyword;
}

function showCoursesPlaceholder() {
    coursesContainer.innerHTML = '';
    coursesEmpty.style.display = 'block';
    coursesEmpty.innerHTML = '<p>Please enter your CNIE to view available courses.</p>';
}

async function loadCourses() {
    if (!currentCnie || currentCnie.trim() === '') {
        showCoursesPlaceholder();
        return;
    }
    showSkeletons();
    try {
        let url = `${GATEWAY_URL}/courses`;
        if (currentKeyword && currentKeyword.trim() !== '') {
            url = `${GATEWAY_URL}/courses/search?keyword=${encodeURIComponent(currentKeyword)}`;
        }
        const response = await fetch(url, { headers: authHeaders() });
        if (!response.ok) throw new Error('Failed to fetch courses');
        allCourses = await response.json();
        renderCourses(allCourses);
    } catch (error) {
        console.error('Error loading courses:', error);
        showCoursesError();
    }
}

async function loadEnrollments(cnie) {
    if (!cnie || cnie.trim() === '') {
        showEnrolledPlaceholder();
        return;
    }
    showEnrolledSkeletons();
    try {
        const response = await fetch(
            `${GATEWAY_URL}/enrollments/${encodeURIComponent(cnie)}`,
            { headers: authHeaders() }
        );
        if (response.status === 404) {
            currentEnrollments = [];
            renderEnrolledCourses([]);
            return;
        }
        if (!response.ok) throw new Error('Failed to fetch enrollments');
        const enrollments = await response.json();
        currentEnrollments = enrollments;
        renderEnrolledCourses(enrollments);
    } catch (error) {
        console.error('Error loading enrollments:', error);
        showEnrolledError();
    }
}

async function enrollStudent(cnie, courseId) {
    const studentId = await resolveStudentId(cnie);
    if (!studentId) {
        return { success: false, message: 'Student not found for this CNIE.' };
    }
    try {
        const response = await fetch(`${GATEWAY_URL}/enrollments`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ studentId, courseId })
        });
        if (response.status === 409) {
            const errorData = await response.json().catch(() => ({}));
            const msg = (errorData.error || '').toLowerCase();
            if (msg.includes('full')) {
                return { success: false, courseFull: true, message: errorData.error };
            }
            return { success: false, message: 'You are already enrolled in this course.' };
        }
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, message: errorData.message || errorData.error || 'Error while enrolling.' };
        }
        const enrollment = await response.json();
        return { success: true, enrollment, message: 'Enrollment successful!' };
    } catch (error) {
        return { success: false, message: 'Server connection error.' };
    }
}

function openEnrollModal(course) {
    currentModalCourse = course;
    modalCourseTitle.textContent = course.title || course.name || 'Untitled';
    modalCourseDesc.textContent = course.description || 'No description available.';
    modalCredits.textContent = `${course.credits || 0} credits`;
    modalFeedback.innerHTML = '';
    modalFeedback.className = 'modal-feedback';
    modal.style.display = 'flex';
    const connectedCnie = STORED_CNIE || STUDENT_CNIE || currentCnie || '';
    const display = document.getElementById('modalCnieDisplay');
    if (display) display.textContent = connectedCnie;
}

function closeModal() {
    modal.style.display = 'none';
    currentModalCourse = null;
    modalFeedback.innerHTML = '';
    modalFeedback.className = 'modal-feedback';
    modalEnrollBtn.disabled = false;
    modalEnrollBtn.textContent = 'Confirm Enrollment';
}

async function handleEnrollSubmit() {
    if (!currentModalCourse) return;
    const cnie = STORED_CNIE || STUDENT_CNIE || currentCnie;
    if (!cnie) {
        showModalFeedback('CNIE not found. Please log in again.', 'error');
        return;
    }
    modalEnrollBtn.disabled = true;
    modalEnrollBtn.textContent = 'Enrolling...';
    const result = await enrollStudent(cnie, currentModalCourse.id);
    if (result.success) {
        showModalFeedback(result.message, 'success');
        currentCnie = cnie;
        if (cnieInput) cnieInput.value = cnie;
        await loadEnrollments(currentCnie);
        await loadCourses();
        setTimeout(() => closeModal(), 1500);
    } else if (result.courseFull) {
        closeModal();
        openCourseFullModal(currentModalCourse ? (currentModalCourse.title || currentModalCourse.name) : 'this course');
    } else {
        showModalFeedback(result.message, 'error');
        modalEnrollBtn.disabled = false;
        modalEnrollBtn.textContent = 'Confirm Enrollment';
    }
}

function showModalFeedback(message, type) {
    modalFeedback.innerHTML = message;
    modalFeedback.className = `modal-feedback ${type}`;
}

function openCourseFullModal(courseName) {
    if (courseFullCourseName) courseFullCourseName.textContent = courseName;
    courseFullModal.style.display = 'flex';
}

function closeCourseFullModal() {
    courseFullModal.style.display = 'none';
}

function computeTimeLeft(enrollmentDateISO) {
    const enrolledAt = new Date(enrollmentDateISO);
    const deadline = new Date(enrolledAt.getTime() + 24 * 60 * 60 * 1000);
    const now = new Date();
    const msLeft = deadline - now;
    if (msLeft <= 0) return null;
    const totalSecs = Math.floor(msLeft / 1000);
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return { h, m, s, msLeft };
}

function formatTimeLeft(h, m, s) {
    const pad = n => String(n).padStart(2, '0');
    if (h > 0) return `${h}h ${pad(m)}m ${pad(s)}s`;
    if (m > 0) return `${pad(m)}m ${pad(s)}s`;
    return `${pad(s)}s`;
}

function openDeleteConfirmModal(enrollment) {
    pendingDeleteEnrollmentId = enrollment.enrollmentId;
    pendingDeleteCnie = currentCnie;
    if (deleteConfirmCourseName) deleteConfirmCourseName.textContent = enrollment.courseName;
    if (countdownInterval) clearInterval(countdownInterval);
    function updateCountdown() {
        const t = computeTimeLeft(enrollment.enrollmentDate || enrollment.date);
        if (!t) {
            clearInterval(countdownInterval);
            closeDeleteConfirmModal();
            openDeleteExpiredModal(enrollment.courseName);
            return;
        }
        if (deleteConfirmTimeLeft) {
            deleteConfirmTimeLeft.textContent = formatTimeLeft(t.h, t.m, t.s);
        }
    }
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
    deleteConfirmModal.style.display = 'flex';
}

function closeDeleteConfirmModal() {
    if (countdownInterval) clearInterval(countdownInterval);
    countdownInterval = null;
    deleteConfirmModal.style.display = 'none';
    pendingDeleteEnrollmentId = null;
    pendingDeleteCnie = null;
}

function openDeleteExpiredModal(courseName) {
    if (deleteExpiredCourseName) deleteExpiredCourseName.textContent = courseName;
    deleteExpiredModal.style.display = 'flex';
}

function closeDeleteExpiredModal() {
    deleteExpiredModal.style.display = 'none';
}

async function confirmDelete() {
    if (!pendingDeleteEnrollmentId) return;
    const id = pendingDeleteEnrollmentId;
    const cnie = pendingDeleteCnie;
    closeDeleteConfirmModal();
    const result = await deleteEnrollment(id, cnie);
    if (!result.success && result.message) {
        showToast(result.message, 'error');
    }
}

async function deleteEnrollment(enrollmentId, cnie) {
    try {
        const response = await fetch(`${GATEWAY_URL}/enrollments/${enrollmentId}`, {
            method: 'DELETE',
            headers: authHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete enrollment');
        await loadEnrollments(cnie);
        await loadCourses();
        return { success: true };
    } catch (error) {
        return { success: false, message: 'Error while removing enrollment.' };
    }
}

function renderCourses(courses) {
    coursesContainer.innerHTML = '';
    if (!courses || courses.length === 0) {
        coursesContainer.style.display = 'none';
        coursesEmpty.style.display = 'block';
        coursesEmpty.innerHTML = '<p>No courses found.</p>';
        return;
    }
    coursesContainer.style.display = 'grid';
    coursesEmpty.style.display = 'none';
    const enrolledCourseIds = new Set(currentEnrollments.map(e => e.courseId));
    courses.forEach(course => {
        const isEnrolled = enrolledCourseIds.has(course.id);
        coursesContainer.appendChild(createCourseCard(course, isEnrolled));
    });
}

function createCourseCard(course, isEnrolled) {
    const div = document.createElement('div');
    div.className = 'course-card';
    div.setAttribute('data-course-id', course.id);
    if (isEnrolled) {
        const badge = document.createElement('div');
        badge.className = 'enroll-badge';
        badge.textContent = 'Enrolled';
        div.appendChild(badge);
    }
    const title = document.createElement('h3');
    title.className = 'course-card-title';
    title.textContent = course.title || course.name || 'Untitled';
    const description = document.createElement('p');
    description.className = 'course-card-desc';
    description.textContent = course.description || 'No description available.';
    const credits = document.createElement('span');
    credits.className = 'course-card-credits';
    credits.textContent = `${course.credits || 0} credits`;
    const enrollBtn = document.createElement('button');
    enrollBtn.className = 'enroll-btn';
    enrollBtn.textContent = isEnrolled ? 'Enrolled' : 'Enroll';
    if (isEnrolled) {
        enrollBtn.disabled = true;
        enrollBtn.style.opacity = '0.6';
        enrollBtn.style.cursor = 'not-allowed';
    }
    div.appendChild(title);
    div.appendChild(description);
    div.appendChild(credits);
    div.appendChild(enrollBtn);
    enrollBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!isEnrolled) {
            openEnrollModal(course);
        } else {
            showToast('You are already enrolled in this course.', 'info');
        }
    });
    return div;
}

function renderEnrolledCourses(enrollments) {
    enrolledContainer.innerHTML = '';
    if (!enrollments || enrollments.length === 0) {
        const placeholder = document.createElement('div');
        placeholder.className = 'enrolled-placeholder';
        placeholder.innerHTML = '<p>No enrollments found for this CNIE.</p>';
        enrolledContainer.appendChild(placeholder);
        return;
    }
    enrollments.forEach(enrollment => {
        enrolledContainer.appendChild(createEnrolledCard(enrollment));
    });
}

function createEnrolledCard(enrollment) {
    const div = document.createElement('div');
    div.className = 'enrolled-card';
    const label = document.createElement('div');
    label.className = 'enrolled-label';
    label.textContent = 'Enrolled';
    const title = document.createElement('h3');
    title.className = 'enrolled-card-title';
    title.textContent = enrollment.courseName || 'Untitled';
    const description = document.createElement('p');
    description.className = 'enrolled-card-desc';
    description.textContent = enrollment.courseDescription || 'No description available.';
    const credits = document.createElement('span');
    credits.className = 'enrolled-card-credits';
    credits.textContent = `${enrollment.courseCredits || 0} credits`;
    div.appendChild(label);
    div.appendChild(title);
    div.appendChild(description);
    div.appendChild(credits);
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '✕';
    deleteBtn.title = 'Unenroll';
    deleteBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const t = computeTimeLeft(enrollment.enrollmentDate || enrollment.date);
        if (t) {
            openDeleteConfirmModal(enrollment);
        } else {
            openDeleteExpiredModal(enrollment.courseName);
        }
    });
    div.appendChild(deleteBtn);

    return div;
}

function showSkeletons() {
    coursesContainer.innerHTML = '';
    coursesEmpty.style.display = 'none';
    coursesContainer.style.display = 'grid';
    for (let i = 0; i < 6; i++) {
        const s = document.createElement('div');
        s.className = 'skeleton-card';
        coursesContainer.appendChild(s);
    }
}

function showEnrolledSkeletons() {
    enrolledContainer.innerHTML = '';
    for (let i = 0; i < 2; i++) {
        const s = document.createElement('div');
        s.className = 'skeleton-card';
        s.style.height = '100px';
        enrolledContainer.appendChild(s);
    }
}

function showCoursesError() {
    coursesContainer.innerHTML = '';
    coursesEmpty.style.display = 'block';
    coursesEmpty.innerHTML = '<p>❌ Error loading courses. Please try again later.</p>';
}

function showEnrolledPlaceholder() {
    enrolledContainer.innerHTML = '';
    const p = document.createElement('div');
    p.className = 'enrolled-placeholder';
    p.innerHTML = '<p>Enter your CNIE to view your enrollments.</p>';
    enrolledContainer.appendChild(p);
}

function showEnrolledError() {
    enrolledContainer.innerHTML = '';
    const e = document.createElement('div');
    e.className = 'enrolled-placeholder';
    e.innerHTML = '<p>Error loading enrollments.</p>';
    enrolledContainer.appendChild(e);
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed; bottom: 20px; right: 20px;
        background: ${type === 'error' ? '#EF4444' : type === 'success' ? '#6B8F71' : '#4E6B53'};
        color: white; padding: 12px 20px; border-radius: 50px;
        font-size: 0.85rem; font-weight: 500; z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15); max-width: 300px;
    `;
    document.body.appendChild(toast);
    setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 3000);
}

function setupEventListeners() {
    if (searchForm) {
        searchForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!currentCnie) { showToast('Please enter your CNIE first', 'error'); return; }
            currentKeyword = searchInput.value.trim();
            await loadCourses();
        });
    }
    if (cnieForm) {
        cnieForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const cnie = cnieInput.value.trim();
            if (!cnie) { showToast('Please enter a CNIE', 'error'); return; }
            const cniePattern = /^[A-Za-z]{1,2}[0-9]{4,6}$/;
            if (!cniePattern.test(cnie)) {
                showToast('Invalid CNIE format. Format: 1-2 letters followed by 4-6 digits', 'error');
                return;
            }
            const connectedCnie = STORED_CNIE || STUDENT_CNIE;
            if (connectedCnie && cnie.toUpperCase() !== connectedCnie.toUpperCase()) {
                showToast('This CNIE does not match your account. Please use your own CNIE.', 'error');
                cnieInput.value = connectedCnie;
                return;
            }
            currentCnie = cnie;
            await loadCourses();
            await loadEnrollments(cnie);
        });
    }
    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalCancelBtn) modalCancelBtn.addEventListener('click', closeModal);
    if (modalEnrollBtn) modalEnrollBtn.addEventListener('click', handleEnrollSubmit);
    window.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    if (courseFullClose) courseFullClose.addEventListener('click', closeCourseFullModal);
    if (courseFullOkBtn) courseFullOkBtn.addEventListener('click', closeCourseFullModal);
    window.addEventListener('click', (e) => { if (e.target === courseFullModal) closeCourseFullModal(); });
    if (deleteConfirmClose) deleteConfirmClose.addEventListener('click', closeDeleteConfirmModal);
    if (deleteConfirmCancelBtn) deleteConfirmCancelBtn.addEventListener('click', closeDeleteConfirmModal);
    if (deleteConfirmOkBtn) deleteConfirmOkBtn.addEventListener('click', confirmDelete);
    window.addEventListener('click', (e) => { if (e.target === deleteConfirmModal) closeDeleteConfirmModal(); });
    if (deleteExpiredClose) deleteExpiredClose.addEventListener('click', closeDeleteExpiredModal);
    if (deleteExpiredOkBtn) deleteExpiredOkBtn.addEventListener('click', closeDeleteExpiredModal);
    window.addEventListener('click', (e) => { if (e.target === deleteExpiredModal) closeDeleteExpiredModal(); });
    const avatar = document.getElementById('avatarMenu');
    if (avatar) {
        avatar.addEventListener('click', (e) => { e.stopPropagation(); avatar.classList.toggle('open'); });
        document.addEventListener('click', () => avatar.classList.remove('open'));
    }
}
document.addEventListener('DOMContentLoaded', init);
