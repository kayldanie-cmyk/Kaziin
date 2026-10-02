/**
 * Portal email utilities
 *
 * Kaziin supports two independent accounts per real email address:
 *   1. A candidate account  (Find Work + Global Careers — same auth user)
 *   2. A recruiter account  (Hire portal — separate auth user)
 *
 * To keep Supabase's unique-email constraint satisfied, recruiter accounts
 * are stored with a "+hire" sub-address alias:
 *   alex@gmail.com       → candidate auth user
 *   alex+hire@gmail.com  → recruiter auth user
 *
 * This file centralises that transformation so it is applied consistently
 * in every signup and sign-in flow.
 */

/**
 * Returns the Supabase email for the recruiter portal.
 * alex@domain.com  →  alex+hire@domain.com
 */
export function toRecruiterEmail(email: string): string {
  const at = email.lastIndexOf("@");
  if (at === -1) return email; // invalid — pass through
  return email.slice(0, at) + "+hire" + email.slice(at);
}

/**
 * Strips the "+hire" alias back to the real email for display purposes.
 * alex+hire@domain.com  →  alex@domain.com
 */
export function fromRecruiterEmail(email: string): string {
  return email.replace(/\+hire(@)/, "$1");
}

/**
 * Returns true when the given email string is a recruiter alias.
 */
export function isRecruiterEmail(email: string): boolean {
  return email.includes("+hire@");
}
