const ALLOWED_EMAIL_DOMAIN = process.env.REACT_APP_ALLOWED_EMAIL_DOMAIN || 'doctorgenius.com';

export function isCorporateAccount(email) {
  if (!email) return false;
  return email.toLowerCase().endsWith(`@${ALLOWED_EMAIL_DOMAIN.toLowerCase()}`);
}

export { ALLOWED_EMAIL_DOMAIN };
