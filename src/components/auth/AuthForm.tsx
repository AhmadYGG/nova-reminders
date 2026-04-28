'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { NovaOrb } from '@/components/ui/NovaOrb';
import { useAuthStore } from '@/stores/auth-store';
import { Loader2, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password diperlukan'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(50, 'Nama maksimal 50 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  confirmPassword: z.string().min(1, 'Konfirmasi password diperlukan'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword'],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

// Floating particles - using useMemo to prevent hydration mismatch
function FloatingParticles() {
  const particles = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      width: 2 + Math.random() * 4,
      height: 2 + Math.random() * 4,
      duration: 8 + Math.random() * 12,
      delay: Math.random() * 10,
      color: Math.random() > 0.5
        ? 'rgba(124, 92, 252, 0.3)'
        : 'rgba(0, 212, 255, 0.2)',
    }));
  }, []);

  return (
    <div className="nova-particles">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="nova-particle"
          style={{
            left: `${particle.left}%`,
            bottom: '-10px',
            width: `${particle.width}px`,
            height: `${particle.height}px`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
            background: particle.color,
          }}
        />
      ))}
    </div>
  );
}

export function AuthForm() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login, register, isLoading, error, clearError } = useAuthStore();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onLogin = async (data: LoginFormData) => {
    await login(data.email, data.password);
  };

  const onRegister = async (data: RegisterFormData) => {
    await register(data.name, data.email, data.password);
  };

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    clearError();
    loginForm.clearErrors();
    registerForm.clearErrors();
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#07080F] via-[#0E1120] to-[#07080F]" />

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#7C5CFC]/5 blur-[120px]" />

      <FloatingParticles />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="nova-glass rounded-2xl p-8 shadow-[0_0_40px_rgba(124,92,252,0.1)]">
          {/* Nova Branding */}
          <div className="flex flex-col items-center mb-8">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <NovaOrb size="lg" />
            </motion.div>
            <h1
              className="mt-4 text-3xl font-extrabold tracking-tight"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              <span className="nova-gradient-text">NOVA</span>
            </h1>
            <p className="text-[#5A6080] text-sm mt-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Your AI-powered reminder assistant
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] mb-6">
            <button
              onClick={() => switchMode('login')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                mode === 'login'
                  ? 'bg-[#7C5CFC] text-white shadow-[0_0_15px_rgba(124,92,252,0.3)]'
                  : 'text-[#5A6080] hover:text-[#F0F2FF]'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => switchMode('register')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                mode === 'register'
                  ? 'bg-[#7C5CFC] text-white shadow-[0_0_15px_rgba(124,92,252,0.3)]'
                  : 'text-[#5A6080] hover:text-[#F0F2FF]'
              }`}
            >
              Register
            </button>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Form */}
          <AnimatePresence mode="wait">
            {mode === 'login' ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                onSubmit={loginForm.handleSubmit(onLogin)}
                className="space-y-4"
              >
                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#F0F2FF]/70">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6080]" />
                    <input
                      {...loginForm.register('email')}
                      type="email"
                      placeholder="your@email.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[#F0F2FF] placeholder:text-[#5A6080] focus:outline-none focus:border-[#7C5CFC]/50 focus:shadow-[0_0_15px_rgba(124,92,252,0.15)] transition-all"
                    />
                  </div>
                  {loginForm.formState.errors.email && (
                    <p className="text-[#EF4444] text-xs">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#F0F2FF]/70">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6080]" />
                    <input
                      {...loginForm.register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[#F0F2FF] placeholder:text-[#5A6080] focus:outline-none focus:border-[#7C5CFC]/50 focus:shadow-[0_0_15px_rgba(124,92,252,0.15)] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A6080] hover:text-[#F0F2FF] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-[#EF4444] text-xs">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>

                {/* Remember Me */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="w-4 h-4 rounded border-white/[0.06] bg-white/[0.04] accent-[#7C5CFC]"
                  />
                  <label htmlFor="remember" className="text-sm text-[#5A6080]">Remember me</label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-[#7C5CFC] to-[#6B4FE0] text-white font-semibold shadow-[0_0_20px_rgba(124,92,252,0.3)] hover:shadow-[0_0_30px_rgba(124,92,252,0.5)] hover:from-[#8B6BFF] hover:to-[#7C5CFC] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={registerForm.handleSubmit(onRegister)}
                className="space-y-4"
              >
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#F0F2FF]/70">Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6080]" />
                    <input
                      {...registerForm.register('name')}
                      type="text"
                      placeholder="Your name"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[#F0F2FF] placeholder:text-[#5A6080] focus:outline-none focus:border-[#7C5CFC]/50 focus:shadow-[0_0_15px_rgba(124,92,252,0.15)] transition-all"
                    />
                  </div>
                  {registerForm.formState.errors.name && (
                    <p className="text-[#EF4444] text-xs">{registerForm.formState.errors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#F0F2FF]/70">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6080]" />
                    <input
                      {...registerForm.register('email')}
                      type="email"
                      placeholder="your@email.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[#F0F2FF] placeholder:text-[#5A6080] focus:outline-none focus:border-[#7C5CFC]/50 focus:shadow-[0_0_15px_rgba(124,92,252,0.15)] transition-all"
                    />
                  </div>
                  {registerForm.formState.errors.email && (
                    <p className="text-[#EF4444] text-xs">{registerForm.formState.errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#F0F2FF]/70">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6080]" />
                    <input
                      {...registerForm.register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 8 characters"
                      className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[#F0F2FF] placeholder:text-[#5A6080] focus:outline-none focus:border-[#7C5CFC]/50 focus:shadow-[0_0_15px_rgba(124,92,252,0.15)] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A6080] hover:text-[#F0F2FF] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {registerForm.formState.errors.password && (
                    <p className="text-[#EF4444] text-xs">{registerForm.formState.errors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#F0F2FF]/70">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6080]" />
                    <input
                      {...registerForm.register('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Repeat password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[#F0F2FF] placeholder:text-[#5A6080] focus:outline-none focus:border-[#7C5CFC]/50 focus:shadow-[0_0_15px_rgba(124,92,252,0.15)] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A6080] hover:text-[#F0F2FF] transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {registerForm.formState.errors.confirmPassword && (
                    <p className="text-[#EF4444] text-xs">{registerForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-[#7C5CFC] to-[#6B4FE0] text-white font-semibold shadow-[0_0_20px_rgba(124,92,252,0.3)] hover:shadow-[0_0_30px_rgba(124,92,252,0.5)] hover:from-[#8B6BFF] hover:to-[#7C5CFC] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Footer */}
          <p className="text-center text-[#5A6080] text-xs mt-6">
            By continuing, you agree to Nova&apos;s Terms of Service
          </p>
        </div>
      </motion.div>
    </div>
  );
}
