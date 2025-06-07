import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { API_ENDPOINTS } from '../../config';

const ClientModal = ({ open, onClose, initialData, onSubmit }) => {
  const [formData, setFormData] = useState({
    ClientName: '',
    Abbreviation: '',
    ContactPerson: '',
    Email: '',
    RegisteredAddress: '',
    BillingCurrencyID: '',
    OrganisationID: '',
    BankDetailID: '',
  });

  const [currencies, setCurrencies] = useState([]);
  const [organisations, setOrganisations] = useState([]);
  const [bankDetails, setBankDetails] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [currenciesRes, orgsRes, bankRes] = await Promise.all([
          fetch(API_ENDPOINTS.CURRENCIES),
          fetch(API_ENDPOINTS.ORGANISATIONS),
          fetch(`${API_ENDPOINTS.BANK_DETAILS}/all`)
        ]);

        if (!currenciesRes.ok || !orgsRes.ok || !bankRes.ok) {
          throw new Error('Failed to fetch dropdown data');
        }

        const currenciesData = await currenciesRes.json();
        const orgsData = await orgsRes.json();
        const bankData = await bankRes.json();

        setCurrencies(currenciesData);
        setOrganisations(orgsData);
        setBankDetails(bankData);
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
        alert('Error fetching dropdown data');
      }
    };

    if (open) fetchData();
  }, [open]);

  useEffect(() => {
    if (open && initialData) {
      // Convert IDs to strings to ensure consistent comparison
      setFormData({
        ClientName: initialData.ClientName || '',
        Abbreviation: initialData.Abbreviation || '',
        ContactPerson: initialData.ContactPerson || '',
        Email: initialData.Email || '',
        RegisteredAddress: initialData.RegisteredAddress || '',
        BillingCurrencyID: initialData.BillingCurrencyID ? String(initialData.BillingCurrencyID) :
          (initialData.BillingCurrency?.id ? String(initialData.BillingCurrency.id) : ''),
        OrganisationID: initialData.OrganisationID ? String(initialData.OrganisationID) :
          (initialData.Organisation?.id ? String(initialData.Organisation.id) : ''),
        BankDetailID: initialData.BankDetailID ? String(initialData.BankDetailID) :
          (initialData.BankDetail?.id ? String(initialData.BankDetail.id) : ''),
      });

      console.log("Setting initial data in modal:", formData);
    } else {
      resetForm();
    }
  }, [open, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field, value) => {
    console.log(`Updating ${field} with value:`, value);
    setFormData((prev) => ({ ...prev, [field]: String(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form data:", formData);

    // Pass the formData to the parent component
    onClose(formData);
  };

  const resetForm = () => {
    setFormData({
      ClientName: '',
      Abbreviation: '',
      ContactPerson: '',
      Email: '',
      RegisteredAddress: '',
      BillingCurrencyID: '',
      OrganisationID: '',
      BankDetailID: '',
    });
  };

  return (
     <Dialog open={open} onOpenChange={(val) => !val && onClose(null)}>
      <DialogContent className="max-w-3xl border-none bg-white p-6">
        <DialogHeader className='border-b border-[#9DA4B3]'>
          <DialogTitle className='mb-4 font-normal'>{initialData?.id ? 'Edit Client' : 'Add Client'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 mt-2">
          {/* Client Name */}
          <div className="col-span-1">
            <label className="block mb-1 text-sm font-normal text-gray-700">Client Name *</label>
            <input
              type="text"
              placeholder="Client Name"
              name="ClientName"
              value={formData.ClientName}
              onChange={handleChange}
              required
              className="w-full h-9 px-2 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>

          {/* Abbreviation */}
          <div className="col-span-1">
            <label className="block mb-1 text-sm font-normal text-gray-700">Abbreviation *</label>
            <input
              type="text"
              placeholder="Abbreviation"
              name="Abbreviation"
              value={formData.Abbreviation}
              onChange={handleChange}
              required
              className="w-full h-9 px-2 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"

            />
          </div>

          {/* Contact Person */}
          <div className="col-span-1">
            <label className="block mb-1 text-sm font-normal text-gray-700">Contact Person *</label>
            <input
              type="text"
              placeholder="Contact Person"
              name="ContactPerson"
              value={formData.ContactPerson}
              onChange={handleChange}
              required
              className="w-full h-9 px-2 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"

            />
          </div>

          {/* Email */}
          <div className="col-span-1">
            <label className="block mb-1 text-sm font-normal text-gray-700">Email *</label>
            <input
              type="email"
              placeholder="Email"
              name="Email"
              value={formData.Email}
              onChange={handleChange}
              required
             className="w-full h-9 px-2 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"

            />
          </div>

          {/* Registered Address */}
          <div className="col-span-1">
            <label className="block mb-1 text-sm font-normal text-gray-700">Registered Address *</label>
            <input
              type="text"
              placeholder="Registered Address"
              name="RegisteredAddress"
              value={formData.RegisteredAddress}
              onChange={handleChange}
              required
              className="w-full h-9 px-2 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"

            />
          </div>

          {/* Billing Currency */}
          <div className="col-span-1">
            <label className="block mb-1 text-sm font-normal text-gray-700">Billing Currency *</label>
            <Select
              value={formData.BillingCurrencyID || ""}
              onValueChange={(val) => handleSelectChange('BillingCurrencyID', val)}
            >
              <SelectTrigger className="w-full p-2 border-black border rounded-md focus:outline-none focus:ring-3 focus:ring-gray-300 ">
                <SelectValue placeholder="Select Billing Currency" />
              </SelectTrigger>
              <SelectContent className='border-none bg-white'>
                {currencies.map((currency) => (
                  <SelectItem key={currency.id} value={String(currency.id)}>
                    {currency.CurrencyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bank Detail */}
          <div className="col-span-1">
            <label className="block mb-1 text-sm font-normal text-gray-700">Bank Detail *</label>
            <Select
              value={formData.BankDetailID || ""}
              onValueChange={(val) => handleSelectChange('BankDetailID', val)}
            >
              <SelectTrigger className="w-full p-2 border-black border rounded-md focus:outline-none focus:ring-3 focus:ring-gray-300 ">
                <SelectValue placeholder="Select Bank Detail" />
              </SelectTrigger>
              <SelectContent className='border-none bg-white'>
                {bankDetails.map((bank) => (
                  <SelectItem key={bank.id} value={String(bank.id)}>
                    {bank.BankName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Organisation / Payee */}
          <div className="col-span-1">
            <label className="block mb-1 text-sm font-normal text-gray-700">Payee *</label>
            <Select
              value={formData.OrganisationID || ""}
              onValueChange={(val) => handleSelectChange('OrganisationID', val)}
            >
              <SelectTrigger className="w-full p-2 border-black border rounded-md focus:outline-none focus:ring-3 focus:ring-gray-300 ">
                <SelectValue placeholder="Select Payee" />
              </SelectTrigger>
              <SelectContent className='border-none bg-white'>
                {organisations.map((org) => (
                  <SelectItem key={org.id} value={String(org.id)}>
                    {org.Abbreviation}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="col-span-2 mt-4">
            <button
              type="submit"
              className="bg-blue-500 shadow-md text-white hover:bg-white hover:text-blue-500 hover:border-blue-500 border-2 border-blue-500 rounded-3xl px-6 py-2 transition-all"
            >
              {initialData?.id ? 'Update Client' : 'Add Client'}
            </button>
          </DialogFooter>
        </form>

      </DialogContent>
    </Dialog>
  );
};

export default ClientModal;