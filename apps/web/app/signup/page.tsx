'use client';

import { useState } from 'react';
import { authClient } from '@/lib/api/auth-client';
import { Button, Input } from '@wishhub/ui';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authClient.signUp.email({
        email,
        password,
        name,
        callbackURL: '/dashboard',
      });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-muted/30">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl border border-muted-foreground/10">
        <div className="text-center space-y-2">
            <h1 className="text-3xl font-black tracking-tight">Join WishHub</h1>
            <p className="text-muted-foreground font-medium text-sm italic">Organize your shopping everywhere</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Full Name</label>
            <Input
              placeholder="Alex Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-12 rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Email Address</label>
            <Input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 rounded-xl"
            />
          </div>

          {error && <p className="text-sm text-destructive font-bold bg-destructive/10 p-3 rounded-lg">{error}</p>}

          <Button type="submit" className="w-full h-12 rounded-xl font-bold text-base shadow-lg shadow-primary/20" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <div className="text-center pt-2">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-bold hover:underline underline-offset-4">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
