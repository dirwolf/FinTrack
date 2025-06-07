'use client';
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const CurrencyExchangeModal = ({
  open,
  onClose,
  mode,
  initialData,
  onSubmit,
  currencies = [],
}) => {
  const [currencyFrom, setCurrencyFrom] = useState('');
  const [currencyTo, setCurrencyTo] = useState('');
  const [exchangeRate, setExchangeRate] = useState('');
  const [errors, setErrors] = useState({
    currencyFrom: '',
    currencyTo: '',
    exchangeRate: '',
    general: ''
  });

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setCurrencyFrom(initialData.CurrencyFromID?.toString() || '');
      setCurrencyTo(initialData.CurrencyToID?.toString() || '');
      setExchangeRate(initialData.ExchangeRate?.toString() || '');
    } else {
      setCurrencyFrom('');
      setCurrencyTo('');
      setExchangeRate('');
    }
    setErrors({
      currencyFrom: '',
      currencyTo: '',
      exchangeRate: '',
      general: ''
    });
  }, [open, mode, initialData]);

  const handleExchangeRateChange = (e) => {
    const value = e.target.value;
    setExchangeRate(value);
    
    // Clear error when user starts typing valid input
    if (value && !isNaN(parseFloat(value)) && parseFloat(value) > 0) {
      setErrors(prev => ({ ...prev, exchangeRate: '' }));
    }
  };

  const handleCurrencyFromChange = (value) => {
    setCurrencyFrom(value);
    setErrors(prev => ({ ...prev, currencyFrom: '' }));
    
    // Check if same currency is selected
    if (value === currencyTo) {
      setErrors(prev => ({ ...prev, general: 'Currency From and Currency To cannot be the same.' }));
    } else {
      setErrors(prev => ({ ...prev, general: '' }));
    }
  };

  const handleCurrencyToChange = (value) => {
    setCurrencyTo(value);
    setErrors(prev => ({ ...prev, currencyTo: '' }));
    
    // Check if same currency is selected
    if (value === currencyFrom) {
      setErrors(prev => ({ ...prev, general: 'Currency From and Currency To cannot be the same.' }));
    } else {
      setErrors(prev => ({ ...prev, general: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      currencyFrom: '',
      currencyTo: '',
      exchangeRate: '',
      general: ''
    };
    
    let isValid = true;
    
    if (!currencyFrom) {
      newErrors.currencyFrom = 'Currency From is required';
      isValid = false;
    }
    
    if (!currencyTo) {
      newErrors.currencyTo = 'Currency To is required';
      isValid = false;
    }
    
    if (!exchangeRate || isNaN(parseFloat(exchangeRate)) || parseFloat(exchangeRate) <= 0) {
      newErrors.exchangeRate = 'Please enter a valid positive Exchange Rate';
      isValid = false;
    }
    
    if (currencyFrom && currencyTo && currencyFrom === currencyTo) {
      newErrors.general = 'Currency From and Currency To cannot be the same';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit({
      id: initialData?.id,
      CurrencyFromID: parseInt(currencyFrom),
      CurrencyToID: parseInt(currencyTo),
      ExchangeRate: parseFloat(exchangeRate),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-white border-none w-full">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Edit Exchange Rate' : 'Create Exchange Rate'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && <div className="text-red-500 text-sm">{errors.general}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Currency From</label>
              <Select 
                value={currencyFrom} 
                onValueChange={handleCurrencyFromChange} 
                required
              >
                <SelectTrigger 
                  className={`w-full focus-visible:ring-gray-300 focus-visible:ring-3 focus-visible:ring-offset-0 ${errors.currencyFrom ? 'border-red-500' : ''}`}
                >
                  <SelectValue placeholder="Currency From" />
                </SelectTrigger>
                <SelectContent className="bg-white border-none shadow-md">
                  {currencies.map((currency) => (
                    <SelectItem key={currency.id} value={currency.id.toString()}>
                      {currency.CurrencyCode} - {currency.CurrencyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.currencyFrom && (
                <p className="text-red-500 text-sm mt-1">{errors.currencyFrom}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Currency To</label>
              <Select 
                value={currencyTo} 
                onValueChange={handleCurrencyToChange} 
                required
              >
                <SelectTrigger 
                  className={`w-full focus-visible:ring-gray-300 focus-visible:ring-3 focus-visible:ring-offset-0 ${errors.currencyTo ? 'border-red-500' : ''}`}
                >
                  <SelectValue placeholder="Currency To" />
                </SelectTrigger>
                <SelectContent className="bg-white border-none shadow-md">
                  {currencies.map((currency) => (
                    <SelectItem key={currency.id} value={currency.id.toString()}>
                      {currency.CurrencyCode} - {currency.CurrencyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.currencyTo && (
                <p className="text-red-500 text-sm mt-1">{errors.currencyTo}</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Exchange Rate</label>
            <Input
              type="number"
              step="0.000001"
              placeholder="Exchange Rate"
              value={exchangeRate}
              onChange={handleExchangeRateChange}
              required
              min="0.000001"
              className={`focus-visible:ring-gray-300 focus-visible:ring-3 focus-visible:ring-offset-0 ${errors.exchangeRate ? 'border-red-500' : ''}`}
              aria-invalid={errors.exchangeRate ? "true" : "false"}
              aria-describedby={errors.exchangeRate ? "exchange-rate-error" : undefined}
            />
            {errors.exchangeRate && (
              <p id="exchange-rate-error" className="text-red-500 text-sm mt-1">
                {errors.exchangeRate}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="submit"
              className="bg-blue-500 shadow-md text-white hover:bg-white hover:text-blue-500 hover:border-blue-500 border-2 border-blue-500 rounded-3xl px-6 py-2 transition-all cursor-pointer"
            >
              {mode === 'edit' ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CurrencyExchangeModal;
