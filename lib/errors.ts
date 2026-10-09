export function friendlyAuthError(raw: string | undefined | null): string {
  const message = (raw ?? "").toLowerCase();
  if (!message) return "Something went wrong. Please try again.";
  if (message.includes("invalid login credentials")) return "Invalid email or password.";
  if (message.includes("already registered") || message.includes("already exists")) return "This email is already registered. Try logging in instead.";
  if (message.includes("password") && message.includes("short")) return "Password is too short. Use at least 6 characters.";
  if (message.includes("password should be") || message.includes("weak")) return "Password is too weak. Use a longer, less common password.";
  if (message.includes("email not confirmed")) return "Please confirm your email address before logging in.";
  if (message.includes("rate limit")) return "Too many attempts. Please wait a moment and try again.";
  if (message.includes("network") || message.includes("fetch failed") || message.includes("failed to fetch")) return "Could not reach the server. Check your connection and try again.";
  if (message.includes("invalid admin credentials")) return "Invalid admin credentials.";
  return raw as string;
}

export function isNetworkError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  return /network|fetch/i.test(err.message);
}
