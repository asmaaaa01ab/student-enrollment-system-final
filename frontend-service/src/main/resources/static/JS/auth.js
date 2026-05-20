const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
function showAlert(element, message, type = 'error') {
    if (!element) return;
    const existingAlerts = element.parentElement.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    element.parentElement.insertBefore(alertDiv, element);
    setTimeout(() => {
        if (alertDiv.parentElement) {
            alertDiv.style.transition = 'opacity 0.3s';
            alertDiv.style.opacity = '0';
            setTimeout(() => {
                if (alertDiv.parentElement) alertDiv.remove();
            }, 300);
        }
    }, 5000);
}

function removeExistingAlerts(form) {
    const alerts = form.parentElement.querySelectorAll('.alert');
    alerts.forEach(alert => alert.remove());
}

function validateEmail(email) {
    const re = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    return re.test(email);
}

function validateCnie(cnie) {
    const re = /^[A-Za-z]{1,2}[0-9]{4,6}$/;
    return re.test(cnie);
}

function validatePassword(password) {
    return password && password.length >= 8;
}
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        const email = loginForm.querySelector('input[name="email"]');
        const password = loginForm.querySelector('input[name="password"]');
        let isValid = true;
        let errorMessage = '';
        removeExistingAlerts(loginForm);
        if (!email.value.trim()) {
            errorMessage = 'Veuillez entrer votre adresse email.';
            isValid = false;
        } else if (!validateEmail(email.value.trim())) {
            errorMessage = 'Veuillez entrer une adresse email valide.';
            isValid = false;
        }
        if (isValid && !password.value.trim()) {
            errorMessage = 'Veuillez entrer votre mot de passe.';
            isValid = false;
        }
        if (!isValid) {
            e.preventDefault();
            showAlert(loginForm, errorMessage, 'error');
            return;
        }
        e.preventDefault();
        const payload = {
            email:    email.value.trim(),
            password: password.value.trim()
        };
        fetch('http://localhost:8080/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(async res => {
            const data = await res.json().catch(() => ({}));
            if (res.ok) {
                if (data.token) {
                    localStorage.setItem('jwt_token', data.token);
                    if (data.cnie) localStorage.setItem('user_cnie', data.cnie);
                }
                window.location.href = '/home';
            } else {
                const msg = data.message || data.error || 'Email ou mot de passe incorrect.';
                showAlert(loginForm, msg, 'error');
            }
        })
        .catch(() => {
            showAlert(loginForm, 'Impossible de contacter le serveur. Vérifiez votre connexion.', 'error');
        });
    });
    const emailInput = loginForm.querySelector('input[name="email"]');
    const passwordInput = loginForm.querySelector('input[name="password"]');
    if (emailInput) {
        emailInput.addEventListener('input', () => {
            const email = emailInput.value.trim();
            if (email && !validateEmail(email)) {
                emailInput.style.borderColor = '#EF4444';
            } else {
                emailInput.style.borderColor = '';
            }
        });
        emailInput.addEventListener('blur', () => {
            const email = emailInput.value.trim();
            if (email && !validateEmail(email)) {
                emailInput.style.borderColor = '#EF4444';
            } else {
                emailInput.style.borderColor = '';
            }
        });
    }
    if (passwordInput) {
        passwordInput.addEventListener('input', () => {
            if (passwordInput.value && passwordInput.value.length < 8) {
                passwordInput.style.borderColor = '#EF4444';
            } else {
                passwordInput.style.borderColor = '';
            }
        });
    }
}

