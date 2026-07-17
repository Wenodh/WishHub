'use client';

import { useState } from 'react';
import { authClient } from '@/lib/api/auth-client';
import { Button, Input, Label } from '@wishhub/ui';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, ArrowLeft, User, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 transition-colors duration-300 relative overflow-hidden">
      {/* Glow backgrounds */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-neutral-200/50 dark:bg-neutral-900/30 blur-[100px] rounded-full pointer-events-none" />

      {/* Back button */}
      <Link href="/" className="absolute top-6 left-6 text-sm font-semibold text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white flex items-center gap-1.5 transition-all">
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="p-8 sm:p-10 rounded-3xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl premium-shadow space-y-8">
          <div className="text-center space-y-2">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 mb-2 shadow-md">
                <Sparkles className="h-5 w-5" />
              </div>
              <h1 className="text-3xl font-black tracking-tight text-neutral-950 dark:text-white">Join WishHub</h1>
              <p className="text-neutral-500 dark:text-neutral-400 font-semibold text-sm">Organize your shopping workspaces everywhere</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5">
                <User className="h-3 w-3" /> Full Name
              </Label>
              <Input
                placeholder="Alex Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-12 rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5">
                <Mail className="h-3 w-3" /> Email Address
              </Label>
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5">
                <Lock className="h-3 w-3" /> Password
              </Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 rounded-2xl"
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 dark:text-red-400 font-bold bg-red-500/5 p-3 rounded-2xl border border-red-500/10">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full h-12 rounded-2xl font-bold text-sm shadow-lg shadow-black/10 dark:shadow-white/5 hover:scale-[1.01] transition-transform mt-2" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              Already have an account?{' '}
              <Link href="/login" className="text-neutral-950 dark:text-white font-extrabold hover:underline underline-offset-4">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
