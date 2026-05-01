import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { createProject } from '../api/projects';
import Modal from './Modal';

export default function CreateProjectModal({ isOpen, onClose, users, onCreated }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      memberIds: [],
    },
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isOpen) {
      reset({
        name: '',
        description: '',
        memberIds: [],
      });
      setFormError('');
    }
  }, [isOpen, reset]);

  const onSubmit = async (values) => {
    try {
      setSubmitting(true);
      setFormError('');

      const payload = {
        name: values.name,
        description: values.description,
        memberIds: Array.isArray(values.memberIds)
          ? values.memberIds
          : values.memberIds
            ? [values.memberIds]
            : [],
      };

      const response = await createProject(payload);
      onCreated(response.data);
      onClose();
    } catch (error) {
      setFormError(error.response?.data?.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Project">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="label-text">Project Name</label>
          <input
            type="text"
            className="input-field"
            placeholder="Website Redesign"
            {...register('name', { required: 'Project name is required' })}
          />
          {errors.name && <p className="mt-2 text-sm text-danger">{errors.name.message}</p>}
        </div>

        <div>
          <label className="label-text">Description</label>
          <textarea
            rows="4"
            className="input-field"
            placeholder="Outline the scope and goals for this project"
            {...register('description')}
          />
        </div>

        <div>
          <label className="label-text">Assign Members</label>
          <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-4 sm:grid-cols-2">
            {users.length === 0 ? (
              <p className="text-sm text-slate-400">No members available yet.</p>
            ) : (
              users.map((user) => (
                <label
                  key={user._id}
                  className="flex items-center gap-3 rounded-xl border border-slate-800 px-4 py-3 text-sm text-slate-300"
                >
                  <input type="checkbox" value={user._id} {...register('memberIds')} />
                  <span>
                    {user.name} <span className="text-slate-500">({user.role})</span>
                  </span>
                </label>
              ))
            )}
          </div>
        </div>

        {formError && <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{formError}</p>}

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
