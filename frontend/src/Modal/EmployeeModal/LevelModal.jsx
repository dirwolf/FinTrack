import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const LevelModal = ({ open, onClose, mode, initialData, onSubmit }) => {
  const [levelName, setLevelName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('LevelModal props:', { open, mode, initialData });
    if (open) {
      if (mode === 'edit' && initialData && initialData.LevelName) {
        setLevelName(initialData.LevelName);
        setError('');
      } else {
        setLevelName('');
        setError('');
      }
    }
  }, [open, mode, initialData]);

  const handleChange = (e) => {
    setLevelName(e.target.value);
    // Clear error when user starts typing
    if (e.target.value.trim()) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!levelName.trim()) {
      setError('Level name is required');
      return;
    }
    try {
      console.log('Submitting level:', { id: initialData?.id, LevelName: levelName });
      await onSubmit({ id: initialData?.id, LevelName: levelName });
      setLevelName('');
      setError('');
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Failed to submit form. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-white border-none rounded-2xl">
        <DialogHeader className="flex flex-row justify-between items-center border-b border-gray-200 pb-3">
          <DialogTitle className="text-lg font-normal">
            {mode === 'edit' ? 'Edit Level' : 'Create Level'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <label htmlFor="levelName" className="text-sm font-medium">
              Level Name
            </label>
            <Input
              id="levelName"
              name="LevelName"
              value={levelName}
              onChange={handleChange}
              required
              maxLength={50}
              placeholder="Enter level name"
              className={`focus-visible:ring-gray-300 focus-visible:ring-3 focus-visible:ring-offset-0 ${error ? 'border-red-500' : ''}`}
              aria-invalid={error ? "true" : "false"}
              aria-describedby={error ? "levelName-error" : undefined}
            />
            {error && (
              <p id="levelName-error" className="text-red-500 text-sm mt-1">
                {error}
              </p>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button
              type="submit"
              className="bg-blue-500 shadow-md text-white cursor-pointer hover:bg-white hover:text-blue-500 hover:border-blue-500 border-2 border-blue-500 rounded-3xl px-6 py-2 transition-all"
            >
              {mode === 'edit' ? 'Update Level' : 'Create Level'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LevelModal;
