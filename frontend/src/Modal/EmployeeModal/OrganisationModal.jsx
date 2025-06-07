import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const OrganisationModal = ({ open, onClose, mode, initialData, onSubmit }) => {
  const [organisationName, setOrganisationName] = useState('');
  const [abbreviation, setAbbreviation] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [errors, setErrors] = useState({
    organisationName: '',
    abbreviation: '',
    regNumber: ''
  });

  // Reset form when modal opens or mode/initialData changes
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialData) {
        setOrganisationName(initialData.OrganisationName || '');
        setAbbreviation(initialData.Abbreviation || '');
        setRegNumber(initialData.RegNumber || '');
      } else {
        setOrganisationName('');
        setAbbreviation('');
        setRegNumber('');
      }
      setErrors({
        organisationName: '',
        abbreviation: '',
        regNumber: ''
      });
    }
  }, [open, mode, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case 'OrganisationName':
        setOrganisationName(value);
        if (value.trim()) {
          setErrors(prev => ({ ...prev, organisationName: '' }));
        }
        break;
      case 'Abbreviation':
        setAbbreviation(value);
        if (value.trim()) {
          setErrors(prev => ({ ...prev, abbreviation: '' }));
        }
        break;
      case 'RegNumber':
        setRegNumber(value);
        if (value.trim()) {
          setErrors(prev => ({ ...prev, regNumber: '' }));
        }
        break;
      default:
        break;
    }
  };

  const validateForm = () => {
    const newErrors = {
      organisationName: '',
      abbreviation: '',
      regNumber: ''
    };
    
    let isValid = true;
    
    if (!organisationName.trim()) {
      newErrors.organisationName = 'Organisation name is required';
      isValid = false;
    }
    
    if (!abbreviation.trim()) {
      newErrors.abbreviation = 'Abbreviation is required';
      isValid = false;
    }
    
    if (!regNumber.trim()) {
      newErrors.regNumber = 'Registration number is required';
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
      const formData = {
        id: initialData?.id, // Include id for edit mode
        OrganisationName: organisationName,
        Abbreviation: abbreviation,
        RegNumber: regNumber,
      };
      await onSubmit(formData);
      onClose(); // Close modal after successful submission
    } catch (error) {
      console.error('Error submitting organisation form:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-8 border-none bg-white rounded-2xl">
        <DialogHeader className="flex flex-row items-center justify-between border-b border-gray-200 pb-3">
          <DialogTitle className="text-lg font-normal">
            {mode === 'edit' ? 'Edit Organisation' : 'Create Organisation'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label htmlFor="OrganisationName" className="text-sm font-medium">
              Organisation Name
            </label>
            <Input
              id="OrganisationName"
              type="text"
              name="OrganisationName"
              placeholder="Organisation Name"
              value={organisationName}
              onChange={handleChange}
              required
              className={`mt-1 focus-visible:ring-gray-300 focus-visible:ring-3 focus-visible:ring-offset-0 ${errors.organisationName ? 'border-red-500' : ''}`}
              aria-invalid={errors.organisationName ? "true" : "false"}
              aria-describedby={errors.organisationName ? "org-name-error" : undefined}
            />
            {errors.organisationName && (
              <p id="org-name-error" className="text-red-500 text-sm mt-1">
                {errors.organisationName}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="Abbreviation" className="text-sm font-medium">
              Abbreviation
            </label>
            <Input
              id="Abbreviation"
              type="text"
              name="Abbreviation"
              placeholder="Abbreviation"
              value={abbreviation}
              onChange={handleChange}
              required
              className={`mt-1 focus-visible:ring-gray-300 focus-visible:ring-3 focus-visible:ring-offset-0 ${errors.abbreviation ? 'border-red-500' : ''}`}
              aria-invalid={errors.abbreviation ? "true" : "false"}
              aria-describedby={errors.abbreviation ? "abbreviation-error" : undefined}
            />
            {errors.abbreviation && (
              <p id="abbreviation-error" className="text-red-500 text-sm mt-1">
                {errors.abbreviation}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="RegNumber" className="text-sm font-medium">
              Registration Number
            </label>
            <Input
              id="RegNumber"
              type="text"
              name="RegNumber"
              placeholder="Registration Number"
              value={regNumber}
              onChange={handleChange}
              required
              className={`mt-1 focus-visible:ring-gray-300 focus-visible:ring-3 focus-visible:ring-offset-0 ${errors.regNumber ? 'border-red-500' : ''}`}
              aria-invalid={errors.regNumber ? "true" : "false"}
              aria-describedby={errors.regNumber ? "reg-number-error" : undefined}
            />
            {errors.regNumber && (
              <p id="reg-number-error" className="text-red-500 text-sm mt-1">
                {errors.regNumber}
              </p>
            )}
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-blue-500 shadow-md cursor-pointer text-white hover:bg-white hover:text-blue-500 hover:border-blue-500 border-2 border-blue-500 rounded-3xl px-6 py-2 transition-all"
            >
              {mode === 'edit' ? 'Update Organisation' : 'Create Organisation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OrganisationModal;
