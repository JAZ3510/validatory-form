// ─────────────────────────────────────────────
//  Registration Form – Validation Script
//  Features: real-time validation + alert-based
//            error reporting on submission
// ─────────────────────────────────────────────

/* ── Element references ── */
const form            = document.getElementById('registration-form');

const fullnameInput   = document.getElementById('fullname');
const emailInput      = document.getElementById('email');
const passwordInput   = document.getElementById('password');
const confirmInput    = document.getElementById('confirm-password');
const ageInput        = document.getElementById('age');

const fullnameHint    = document.getElementById('fullname-hint');
const emailHint       = document.getElementById('email-hint');
const confirmHint     = document.getElementById('confirm-hint');
const ageHint         = document.getElementById('age-hint');

const successBanner   = document.getElementById('success-banner');

// Password rule indicator elements
const ruleLength  = document.getElementById('rule-length');
const ruleUpper   = document.getElementById('rule-upper');
const ruleNumber  = document.getElementById('rule-number');
const ruleSpecial = document.getElementById('rule-special');


// ─────────────────────────────────────────────
//  Validation helpers
// ─────────────────────────────────────────────

/**
 * Full Name: non-empty and contains at least 2 words.
 */
function validateFullName(value) {
  const trimmed = value.trim();
  if (!trimmed) return { ok: false, msg: 'Full name is required.' };
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length < 2) return { ok: false, msg: 'Please enter your first and last name.' };
  return { ok: true, msg: 'Looks good!' };
}

/**
 * Email: standard RFC-5321-style pattern check.
 */
function validateEmail(value) {
  const trimmed = value.trim();
  if (!trimmed) return { ok: false, msg: 'Email address is required.' };
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) return { ok: false, msg: 'Enter a valid email (e.g. name@domain.com).' };
  return { ok: true, msg: 'Valid email address.' };
}

/**
 * Password: ≥8 chars, 1 uppercase, 1 digit, 1 special character.
 * Returns individual rule results for the live indicator.
 */
function validatePassword(value) {
  const rules = {
    length:  value.length >= 8,
    upper:   /[A-Z]/.test(value),
    number:  /[0-9]/.test(value),
    special: /[^A-Za-z0-9]/.test(value),
  };
  const allMet = Object.values(rules).every(Boolean);
  return { ok: allMet, rules };
}

/**
 * Confirm Password: must match the password field.
 */
function validateConfirm(password, confirm) {
  if (!confirm) return { ok: false, msg: 'Please confirm your password.' };
  if (confirm !== password) return { ok: false, msg: 'Passwords do not match.' };
  return { ok: true, msg: 'Passwords match.' };
}

/**
 * Age: must be a number and ≥ 18.
 */
function validateAge(value) {
  const num = Number(value);
  if (value === '' || isNaN(num)) return { ok: false, msg: 'Age is required.' };
  if (!Number.isInteger(num) || num < 0) return { ok: false, msg: 'Enter a valid age.' };
  if (num < 18) return { ok: false, msg: 'You must be 18 or older to register.' };
  return { ok: true, msg: 'Age verified.' };
}


// ─────────────────────────────────────────────
//  UI helpers
// ─────────────────────────────────────────────

/**
 * Apply valid/invalid styling to an input and update its hint text.
 */
function setFieldState(input, hintEl, result) {
  input.classList.toggle('valid',   result.ok);
  input.classList.toggle('invalid', !result.ok);
  if (hintEl) {
    hintEl.textContent = result.msg || '';
    hintEl.className   = 'hint ' + (result.ok ? 'success' : 'error');
  }
}

/**
 * Update the password rule indicators (dots + labels).
 */
function updatePasswordRules(rules) {
  ruleLength.classList.toggle('met',  rules.length);
  ruleUpper.classList.toggle('met',   rules.upper);
  ruleNumber.classList.toggle('met',  rules.number);
  ruleSpecial.classList.toggle('met', rules.special);
}

/**
 * Reset a field back to its neutral state.
 */
function clearFieldState(input, hintEl, neutralMsg) {
  input.classList.remove('valid', 'invalid');
  if (hintEl) {
    hintEl.textContent = neutralMsg || '';
    hintEl.className   = 'hint neutral';
  }
}


// ─────────────────────────────────────────────
//  Real-time (live) validation on input events
// ─────────────────────────────────────────────

