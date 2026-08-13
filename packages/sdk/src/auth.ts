export interface AuthProvider {
  getSession(): Promise<{ user: { id: string; email: string } | null }>;
  signOut(): Promise<void>;
}

export class CookieAuthProvider implements AuthProvider {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || '';
  }

  async getSession() {
    // Append the baseUrl if present, and add credentials: 'include' for cross-origin extension requests
    const url = this.baseUrl ? `${this.baseUrl}/api/auth/get-session` : '/api/auth/get-session';
    try {
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) return { user: null };
      return res.json();
    } catch (err) {
      console.error('Failed to get session:', err);
      return { user: null };
    }
  }

  async signOut() {
    const url = this.baseUrl ? `${this.baseUrl}/api/auth/sign-out` : '/api/auth/sign-out';
    try {
      await fetch(url, { method: 'POST', credentials: 'include' });
    } catch (err) {
      console.error('Failed to sign out:', err);
    }
  }
}
