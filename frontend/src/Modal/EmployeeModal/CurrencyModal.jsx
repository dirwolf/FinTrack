import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const CurrencyModal = ({ open, onClose, mode, initialData, onSubmit }) => {
  const [formData, setFormData] = useState({
    id: '',
    CurrencyCode: '',
    CurrencyName: ''
  });

  const [errors, setErrors] = useState({
    CurrencyCode: '',
    CurrencyName: ''
  });

  useEffect(() => {
    if (open && initialData) {
      setFormData({
        id: initialData.id || '',
        CurrencyCode: initialData.CurrencyCode || '',
        CurrencyName: initialData.CurrencyName || ''
      });
      setErrors({
        CurrencyCode: '',
        CurrencyName: ''
      });
    } else {
      resetForm();
    }
  }, [open, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'CurrencyCode') {
      // Convert to uppercase and limit to 3 characters
      const formattedValue = value.toUpperCase().slice(0, 3);
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (value.trim()) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      CurrencyCode: '',
      CurrencyName: ''
    };
    
    let isValid = true;
    
    // Currency code validation
    if (!formData.CurrencyCode.trim()) {
      newErrors.CurrencyCode = 'Currency code is required';
      isValid = false;
    } else if (formData.CurrencyCode.length !== 3) {
      newErrors.CurrencyCode = 'Currency code must be exactly 3 characters';
      isValid = false;
    } else if (!/^[A-Z]{3}$/.test(formData.CurrencyCode)) {
      newErrors.CurrencyCode = 'Currency code must contain only uppercase letters';
      isValid = false;
    }
    
    if (!formData.CurrencyName.trim()) {
      newErrors.CurrencyName = 'Currency name is required';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const validData = {
        id: formData.id ? parseInt(formData.id, 10) : undefined,
        CurrencyCode: String(formData.CurrencyCode),
        CurrencyName: String(formData.CurrencyName)
      };
      await onSubmit(validData);
      onClose(null);
    } catch (err) {
      console.error('Error submitting form:', err);
    }
  };

  const resetForm = () => {
    setFormData({ id: '', CurrencyCode: '', CurrencyName: '' });
    setErrors({ CurrencyCode: '', CurrencyName: '' });
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose(null)}>
      <DialogContent className="max-w-xl bg-white border-none rounded-2xl">
        <DialogHeader className="flex flex-row justify-between items-center border-b pb-2">
          <DialogTitle>
            {mode === 'edit' ? 'Edit Currency' : 'Add Currency'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Currency Code
            </label>
            <Input
              name="CurrencyCode"
              placeholder="e.g. USD, EUR, INR"
              value={formData.CurrencyCode}
              onChange={handleChange}
              required
              maxLength={3}
              className={`focus-visible:ring-gray-300 focus-visible:ring-3 focus-visible:ring-offset-0 ${errors.CurrencyCode ? 'border-red-500' : ''}`}
              aria-invalid={errors.CurrencyCode ? "true" : "false"}
              aria-describedby={errors.CurrencyCode ? "currency-code-error" : "currency-code-help"}
            />
            {errors.CurrencyCode ? (
              <p id="currency-code-error" className="text-red-500 text-sm mt-1">
                {errors.CurrencyCode}
              </p>
            ) : (
              <p id="currency-code-help" className="text-gray-500 text-xs mt-1">
                Enter a 3-letter ISO currency code (e.g., USD, EUR, INR)
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Currency Name
            </label>
            <Input
              name="CurrencyName"
              placeholder="e.g. US Dollar, Euro, Indian Rupee"
              value={formData.CurrencyName}
              onChange={handleChange}
              required
              className={`focus-visible:ring-gray-300 focus-visible:ring-3 focus-visible:ring-offset-0 ${errors.CurrencyName ? 'border-red-500' : ''}`}
              aria-invalid={errors.CurrencyName ? "true" : "false"}
              aria-describedby={errors.CurrencyName ? "currency-name-error" : "currency-name-help"}
            />
            {errors.CurrencyName ? (
              <p id="currency-name-error" className="text-red-500 text-sm mt-1">
                {errors.CurrencyName}
              </p>
            ) : (
              <p id="currency-name-help" className="text-gray-500 text-xs mt-1">
                Enter the full name of the currency (e.g., US Dollar, Euro, Indian Rupee)
              </p>
            )}
          </div>
          
          <DialogFooter className="mt-4">
            <Button type="submit" className="bg-blue-500 shadow-md text-white hover:bg-white hover:text-blue-500 hover:border-blue-500 border-2 border-blue-500 rounded-3xl px-6 py-2 transition-all cursor-pointer">
              {mode === 'edit' ? 'Update Currency' : 'Add Currency'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CurrencyModal;
