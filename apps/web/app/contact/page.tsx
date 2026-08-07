'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Send, Mail, CheckCircle, MessageSquare } from 'lucide-react';
import { Button, Input, Card, CardContent } from '@wishhub/ui';
import { PublicLayout } from '@/components/public-layout';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setLoading(true);
    // Simulate premium submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
    }, 1200);
  };

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-6 py-20 relative z-10 space-y-12">
        {/* Header */}
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/5 dark:bg-white/5 border border-neutral-200/40 dark:border-neutral-800/40 text-[10px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            <MessageSquare className="h-3.5 w-3.5 text-neutral-500" />
            Support Desk
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-neutral-950 dark:text-white">
            Get in <span className="premium-gradient-text">Touch</span>
          </h1>
          <p className="text-base text-neutral-500 dark:text-neutral-400 font-medium max-w-lg mx-auto">
            Have feedback, bug reports, feature ideas, or enterprise inquiries? Shoot us a message below.
          </p>
        </div>

        {/* Form Container */}
        <div className="max-w-lg mx-auto">
          <Card className="rounded-3xl border border-neutral-200/50 dark:border-neutral-800/50 bg-white/70 dark:bg-neutral-900/30 backdrop-blur-md overflow-hidden premium-shadow">
            <CardContent className="p-8">
              {submitted ? (
                <div className="text-center py-12 space-y-4 animate-in zoom-in-95 duration-300">
                  <div className="h-14 w-14 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center mx-auto">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-extrabold text-neutral-950 dark:text-white">Message Transmitted</h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
                      We received your submission. A technical explorer will reach out shortly.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-xl font-bold text-xs"
                    onClick={() => setSubmitted(false)}
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name field */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500 block">
                      Your Name
                    </label>
                    <Input
                      type="text"
                      placeholder="Jane Doe"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="rounded-xl h-11 border-neutral-200/60 dark:border-neutral-800/60 font-medium text-sm"
                    />
                  </div>

                  {/* Email field */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500 block">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      placeholder="jane@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="rounded-xl h-11 border-neutral-200/60 dark:border-neutral-800/60 font-medium text-sm"
                    />
                  </div>

                  {/* Message field */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500 block">
                      Your Message
                    </label>
                    <textarea
                      placeholder="Share your thoughts or report a regression..."
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full rounded-xl border border-neutral-200/60 dark:border-neutral-800/60 font-medium text-sm p-3 bg-transparent text-neutral-900 dark:text-neutral-50 focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-all"
                    />
                  </div>

                  {/* Submit button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl h-12 gap-2 font-bold shadow-md shadow-black/5 hover:scale-[1.01] transition-transform"
                  >
                    <Send className="h-4 w-4" />
                    {loading ? 'Sending Message...' : 'Send Message'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}
