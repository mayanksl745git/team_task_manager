import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import { login as loginRequest } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { token, login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (values) => {
    try {
      setSubmitting(true);
      setFormError('');
      const response = await loginRequest(values);
      login(response.data);
      navigate('/dashboard');
    } catch (error) {
      setFormError(error.response?.data?.message || 'Unable to log in');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-slate-800 bg-slate-900 shadow-soft lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden bg-gradient-to-br from-brand via-slate-900 to-slate-950 p-10 lg:block">
          <p className="text-sm uppercase tracking-[0.2em] text-indigo-200">Welcome Back</p>
          <h1 className="mt-6 text-4xl font-bold leading-tight text-white">Track work, team progress, and project momentum.</h1>
          <p className="mt-4 max-w-md text-slate-300">
            Sign in to manage tasks, review overdue work, and keep every project moving with clarity.
          </p>
        </div>

        <div className="p-8 sm:p-10">
          <h2 className="text-3xl font-bold text-white">Login</h2>
          <p className="mt-2 text-sm text-slate-400">Use your email and password to continue.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <div>
              <label className="label-text">Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                {...register('email', { required: 'Email is required' })}
              />
              {errors.email && <p className="mt-2 text-sm text-danger">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label-text">Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="Enter your password"
                {...register('password', { required: 'Password is required' })}
              />
              {errors.password && <p className="mt-2 text-sm text-danger">{errors.password.message}</p>}
            </div>

            {formError && <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{formError}</p>}

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-400">
            Need an account?{' '}
            <Link to="/auth/register" className="font-semibold text-indigo-300 hover:text-indigo-200">
              Create one here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
