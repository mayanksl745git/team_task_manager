import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import { register as registerRequest } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { token, login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      role: 'member',
    },
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (values) => {
    try {
      setSubmitting(true);
      setFormError('');
      const response = await registerRequest(values);
      login(response.data);
      navigate('/dashboard');
    } catch (error) {
      setFormError(error.response?.data?.message || 'Unable to register');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-3xl rounded-[32px] border border-slate-800 bg-slate-900 p-8 shadow-soft sm:p-10">
        <h2 className="text-3xl font-bold text-white">Create Account</h2>
        <p className="mt-2 text-sm text-slate-400">Set up your account and choose the role you need.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label-text">Full Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="Alex Johnson"
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && <p className="mt-2 text-sm text-danger">{errors.name.message}</p>}
            </div>

            <div>
              <label className="label-text">Role</label>
              <select className="input-field" {...register('role', { required: true })}>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label-text">Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="alex@company.com"
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && <p className="mt-2 text-sm text-danger">{errors.email.message}</p>}
          </div>

          <div>
            <label className="label-text">Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="Minimum 6 characters"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
            />
            {errors.password && <p className="mt-2 text-sm text-danger">{errors.password.message}</p>}
          </div>

          {formError && <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{formError}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-400">
          Already registered?{' '}
          <Link to="/auth/login" className="font-semibold text-indigo-300 hover:text-indigo-200">
            Sign in instead
          </Link>
        </p>
      </div>
    </div>
  );
}
