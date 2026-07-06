export type ContactFormValues = { name: string; email: string; message: string };
export type ContactFormErrors = Partial<Record<keyof ContactFormValues, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_MESSAGE_LENGTH = 3000;

export function normalizeContact(values: ContactFormValues): ContactFormValues {
  return {
    name: values.name.trim(),
    email: values.email.trim(),
    message: values.message.trim(),
  };
}

export function validateContact(values: ContactFormValues): ContactFormErrors {
  const normalized = normalizeContact(values);
  const errors: ContactFormErrors = {};
  if (!normalized.name) errors.name = "Name is required";
  if (!normalized.email) errors.email = "Email is required";
  else if (!EMAIL_RE.test(normalized.email)) errors.email = "Please enter a valid email";
  if (normalized.message.length < 10) errors.message = "Message must be at least 10 characters";
  else if (normalized.message.length > MAX_MESSAGE_LENGTH) {
    errors.message = `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer`;
  }
  return errors;
}