fullnameInput.addEventListener('input', () => {
  if (fullnameInput.value === '') {
    clearFieldState(fullnameInput, fullnameHint, 'Enter your first and last name.');
    return;
  }
  setFieldState(fullnameInput, fullnameHint, validateFullName(fullnameInput.value));
});

emailInput.addEventListener('input', () => {
  if (emailInput.value === '') {
    clearFieldState(emailInput, emailHint, 'e.g. example@domain.com');
    return;
  }
  setFieldState(emailInput, emailHint, validateEmail(emailInput.value));
});

passwordInput.addEventListener('input', () => {
  const result = validatePassword(passwordInput.value);
  updatePasswordRules(result.rules);

  if (passwordInput.value === '') {
    passwordInput.classList.remove('valid', 'invalid');
    return;
  }
  passwordInput.classList.toggle('valid',   result.ok);
  passwordInput.classList.toggle('invalid', !result.ok);

  // Re-validate confirm field if it already has a value
  if (confirmInput.value) {
    setFieldState(confirmInput, confirmHint, validateConfirm(passwordInput.value, confirmInput.value));
  }
});

confirmInput.addEventListener('input', () => {
  if (confirmInput.value === '') {
    clearFieldState(confirmInput, confirmHint, 'Re-enter your password.');
    return;
  }
  setFieldState(confirmInput, confirmHint, validateConfirm(passwordInput.value, confirmInput.value));
});

ageInput.addEventListener('input', () => {
  if (ageInput.value === '') {
    clearFieldState(ageInput, ageHint, 'You must be 18 or older.');
    return;
  }
  setFieldState(ageInput, ageHint, validateAge(ageInput.value));
});


// ─────────────────────────────────────────────
//  Form submission – alert-based error reporting
// ─────────────────────────────────────────────

form.addEventListener('submit', function (event) {
  event.preventDefault(); // Always prevent default first

  successBanner.style.display = 'none';

  // Run all validations
  const nameResult    = validateFullName(fullnameInput.value);
  const emailResult   = validateEmail(emailInput.value);
  const pwResult      = validatePassword(passwordInput.value);
  const confirmResult = validateConfirm(passwordInput.value, confirmInput.value);
  const ageResult     = validateAge(ageInput.value);

  // Apply visual states for all fields
  setFieldState(fullnameInput, fullnameHint, nameResult);
  setFieldState(emailInput,    emailHint,    emailResult);

  updatePasswordRules(pwResult.rules);
  passwordInput.classList.toggle('valid',   pwResult.ok);
  passwordInput.classList.toggle('invalid', !pwResult.ok);

  setFieldState(confirmInput, confirmHint, confirmResult);
  setFieldState(ageInput,     ageHint,     ageResult);

  // Build error list for alert
  const errors = [];
  if (!nameResult.ok)    errors.push('• ' + nameResult.msg);
  if (!emailResult.ok)   errors.push('• ' + emailResult.msg);
  if (!pwResult.ok) {
    const missing = [];
    if (!pwResult.rules.length)  missing.push('at least 8 characters');
    if (!pwResult.rules.upper)   missing.push('one uppercase letter');
    if (!pwResult.rules.number)  missing.push('one number');
    if (!pwResult.rules.special) missing.push('one special character');
    errors.push('• Password must contain: ' + missing.join(', ') + '.');
  }
  if (!confirmResult.ok) errors.push('• ' + confirmResult.msg);
  if (!ageResult.ok)     errors.push('• ' + ageResult.msg);

  if (errors.length > 0) {
    alert('Please fix the following errors:\n\n' + errors.join('\n'));
    return; // Stop submission
  }

  // ── All valid: show success ──
  alert('Registration successful! 🎉 Welcome aboard.');
  successBanner.style.display = 'block';
  form.reset();

  // Clear all field states after successful reset
  [fullnameInput, emailInput, passwordInput, confirmInput, ageInput].forEach(el => {
    el.classList.remove('valid', 'invalid');
  });
  [fullnameHint, emailHint, confirmHint, ageHint].forEach(el => {
    el.className = 'hint neutral';
  });
  fullnameHint.textContent = 'Enter your first and last name.';
  emailHint.textContent    = 'e.g. example@domain.com';
  confirmHint.textContent  = 'Re-enter your password.';
  ageHint.textContent      = 'You must be 18 or older.';
  [ruleLength, ruleUpper, ruleNumber, ruleSpecial].forEach(el => el.classList.remove('met'));
});
