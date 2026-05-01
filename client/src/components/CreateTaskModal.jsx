import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { createTask } from '../api/tasks';
import Modal from './Modal';

export default function CreateTaskModal({
  isOpen,
  onClose,
  onCreated,
  projects,
  users,
  initialProjectId = '',
}) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      projectId: initialProjectId,
      assignedTo: '',
      priority: 'medium',
      dueDate: '',
    },
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const selectedProjectId = watch('projectId');
  const activeProject = projects.find((project) => project._id === selectedProjectId);
  const availableUsers = activeProject
    ? users.filter((user) => activeProject.owner?._id === user._id || activeProject.members.some((member) => member._id === user._id))
    : users;

  useEffect(() => {
    if (isOpen) {
      reset({
        title: '',
        description: '',
        projectId: initialProjectId,
        assignedTo: '',
        priority: 'medium',
        dueDate: '',
      });
      setFormError('');
    }
  }, [initialProjectId, isOpen, reset]);

  const onSubmit = async (values) => {
    try {
      setSubmitting(true);
      setFormError('');

      const payload = {
        title: values.title,
        description: values.description,
        projectId: values.projectId,
        assignedTo: values.assignedTo || null,
        priority: values.priority,
        dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
      };

      const response = await createTask(payload);
      onCreated(response.data);
      onClose();
    } catch (error) {
      setFormError(error.response?.data?.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Task">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="label-text">Task Title</label>
          <input
            type="text"
            className="input-field"
            placeholder="Prepare sprint review deck"
            {...register('title', { required: 'Task title is required' })}
          />
          {errors.title && <p className="mt-2 text-sm text-danger">{errors.title.message}</p>}
        </div>

        <div>
          <label className="label-text">Description</label>
          <textarea
            rows="4"
            className="input-field"
            placeholder="Add all relevant delivery notes and acceptance criteria"
            {...register('description')}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label-text">Project</label>
            <select className="input-field" {...register('projectId', { required: 'Project is required' })}>
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
            {errors.projectId && <p className="mt-2 text-sm text-danger">{errors.projectId.message}</p>}
          </div>

          <div>
            <label className="label-text">Assign To</label>
            <select className="input-field" {...register('assignedTo')}>
              <option value="">Unassigned</option>
              {availableUsers.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label-text">Priority</label>
            <select className="input-field" {...register('priority', { required: true })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="label-text">Due Date</label>
            <input type="datetime-local" className="input-field" {...register('dueDate')} />
          </div>
        </div>

        {formError && <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{formError}</p>}

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
