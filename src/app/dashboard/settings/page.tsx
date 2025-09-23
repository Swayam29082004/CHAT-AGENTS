'use client';

import { useState, FormEvent } from 'react';

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Client-side validation
    if (formData.newPassword !== formData.confirmNewPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (formData.newPassword.length < 6) {
        setError('New password must be at least 6 characters long.');
        return;
    }

    setIsLoading(true);

    try {
      // Get user ID from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id) {
        setError('You must be logged in to change your password.');
        setIsLoading(false);
        return;
      }
      
      const response = await fetch('/api/dashboard/settings/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('✅ Password updated successfully!');
        // Clear the form fields
        setFormData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      } else {
        setError(data.error || 'Failed to update password.');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('A network error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Settings</h1>
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Change Password</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="alert-error">{error}</div>}
            {success && <div className="alert-success">{success}</div>}
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                className="form-input mt-1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className="form-input mt-1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <input
                type="password"
                name="confirmNewPassword"
                value={formData.confirmNewPassword}
                onChange={handleInputChange}
                className="form-input mt-1"
                required
              />
            </div>
            
            <div className="pt-2">
              <button type="submit" disabled={isLoading} className="btn-primary w-full sm:w-auto">
                {isLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}