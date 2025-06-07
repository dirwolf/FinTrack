import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const BankDetailModal = ({ open, onClose, mode, initialData, onSubmit }) => {
  const [formData, setFormData] = useState({
    id: null,
    BankName: '',
    AccountNumber: '',
    SwiftCode: '',
    IFSC: '',
  });

  const [errors, setErrors] = useState({
    BankName: '',
    AccountNumber: '',
    SwiftCode: '',
    IFSC: '',
  });

  useEffect(() => {
    if (open && initialData) {
      setFormData({
        id: initialData.id || null,
        BankName: initialData.BankName || '',
        AccountNumber: initialData.AccountNumber || '',
        SwiftCode: initialData.SwiftCode || '',
        IFSC: initialData.IFSC || '',
      });
      setErrors({
        BankName: '',
        AccountNumber: '',
        SwiftCode: '',
        IFSC: '',
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

    // Clear error when user starts typing
    if (value.trim()) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      BankName: '',
      AccountNumber: '',
      SwiftCode: '',
      IFSC: '',
    };
    
    let isValid = true;
    
    if (!formData.BankName.trim()) {
      newErrors.BankName = 'Bank name is required';
      isValid = false;
    }
    
    if (!formData.AccountNumber.trim()) {
      newErrors.AccountNumber = 'Account number is required';
      isValid = false;
    }
    
    if (!formData.SwiftCode.trim()) {
      newErrors.SwiftCode = 'Swift code is required';
      isValid = false;
    }
    
    if (!formData.IFSC.trim()) {
      newErrors.IFSC = 'IFSC code is required';
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
    
    onSubmit(formData);
    onClose(formData);
  };

  const resetForm = () => {
    setFormData({
      id: null,
      BankName: '',
      AccountNumber: '',
      SwiftCode: '',
      IFSC: '',
    });
    setErrors({
      BankName: '',
      AccountNumber: '',
      SwiftCode: '',
      IFSC: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose(null)}>
      <DialogContent className="bg-white border-none rounded-3xl shadow-xl p-8 max-w-2xl w-full">
        <DialogHeader className="flex flex-row justify-between items-center border-b border-gray-200 pb-3 mb-6">
          <DialogTitle className="text-xl font-normal">
            {mode === 'edit' ? 'Edit Bank Detail' : 'Add Bank Detail'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Bank Name"
                name="BankName"
                value={formData.BankName}
                onChange={handleChange}
                required
                className={`focus-visible:ring-gray-300 focus-visible:ring-3 focus-visible:ring-offset-0 ${errors.BankName ? 'border-red-500' : ''}`}
                aria-invalid={errors.BankName ? "true" : "false"}
                aria-describedby={errors.BankName ? "bank-name-error" : undefined}
              />
              {errors.BankName && (
                <p id="bank-name-error" className="text-red-500 text-sm mt-1">
                  {errors.BankName}
                </p>
              )}
            </div>
            <div className="flex-1">
              <Input
                placeholder="Account Number"
                name="AccountNumber"
                value={formData.AccountNumber}
                onChange={handleChange}
                required
                className={`focus-visible:ring-gray-300 focus-visible:ring-3 focus-visible:ring-offset-0 ${errors.AccountNumber ? 'border-red-500' : ''}`}
                aria-invalid={errors.AccountNumber ? "true" : "false"}
                aria-describedby={errors.AccountNumber ? "account-number-error" : undefined}
              />
              {errors.AccountNumber && (
                <p id="account-number-error" className="text-red-500 text-sm mt-1">
                  {errors.AccountNumber}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Swift Code"
                name="SwiftCode"
                value={formData.SwiftCode}
                onChange={handleChange}
                required
                className={`focus-visible:ring-gray-300 focus-visible:ring-3 focus-visible:ring-offset-0 ${errors.SwiftCode ? 'border-red-500' : ''}`}
                aria-invalid={errors.SwiftCode ? "true" : "false"}
                aria-describedby={errors.SwiftCode ? "swift-code-error" : undefined}
              />
              {errors.SwiftCode && (
                <p id="swift-code-error" className="text-red-500 text-sm mt-1">
                  {errors.SwiftCode}
                </p>
              )}
            </div>
            <div className="flex-1">
              <Input
                placeholder="IFSC Code"
                name="IFSC"
                value={formData.IFSC}
                onChange={handleChange}
                required
                className={`focus-visible:ring-gray-300 focus-visible:ring-3 focus-visible:ring-offset-0 ${errors.IFSC ? 'border-red-500' : ''}`}
                aria-invalid={errors.IFSC ? "true" : "false"}
                aria-describedby={errors.IFSC ? "ifsc-code-error" : undefined}
              />
              {errors.IFSC && (
                <p id="ifsc-code-error" className="text-red-500 text-sm mt-1">
                  {errors.IFSC}
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="mt-6 flex justify-end">
            <Button
              type="submit"
              className="bg-blue-500 shadow-md text-white hover:bg-white hover:text-blue-500 hover:border-blue-500 border-2 border-blue-500 rounded-3xl px-6 py-2 transition-all cursor-pointer"
            >
              {mode === 'edit' ? 'Update Bank Detail' : 'Add Bank Detail'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BankDetailModal;
