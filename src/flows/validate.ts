/** Shared form validation for flow screens. Messages are user-presentable. */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function emailError(email: string): string | null {
  if (!email.trim()) return 'Email is required.';
  if (!EMAIL_RE.test(email.trim())) return 'Enter a valid email address.';
  return null;
}

export function passwordError(password: string): string | null {
  if (!password) return 'Password is required.';
  if (password.length < 8) return 'Use at least 8 characters.';
  return null;
}
