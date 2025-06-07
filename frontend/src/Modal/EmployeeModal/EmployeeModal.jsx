'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const EmployeeModal = ({ open, onClose, roles, levels, organisations, initialData }) => {
  const [formData, setFormData] = useState({
    FirstName: '',
    LastName: '',
    EmpCode: '',
    RoleID: '',
    LevelID: '',
    OrganisationID: '',
    CTCAnnual: '',
    CTCMonthly: '',
    ContactNumber: '',
    Email: '',
    Status: 'Active',
  });
  
  const [errors, setErrors] = useState({
    ContactNumber: '',
    Email: '',
  });

  useEffect(() => {
    if (open && initialData) {
      setFormData({
        FirstName: initialData.FirstName || '',
        LastName: initialData.LastName || '',
        EmpCode: initialData.EmpCode || '',
        RoleID: String(initialData.RoleID || ''),
        LevelID: String(initialData.LevelID || ''),
        OrganisationID: String(initialData.OrganisationID || ''),
        CTCAnnual: initialData.CTCAnnual || '',
        CTCMonthly: initialData.CTCMonthly || '',
        ContactNumber: initialData.ContactNumber || '',
        Email: initialData.Email || '',
        Status: initialData.Status || 'Active',
      });
      setErrors({
        ContactNumber: '',
        Email: '',
      });
    } else {
      resetForm();
    }
  }, [open, initialData]);

  useEffect(() => {
    const annual = parseFloat(formData.CTCAnnual);
    if (!isNaN(annual)) {
      const monthly = (annual / 12).toFixed(2);
      setFormData((prev) => ({ ...prev, CTCMonthly: monthly }));
    }
  }, [formData.CTCAnnual]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'CTCAnnual' && isNaN(Number(value))) return;
    
    if (name === 'ContactNumber') {
      // Only allow digits and limit to 10 characters
      const digitsOnly = value.replace(/\D/g, '');
      if (digitsOnly.length > 10) return;
      
      setFormData((prev) => ({ ...prev, [name]: digitsOnly }));
      
      // Validate phone number
      if (digitsOnly.length !== 10 && digitsOnly.length > 0) {
        setErrors(prev => ({ ...prev, ContactNumber: 'Phone number must be exactly 10 digits' }));
      } else {
        setErrors(prev => ({ ...prev, ContactNumber: '' }));
      }
      return;
    }
    
    if (name === 'Email') {
      setFormData((prev) => ({ ...prev, [name]: value }));
      
      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value) && value.length > 0) {
        setErrors(prev => ({ ...prev, Email: 'Please enter a valid email address' }));
      } else {
        setErrors(prev => ({ ...prev, Email: '' }));
      }
      return;
    }
    
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final validation before submission
    const newErrors = {
      ContactNumber: '',
      Email: '',
    };
    
    let hasErrors = false;
    
    if (formData.ContactNumber.length !== 10) {
      newErrors.ContactNumber = 'Phone number must be exactly 10 digits';
      hasErrors = true;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.Email)) {
      newErrors.Email = 'Please enter a valid email address';
      hasErrors = true;
    }
    
    if (!formData.OrganisationID) {
      alert('Please select an organisation');
      return;
    }
    
    if (!formData.RoleID) {
      alert('Please select a role');
      return;
    }
    
    if (!formData.LevelID) {
      alert('Please select a level');
      return;
    }
    
    if (hasErrors) {
      setErrors(newErrors);
      return;
    }
    
    try {
      onClose(formData);
    } catch (err) {
      console.error('Error submitting form:', err);
      alert('Error submitting form');
    }
  };

  const resetForm = () => {
    setFormData({
      FirstName: '',
      LastName: '',
      EmpCode: '',
      RoleID: '',
      LevelID: '',
      OrganisationID: '',
      CTCAnnual: '',
      CTCMonthly: '',
      ContactNumber: '',
      Email: '',
      Status: 'Active',
    });
    setErrors({
      ContactNumber: '',
      Email: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose(null)}>
      <DialogContent className="max-w-3xl border-none bg-white p-6">
        <DialogHeader className='border-b border-[#9DA4B3]'>
          <DialogTitle className='mb-4 font-normal'>{initialData ? 'Edit Employee' : 'Create Employee'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 ">
          <div className=" flex gap-3">
            <div className="w-full">
              <Label className="mb-1 font-normal text-gray-700">First Name *</Label>
              <Input 
                name="FirstName" 
                value={formData.FirstName} 
                onChange={handleChange} 
                required 
                className="focus-visible:ring-gray-300 focus-visible:ring-3 focus-visible:ring-offset-0"
              />
            </div>
            <div className="w-full">
              <Label className="mb-1 font-normal text-gray-700">Last Name *</Label>
              <Input 
                name="LastName" 
                value={formData.LastName} 
                onChange={handleChange} 
                required 
                className="focus-visible:ring-gray-300 focus-visible:ring-3 focus-visible:ring-offset-0"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-full">
              <Label className="mb-1 font-normal text-gray-700">Employee Code *</Label>
              <Input 
                name="EmpCode" 
                value={formData.EmpCode} 
                onChange={handleChange} 
                required 
                className="focus-visible:ring-gray-300 focus-visible:ring-3 focus-visible:ring-offset-0"
              />
            </div>
            <div className="w-full">
              <Label className="mb-1 font-normal text-gray-700">Role *</Label>
              <Select
                value={formData.RoleID}
                onValueChange={(value) => setFormData({ ...formData, RoleID: value })}
                required
                disabled={roles.length === 0}
              >
                <SelectTrigger className="w-full focus-visible:ring-gray-300 focus-visible:ring-3 focus-visible:ring-offset-0">
                  <SelectValue placeholder={roles.length === 0 ? "No roles available" : "Select Role"} />
                </SelectTrigger>
                <SelectContent className="bg-white border-none">
                  {roles.length === 0 ? null : (
                    roles.map((role) => (
                      <SelectItem key={role.id} value={String(role.id)}>
                        {role.RoleName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-full">
              <Label className="mb-1 font-normal text-gray-700">Level *</Label>
              <Select
                value={formData.LevelID}
                onValueChange={(value) => setFormData({ ...formData, LevelID: value })}
                required
                disabled={levels.length === 0}
              >
                <SelectTrigger className="w-full focus-visible:ring-gray-300 focus-visible:ring-3 focus-visible:ring-offset-0">
                  <SelectValue placeholder={levels.length === 0 ? "No levels available" : "Select Level"} />
                </SelectTrigger>
                <SelectContent className="bg-white border-none">
                  {levels.length === 0 ? null : (
                    levels.map((level) => (
                      <SelectItem key={level.id} value={String(level.id)}>
                        {level.LevelName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              
            </div>
            <div className="w-full">
              <Label className="mb-1 font-normal text-gray-700">Organisation *</Label>
              <Select
                value={formData.OrganisationID}
                onValueChange={(value) => setFormData({ ...formData, OrganisationID: value })}
                required
                disabled={organisations.length === 0}
              >
                <SelectTrigger className="w-full focus-visible:ring-gray-300 focus-visible:ring-3 focus-visible:ring-offset-0">
                  <SelectValue placeholder={organisations.length === 0 ? "No organisations available" : "Select Organisation"} />
                </SelectTrigger>
                <SelectContent className="bg-white border-none">
                  {organisations.length === 0 ? null : (
                    organisations.map((org) => (
                      <SelectItem key={org.id} value={String(org.id)}>
                        {org.Abbreviation}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-full">
              <Label className="mb-1 font-normal text-gray-700">CTC (Annual) *</Label>
              <Input
                name="CTCAnnual"
                value={formData.CTCAnnual}
                onChange={handleChange}
                required
                className="focus-visible:ring-gray-300 focus-visible:ring-3 focus-visible:ring-offset-0"
              />
            </div>
            <div className="w-full">
              <Label className="mb-1 font-normal text-gray-700">CTC (Monthly) *</Label>
              <Input 
                value={formData.CTCMonthly} 
                readOnly 
                required
                className="opacity-60 focus-visible:ring-gray-300 focus-visible:ring-3 focus-visible:ring-offset-0" 
              />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-full">
              <Label className="mb-1 font-normal text-gray-700">Contact Number *</Label>
              <Input
                name="ContactNumber"
                value={formData.ContactNumber}
                onChange={handleChange}
                required
                className="focus-visible:ring-gray-300 focus-visible:ring-3 focus-visible:ring-offset-0"
              />
              {errors.ContactNumber && (
                <p className="text-red-500 text-sm mt-1">{errors.ContactNumber}</p>
              )}
            </div>
            <div className="w-full">
              <Label className="mb-1 font-normal text-gray-700">Email *</Label>
              <Input 
                name="Email" 
                value={formData.Email} 
                onChange={handleChange} 
                required 
                className="focus-visible:ring-gray-300 focus-visible:ring-3 focus-visible:ring-offset-0"
              />
              {errors.Email && (
                <p className="text-red-500 text-sm mt-1">{errors.Email}</p>
              )}
            </div>
          </div>

          <div className="w-full">
  <Label className="mb-1 font-normal text-gray-700">Status *</Label>
  <Select
    value={formData.Status}
    onValueChange={(value) => setFormData({ ...formData, Status: value })}
    required
  >
    <SelectTrigger
      className="focus-visible:ring-gray-300 focus-visible:ring-3 focus-visible:ring-offset-0 min-w-full px-4"
    >
      <SelectValue placeholder="Select Status" />
    </SelectTrigger>
    <SelectContent className="bg-white border-none">
      <SelectItem value="Active">Active</SelectItem>
      <SelectItem value="Inactive">Inactive</SelectItem>
    </SelectContent>
  </Select>
</div>

          <DialogFooter className="pt-4">
            <Button
              type="submit"
              className="bg-blue-500 shadow-md text-white hover:bg-white cursor-pointer hover:text-blue-500 hover:border-blue-500 border-2 border-blue-500 rounded-3xl px-6 py-2 transition-all"
            >
              {initialData ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeModal;