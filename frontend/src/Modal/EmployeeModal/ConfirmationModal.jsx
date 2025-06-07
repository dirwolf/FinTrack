import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const ConfirmationModal = ({ open, onClose, onConfirm, randomCode }) => {
  const [inputValue, setInputValue] = useState('');

  const handleConfirm = () => {
    if (inputValue === randomCode) {
      onConfirm();
      onClose();
    } else {
      alert('Incorrect code. Please try again.');
    }
    setInputValue('');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white rounded-3xl shadow-xl p-8 max-w-2xl w-full">
        <DialogHeader className="border-b border-gray-200 pb-3 mb-6">
          <DialogTitle className="text-xl font-semibold">Confirm Action</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <p className="text-base">
            Please enter the following code to confirm: <strong>{randomCode}</strong>
          </p>
          <Input
            placeholder="Enter code"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            required
            className="w-full"
          />
        </div>
        <DialogFooter className="mt-6 flex justify-end">
          <Button
            onClick={handleConfirm}
            className="bg-blue-500 shadow-md text-white hover:bg-white hover:text-blue-500 hover:border-blue-500 border-2 border-blue-500 rounded-3xl px-6 py-2 transition-all"
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationModal;