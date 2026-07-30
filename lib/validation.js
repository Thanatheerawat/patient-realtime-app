import { ALL_FIELDS } from "./fields";

const PHONE_REGEX = /^[0-9+\-\s()]{7,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validates a single field value; returns an error string or "" if valid.
export function validateField(name, value) {
  const field = ALL_FIELDS.find((f) => f.name === name);
  if (!field) return "";

  const trimmed = (value ?? "").toString().trim();

  if (field.required && !trimmed) {
    return `${field.label} is required`;
  }
  if (!trimmed) return "";

  if (field.type === "email" && !EMAIL_REGEX.test(trimmed)) {
    return "Enter a valid email address";
  }
  if (field.type === "tel" && !PHONE_REGEX.test(trimmed)) {
    return "Enter a valid phone number";
  }
  if (field.name === "dob") {
    const date = new Date(trimmed);
    if (Number.isNaN(date.getTime()) || date > new Date()) {
      return "Enter a valid date of birth";
    }
  }
  return "";
}

// Validates the whole form; returns { isValid, errors }.
export function validateForm(values) {
  const errors = {};
  for (const field of ALL_FIELDS) {
    const error = validateField(field.name, values[field.name]);
    if (error) errors[field.name] = error;
  }
  return { isValid: Object.keys(errors).length === 0, errors };
}