if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        const cnie = registerForm.querySelector('input[name="cnie"]');
        const email = registerForm.querySelector('input[name="email"]');
        const firstName = registerForm.querySelector('input[name="firstName"]');
        const lastName = registerForm.querySelector('input[name="lastName"]');
        const password = registerForm.querySelector('input[name="password"]');
        const confirmPassword = registerForm.querySelector('input[name="confirmPassword"]');
        
        let isValid = true;
        let errorMessage = '';
        
        removeExistingAlerts(registerForm);
        
        if (!cnie.value.trim()) {
            errorMessage = 'Veuillez entrer votre CNIE.';
            isValid = false;
        } else if (!validateCnie(cnie.value.trim())) {
            errorMessage = 'CNIE invalide. Format: 1-2 lettres suivies de 4-6 chiffres (ex: CD2387)';
            isValid = false;
        }
        
        if (isValid && !email.value.trim()) {
            errorMessage = 'Veuillez entrer votre adresse email.';
            isValid = false;
        } else if (isValid && !validateEmail(email.value.trim())) {
            errorMessage = 'Veuillez entrer une adresse email valide.';
            isValid = false;
        }
        
        if (isValid && !firstName.value.trim()) {
            errorMessage = 'Veuillez entrer votre prénom.';
            isValid = false;
        } else if (isValid && firstName.value.trim().length < 2) {
            errorMessage = 'Le prénom doit contenir au moins 2 caractères.';
            isValid = false;
        }
        
        if (isValid && !lastName.value.trim()) {
            errorMessage = 'Veuillez entrer votre nom.';
            isValid = false;
        } else if (isValid && lastName.value.trim().length < 2) {
            errorMessage = 'Le nom doit contenir au moins 2 caractères.';
            isValid = false;
        }
        
        if (isValid && !password.value.trim()) {
            errorMessage = 'Veuillez créer un mot de passe.';
            isValid = false;
        } else if (isValid && !validatePassword(password.value.trim())) {
            errorMessage = 'Le mot de passe doit contenir au moins 8 caractères.';
            isValid = false;
        }
        
        if (isValid && password.value.trim() !== confirmPassword.value.trim()) {
            errorMessage = 'Les mots de passe ne correspondent pas.';
            isValid = false;
        }
        
        if (!isValid) {
            e.preventDefault();
            showAlert(registerForm, errorMessage, 'error');
            return;
        }
        e.preventDefault();

        const payload = {
            cnie:      cnie.value.trim(),
            email:     email.value.trim(),
            firstName: firstName.value.trim(),
            lastName:  lastName.value.trim(),
            password:  password.value.trim()
        };
        fetch('http://localhost:8080/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(async res => {
            const data = await res.json().catch(() => ({}));
            if (res.ok) {
                showAlert(registerForm, 'Compte créé avec succès ! Redirection...', 'success');
                setTimeout(() => window.location.href = '/login', 1500);
            } else {
                const msg = data.message || data.error || 'Erreur lors de la création du compte.';
                showAlert(registerForm, msg, 'error');
            }
        })
        .catch(() => {
            showAlert(registerForm, 'Impossible de contacter le serveur. Vérifiez votre connexion.', 'error');
        });
    });
    
    const cnieInput = registerForm.querySelector('input[name="cnie"]');
    const emailInput = registerForm.querySelector('input[name="email"]');
    const firstNameInput = registerForm.querySelector('input[name="firstName"]');
    const lastNameInput = registerForm.querySelector('input[name="lastName"]');
    const passwordInput = registerForm.querySelector('input[name="password"]');
    const confirmInput = registerForm.querySelector('input[name="confirmPassword"]');
    
    function validateField(input, validator, errorColor = '#EF4444', successColor = '') {
        if (!input) return;
        const value = input.value.trim();
        if (value && !validator(value)) {
            input.style.borderColor = errorColor;
            return false;
        } else if (value && validator(value)) {
            input.style.borderColor = successColor;
            return true;
        }
        input.style.borderColor = '';
        return null;
    }
    
    if (cnieInput) {
        cnieInput.addEventListener('input', () => {
            validateField(cnieInput, validateCnie);
        });
    }
    
    if (emailInput) {
        emailInput.addEventListener('input', () => {
            validateField(emailInput, validateEmail);
        });
    }
    
    if (firstNameInput) {
        firstNameInput.addEventListener('input', () => {
            const value = firstNameInput.value.trim();
            if (value && value.length < 2) {
                firstNameInput.style.borderColor = '#EF4444';
            } else if (value && value.length >= 2) {
                firstNameInput.style.borderColor = '#6B8F71';
            } else {
                firstNameInput.style.borderColor = '';
            }
        });
    }
    
    if (lastNameInput) {
        lastNameInput.addEventListener('input', () => {
            const value = lastNameInput.value.trim();
            if (value && value.length < 2) {
                lastNameInput.style.borderColor = '#EF4444';
            } else if (value && value.length >= 2) {
                lastNameInput.style.borderColor = '#6B8F71';
            } else {
                lastNameInput.style.borderColor = '';
            }
        });
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('input', () => {
            const value = passwordInput.value.trim();
            if (value && value.length < 8) {
                passwordInput.style.borderColor = '#EF4444';
            } else if (value && value.length >= 8) {
                passwordInput.style.borderColor = '#6B8F71';
            } else {
                passwordInput.style.borderColor = '';
            }
            
            if (confirmInput && confirmInput.value.trim()) {
                if (passwordInput.value.trim() !== confirmInput.value.trim()) {
                    confirmInput.style.borderColor = '#EF4444';
                } else {
                    confirmInput.style.borderColor = '#6B8F71';
                }
            }
        });
    }
    
    if (confirmInput) {
        confirmInput.addEventListener('input', () => {
            if (passwordInput && confirmInput.value.trim() !== passwordInput.value.trim()) {
                confirmInput.style.borderColor = '#EF4444';
            } else if (passwordInput && confirmInput.value.trim() === passwordInput.value.trim()) {
                confirmInput.style.borderColor = '#6B8F71';
            } else {
                confirmInput.style.borderColor = '';
            }
        });
    }
}

function addPasswordToggle(inputId, toggleId) {
    const input = document.getElementById(inputId);
    const toggle = document.getElementById(toggleId);
    
    if (input && toggle) {
        toggle.addEventListener('click', () => {
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            toggle.textContent = type === 'password' ? '👁' : '👁‍🗨';
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (loginForm) {
        const firstInput = loginForm.querySelector('input');
        if (firstInput) firstInput.focus();
    }
    if (registerForm) {
        const firstInput = registerForm.querySelector('input');
        if (firstInput) firstInput.focus();
    }
});