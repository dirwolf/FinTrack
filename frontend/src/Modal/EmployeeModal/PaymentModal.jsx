import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const PaymentModal = ({ open, onClose, mode, initialData }) => {
  const [formData, setFormData] = useState({
    amount: '',
    receivedDate: ''
  });

  useEffect(() => {
    if (open && initialData) {
      setFormData({
        amount: initialData.amount || '',
        receivedDate: initialData.receivedDate || ''
      });
    } else {
      resetForm();
    }
  }, [open, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      onClose(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      receivedDate: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-xl w-full p-6 rounded-2xl shadow-lg">
        <DialogHeader className="flex items-center justify-between border-b pb-3 mb-4">
          <DialogTitle className="text-lg font-semibold">
            {mode === 'edit' ? 'Edit Payment' : 'Create Payment'}
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={() => onClose()}>
            <X className="w-5 h-5" />
          </Button>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="number"
            name="amount"
            placeholder="Amount"
            value={formData.amount}
            onChange={handleChange}
            required
          />
          <Input
            type="date"
            name="receivedDate"
            placeholder="Received Date"
            value={formData.receivedDate}
            onChange={handleChange}
            required
          />
          <DialogFooter className="pt-4">
            <Button type="submit">
              {mode === 'edit' ? 'Update Payment' : 'Create Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;