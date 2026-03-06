/**
 * Email obfuscation — prevents bots from scraping raw email addresses.
 *
 * The address is split into encoded parts and assembled at runtime.
 * No raw "info@cushlabs.ai" string exists anywhere in the HTML source.
 */

// Encoded parts (base64 fragments + reversed string)
const _p = ["aW5mbw==", "Y3VzaGxhYnM=", "YWk="]; // info, cushlabs, ai
const _s = [atob(_p[0]), atob(_p[1]), atob(_p[2])];

/** Returns the assembled email address */
export function getEmail(): string {
  return `${_s[0]}@${_s[1]}.${_s[2]}`;
}

/** Opens a mailto: link with optional subject and body */
export function openMailto(subject?: string, body?: string): void {
  const addr = getEmail();
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  const qs = params.toString();
  window.location.href = `${"mai" + "lto"}:${addr}${qs ? "?" + qs : ""}`;
}
