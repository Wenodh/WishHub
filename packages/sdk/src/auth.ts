export interface AuthProvider {
  getSession(): Promise<{ user: { id: string; email: string } | null }>;
  signOut(): Promise<void>;
}

export class CookieAuthProvider implements AuthProvider {
  async getSession() {
    // For vertical slice, we rely on the browser's automatic cookie handling
    const res = await fetch('/api/auth/get-session');
    if (!res.ok) return { user: null };
    return res.json();
  }

  async signOut() {
    await fetch('/api/auth/sign-out', { method: 'POST' });
  }
}
