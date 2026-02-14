// Validate patient data
export function validatePatientData(patient) {
  const errors = {};
  let isValid = true;

  // Check name
  if (!patient.name || patient.name.trim() === '') {
    errors.name = 'Name is required';
    isValid = false;
  }

  // Check age
  if (!patient.age || patient.age <= 0) {
    errors.age = 'Age must be greater than 0';
    isValid = false;
  }

  // Check gender
  if (!patient.gender) {
    errors.gender = 'Gender is required';
    isValid = false;
  }

  return { isValid, errors };
}

// Validate authentication credentials
export function validateAuthCredentials(username, password) {
  const errors = {};
  let isValid = true;

  // Check username
  if (!username || username.trim() === '') {
    errors.username = 'Username is required';
    isValid = false;
  }

  // Check password
  if (!password || password.trim() === '') {
    errors.password = 'Password is required';
    isValid = false;
  }

  // Check minimum length
  if (password && password.length < 4) {
    errors.password = 'Password must be at least 4 characters';
    isValid = false;
  }

  return { isValid, errors };
}
