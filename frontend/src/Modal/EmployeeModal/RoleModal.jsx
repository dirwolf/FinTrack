import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const RoleModal = ({ open, onClose, mode, initialData, onSubmit }) => {
  const [roleName, setRoleName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('RoleModal useEffect:', { mode, initialData });
    if (mode === 'edit' && initialData?.RoleName) {
      setRoleName(initialData.RoleName);
      setError('');
    } else {
      setRoleName('');
      setError('');
    }
  }, [open, mode, initialData]);

  const handleChange = (e) => {
    setRoleName(e.target.value);
    // Clear error when user starts typing
    if (e.target.value.trim()) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roleName.trim()) {
      setError('Role name is required');
      return;
    }
    try {
      console.log('Submitting role:', { id: initialData?.id, RoleName: roleName });
      await onSubmit({ id: initialData?.id, RoleName: roleName });
      setError('');
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Failed to submit role. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white border-none rounded-2xl px-8 py-6">
        <form onSubmit={handleSubmit} className="space-y-2">
          <DialogHeader className="pb-6 border-b border-gray-200">
            <DialogTitle className="text-xl font-normal">
              {mode === 'edit' ? 'Edit Role' : 'Create Role'}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <label className="text-sm font-medium text-black">Role Name</label>
            <Input
              type="text"
              name="RoleName"
              value={roleName}
              onChange={handleChange}
              required
              placeholder="Enter role name"
              className={`focus-visible:ring-gray-300 focus-visible:ring-3 focus-visible:ring-offset-0 ${error ? 'border-red-500' : 'border-gray-300'}`}
              aria-invalid={error ? "true" : "false"}
              aria-describedby={error ? "roleName-error" : undefined}
            />
            {error && (
              <p id="roleName-error" className="text-red-500 text-sm mt-1">
                {error}
              </p>
            )}
          </div>

          <DialogFooter className="flex justify-end pt-4">
            <Button
              type="submit"
              className="bg-blue-500 shadow-md cursor-pointer text-white hover:bg-white hover:text-blue-500 hover:border-blue-500 border-2 border-blue-500 rounded-3xl px-6 py-2 transition-all"
            >
              {mode === 'edit' ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RoleModal;
