import { promises as dns } from "dns";

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function validateEmail(email: string): Promise<string | null> {
  if (!EMAIL_REGEX.test(email)) {
    return "invalid_email_format";
  }

  const domain = email.split("@")[1];

  try {
    const mxRecords = await dns.resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      return "invalid_email_domain";
    }
  } catch {
    return "email_domain_unverifiable";
  }

  return null;
}
