import React, { useState, useEffect, useRef } from 'react';
import { Edit, Trash, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from '../../../config';
import RoleModal from '../../../Modal/EmployeeModal/RoleModal';
import OrganisationModal from '../../../Modal/EmployeeModal/OrganisationModal';
import LevelModal from '../../../Modal/EmployeeModal/LevelModal';
import CurrencyExchangeModal from '../../../Modal/EmployeeModal/CurrencyExchangeModal';
import CurrencyModal from '../../../Modal/EmployeeModal/CurrencyModal';
import BankDetailModal from '../../../Modal/EmployeeModal/BankDetailModal';
import ConfirmationModal from '../../../Modal/EmployeeModal/ConfirmationModal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useYear } from '../../../contexts/YearContexts';
import { Input } from '@/components/ui/input';

// Fallback for useYear if context is not available
const useYearWithFallback = () => {
  try {
    return useYear() || { selectedYear: null, setSelectedYear: () => {} };
  } catch (e) {
    return { selectedYear: null, setSelectedYear: () => {} };
  }
};

const OtherSettings = () => {
  const [exchangeRates, setExchangeRates] = useState([]);
  const [employeeRoles, setEmployeeRoles] = useState([]);
  const [employeeLevels, setEmployeeLevels] = useState([]);
  const [organisations, setOrganisations] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [bankDetails, setBankDetails] = useState([]);
  const [financialYears, setFinancialYears] = useState([]);
  const [totalYears, setTotalYears] = useState(0);
  const [showMoreAvailable, setShowMoreAvailable] = useState(true);
  const [randomCode, setRandomCode] = useState('');
  const { selectedYear, setSelectedYear } = useYearWithFallback();

const [backupFile, setBackupFile] = useState(null);
const [restoreModalOpen, setRestoreModalOpen] = useState(false);

  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [roleModalMode, setRoleModalMode] = useState('create');
  const [roleModalData, setRoleModalData] = useState(null);

  const [organisationModalOpen, setOrganisationModalOpen] = useState(false);
  const [organisationModalMode, setOrganisationModalMode] = useState('create');
  const [organisationModalData, setOrganisationModalData] = useState(null);

  const [levelModalOpen, setLevelModalOpen] = useState(false);
  const [levelModalMode, setLevelModalMode] = useState('create');
  const [levelModalData, setLevelModalData] = useState(null);

  const [currencyExchangeModalOpen, setCurrencyExchangeModalOpen] = useState(false);
  const [currencyExchangeModalMode, setCurrencyExchangeModalMode] = useState('create');
  const [currencyExchangeModalData, setCurrencyExchangeModalData] = useState(null);

  const [currencyModalOpen, setCurrencyModalOpen] = useState(false);
  const [currencyModalMode, setCurrencyModalMode] = useState('create');
  const [currencyModalData, setCurrencyModalData] = useState(null);

  const [bankDetailModalOpen, setBankDetailModalOpen] = useState(false);
  const [bankDetailModalMode, setBankDetailModalMode] = useState('create');
  const [bankDetailModalData, setBankDetailModalData] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const buttonRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch financial years
  const fetchFinancialYears = async (page = 1, limit = 2) => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.FINANCIAL_YEARS}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching financial years:', error);
      alert('Failed to fetch financial years. Please check if the backend server is running.');
      throw error;
    }
  };

  // Fetch levels
  const fetchLevels = async () => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.LEVELS}`);
      setEmployeeLevels(response.data);
    } catch (error) {
      console.error('Error fetching levels:', error);
      alert('Failed to fetch levels. Please check if the backend server is running.');
    }
  };

  // Fetch organisations
  const fetchOrganisations = async () => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.ORGANISATIONS}`);
      setOrganisations(response.data);
    } catch (error) {
      console.error('Error fetching organisations:', error);
      alert('Failed to fetch organisations. Please check if the backend server is running.');
    }
  };

  // Fetch roles
  const fetchRoles = async () => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.ROLES}`);
      setEmployeeRoles(response.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
      alert('Failed to fetch roles. Please check if the backend server is running.');
    }
  };

  // Fetch currencies
  const fetchCurrencies = async () => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.CURRENCIES}`);
      setCurrencies(response.data);
    } catch (error) {
      console.error('Error fetching currencies:', error);
      alert('Failed to fetch currencies. Please check if the backend server is running.');
    }
  };

  // Fetch exchange rates
  const fetchExchangeRates = async (year) => {
    try {
      if (!year) return;
      const response = await axios.get(`${API_ENDPOINTS.EXCHANGE_RATES}?year=${year}`);
      setExchangeRates(response.data);
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      alert('Failed to fetch exchange rates.');
      setExchangeRates([]);
    }
  };

  // Fetch bank details
  const fetchBankDetails = async () => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.BANK_DETAILS}/all`);
      setBankDetails(response.data);
    } catch (error) {
      console.error('Error fetching bank details:', error);
      alert('Failed to fetch bank details. Please check if the backend server is running.');
    }
  };

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchLevels(),
          fetchOrganisations(),
          fetchRoles(),
          fetchCurrencies(),
          fetchBankDetails(),
        ]);

        const financialYearData = await fetchFinancialYears(1, 2);
        setFinancialYears(financialYearData.financialYears.map(year => year.year));
        setTotalYears(financialYearData.total);
        setShowMoreAvailable(financialYearData.financialYears.length < financialYearData.total);

        if (financialYearData.financialYears.length > 0 && !selectedYear) {
          setSelectedYear(financialYearData.financialYears[0].year);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setError('Failed to load settings data');
        toast.error('Failed to load settings data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch exchange rates when selectedYear changes
  useEffect(() => {
    fetchExchangeRates(selectedYear);
  }, [selectedYear]);

  // Handle add exchange rate
  const handleAddExchangeRate = (event) => {
    event.stopPropagation();
    if (!selectedYear) {
      alert('Please select a financial year first.');
      return;
    }
    if (currencies.length === 0) {
      alert('No currencies available. Please add currencies first.');
      return;
    }
    setCurrencyExchangeModalMode('create');
    setCurrencyExchangeModalData(null);
    setCurrencyExchangeModalOpen(true);
  };

  // Handle edit exchange rate
  const handleEditExchangeRate = (rate, event) => {
    event.stopPropagation();
    setCurrencyExchangeModalMode('edit');
    setCurrencyExchangeModalData({
      id: rate.id,
      CurrencyFromID: rate.CurrencyFrom.id,
      CurrencyToID: rate.CurrencyTo.id,
      ExchangeRate: rate.Rate,
    });
    setCurrencyExchangeModalOpen(true);
  };

  // Handle exchange rate submission
  const handleExchangeRateSubmit = async (exchangeRate) => {
    try {
      if (!exchangeRate.CurrencyFromID || !exchangeRate.CurrencyToID || !exchangeRate.ExchangeRate || !selectedYear) {
        throw new Error('Please fill all fields: Currency From, Currency To, Exchange Rate, and Financial Year.');
      }
      if (isNaN(parseFloat(exchangeRate.ExchangeRate)) || parseFloat(exchangeRate.ExchangeRate) <= 0) {
        throw new Error('Exchange Rate must be a positive number.');
      }
      if (exchangeRate.CurrencyFromID === exchangeRate.CurrencyToID) {
        throw new Error('Currency From and Currency To cannot be the same.');
      }

      const payload = {
        CurrencyFromID: parseInt(exchangeRate.CurrencyFromID),
        CurrencyToID: parseInt(exchangeRate.CurrencyToID),
        Rate: parseFloat(exchangeRate.ExchangeRate),
        Year: selectedYear,
      };

      if (exchangeRate.id) {
        await axios.put(`${API_ENDPOINTS.EXCHANGE_RATES}/${exchangeRate.id}`, payload);
        toast.success('Exchange rate updated successfully');
      } else {
        await axios.post(API_ENDPOINTS.EXCHANGE_RATES, payload);
        toast.success('Exchange rate created successfully');
      }

      fetchExchangeRates(selectedYear);
      setCurrencyExchangeModalOpen(false);
    } catch (error) {
      console.error('Error saving exchange rate:', error);
      toast.error(error.message || 'Error saving exchange rate');
    }
  };

  const deleteExchangeRate = async (exchangeRateId) => {
    try {
      await axios.delete(`${API_ENDPOINTS.EXCHANGE_RATES}/${exchangeRateId}`);
      toast.success('Exchange rate deleted successfully');
      fetchExchangeRates(selectedYear);
    } catch (error) {
      console.error('Error deleting exchange rate:', error);
      toast.error('Error deleting exchange rate');
    }
  };

  // Handle add role
  const handleAddEmployeeRole = (event) => {
    event.stopPropagation();
    setRoleModalMode('create');
    setRoleModalData(null);
    setRoleModalOpen(true);
  };

  // Handle edit role
  const handleEditEmployeeRole = (role, event) => {
    event.stopPropagation();
    setRoleModalMode('edit');
    setRoleModalData({ id: role.id, RoleName: role.RoleName });
    setRoleModalOpen(true);
  };

  // Handle role submission
  const handleRoleSubmit = async (role) => {
    try {
      if (!role.RoleName) {
        throw new Error('Role name is required');
      }
      let response;
      if (role.id) {
        response = await axios.put(`${API_ENDPOINTS.ROLES}/${role.id}`, { RoleName: role.RoleName });
      } else {
        response = await axios.post(API_ENDPOINTS.ROLES, { RoleName: role.RoleName });
      }
      setEmployeeRoles(prev =>
        role.id
          ? prev.map(r => (r.id === role.id ? response.data : r))
          : [...prev, response.data]
      );
      setRoleModalOpen(false);
    } catch (error) {
      console.error('Error submitting role:', error);
      alert(error.response?.data?.error || 'Failed to submit role.');
    }
  };

  // Delete role
  const deleteRole = async (roleId) => {
    try {
      await axios.delete(`${API_ENDPOINTS.ROLES}/${roleId}`);
      setEmployeeRoles(prev => prev.filter(role => role.id !== roleId));
    } catch (error) {
      console.error('Error deleting role:', error);
      alert(error.response?.data?.error || 'Failed to delete role.');
    }
  };

  // Handle add organisation
  const handleAddOrganisation = (event) => {
    event.stopPropagation();
    setOrganisationModalMode('create');
    setOrganisationModalData(null);
    setOrganisationModalOpen(true);
  };

  // Handle edit organisation
  const handleEditOrganisation = (organisation, event) => {
    event.stopPropagation();
    setOrganisationModalMode('edit');
    setOrganisationModalData({
      id: organisation.id,
      OrganisationName: organisation.OrganisationName,
      Abbreviation: organisation.Abbreviation,
      RegNumber: organisation.RegNumber,
    });
    setOrganisationModalOpen(true);
  };

  // Handle organisation submission
  const handleOrganisationSubmit = async (organisation) => {
    try {
      if (!organisation.OrganisationName || !organisation.Abbreviation || !organisation.RegNumber) {
        throw new Error('All organisation fields are required');
      }
      let response;
      if (organisation.id) {
        response = await axios.put(`${API_ENDPOINTS.ORGANISATIONS}/${organisation.id}`, {
          OrganisationName: organisation.OrganisationName,
          Abbreviation: organisation.Abbreviation,
          RegNumber: organisation.RegNumber,
        });
      } else {
        response = await axios.post(API_ENDPOINTS.ORGANISATIONS, {
          OrganisationName: organisation.OrganisationName,
          Abbreviation: organisation.Abbreviation,
          RegNumber: organisation.RegNumber,
        });
      }
      setOrganisations(prev =>
        organisation.id
          ? prev.map(org => (org.id === organisation.id ? response.data : org))
          : [...prev, response.data]
      );
      setOrganisationModalOpen(false);
    } catch (error) {
      console.error('Error submitting organisation:', error);
      alert(error.response?.data?.error || 'Failed to submit organisation.');
    }
  };

  // Delete organisation
  const deleteOrganisation = async (organisationId) => {
    try {
      await axios.delete(`${API_ENDPOINTS.ORGANISATIONS}/${organisationId}`);
      setOrganisations(prev => prev.filter(org => org.id !== organisationId));
    } catch (error) {
      console.error('Error deleting organisation:', error);
      alert(error.response?.data?.error || 'Failed to delete organisation.');
    }
  };

  // Handle add level
  const handleAddEmployeeLevel = (event) => {
    event.stopPropagation();
    setLevelModalMode('create');
    setLevelModalData(null);
    setLevelModalOpen(true);
  };

  // Handle edit level
  const handleEditEmployeeLevel = (level, event) => {
    event.stopPropagation();
    setLevelModalMode('edit');
    setLevelModalData({ id: level.id, LevelName: level.LevelName });
    setLevelModalOpen(true);
  };

  // Handle level submission
  const handleLevelSubmit = async (level) => {
    try {
      if (!level.LevelName) {
        throw new Error('Level name is required');
      }
      if (level.id) {
        await axios.put(`${API_ENDPOINTS.LEVELS}/${level.id}`, { LevelName: level.LevelName });
      } else {
        await axios.post(API_ENDPOINTS.LEVELS, { LevelName: level.LevelName });
      }
      await fetchLevels();
      setLevelModalOpen(false);
    } catch (error) {
      console.error('Error submitting level:', error);
      alert(error.response?.data?.error || 'Failed to submit level.');
    }
  };

  // Delete level
  const deleteLevel = async (levelId) => {
    try {
      await axios.delete(`${API_ENDPOINTS.LEVELS}/${levelId}`);
      await fetchLevels();
    } catch (error) {
      console.error('Error deleting level:', error);
      alert(error.response?.data?.error || 'Failed to delete level.');
    }
  };

  // Handle add currency
  const handleAddCurrency = (event) => {
    event.stopPropagation();
    setCurrencyModalMode('create');
    setCurrencyModalData(null);
    setCurrencyModalOpen(true);
  };

  // Handle edit currency
  const handleEditCurrency = (currency, event) => {
    event.stopPropagation();
    setCurrencyModalMode('edit');
    setCurrencyModalData({
      id: currency.id,
      CurrencyCode: currency.CurrencyCode,
      CurrencyName: currency.CurrencyName,
    });
    setCurrencyModalOpen(true);
  };

  // Handle currency submission
  const handleCurrencySubmit = async (currency) => {
    try {
      if (!currency.CurrencyCode || !currency.CurrencyName) {
        throw new Error('Currency code and name are required');
      }
      let response;
      if (currency.id) {
        response = await axios.put(`${API_ENDPOINTS.CURRENCIES}/${currency.id}`, {
          CurrencyCode: currency.CurrencyCode,
          CurrencyName: currency.CurrencyName,
        });
      } else {
        response = await axios.post(API_ENDPOINTS.CURRENCIES, {
          CurrencyCode: currency.CurrencyCode,
          CurrencyName: currency.CurrencyName,
        });
      }
      setCurrencies(prev =>
        currency.id
          ? prev.map(c => (c.id === currency.id ? response.data : c))
          : [...prev, response.data]
      );
      setCurrencyModalOpen(false);
    } catch (error) {
      console.error('Error submitting currency:', error);
      alert(error.response?.data?.error || 'Failed to submit currency.');
    }
  };

  // Delete currency
  const deleteCurrency = async (currencyId) => {
    try {
      await axios.delete(`${API_ENDPOINTS.CURRENCIES}/${currencyId}`);
      setCurrencies(prev => prev.filter(currency => currency.id !== currencyId));
    } catch (error) {
      console.error('Error deleting currency:', error);
      alert(error.response?.data?.error || 'Failed to delete currency.');
    }
  };

  // Handle add bank detail
  const handleAddBankDetail = (event) => {
    event.stopPropagation();
    setBankDetailModalMode('create');
    setBankDetailModalData(null);
    setBankDetailModalOpen(true);
  };

  // Handle edit bank detail
  const handleEditBankDetail = (bankDetail, event) => {
    event.stopPropagation();
    setBankDetailModalMode('edit');
    setBankDetailModalData({
      id: bankDetail.id,
      BankName: bankDetail.BankName,
      AccountNumber: bankDetail.AccountNumber,
      SwiftCode: bankDetail.SwiftCode,
      IFSC: bankDetail.IFSC,
    });
    setBankDetailModalOpen(true);
  };

  // Handle bank detail submission
  const handleBankDetailSubmit = async (bankDetail) => {
    try {
      if (!bankDetail.BankName || !bankDetail.AccountNumber || !bankDetail.SwiftCode || !bankDetail.IFSC) {
        throw new Error('All bank detail fields are required');
      }

      const payload = {
        BankName: bankDetail.BankName,
        AccountNumber: bankDetail.AccountNumber,
        SwiftCode: bankDetail.SwiftCode,
        IFSC: bankDetail.IFSC,
      };

      let response;
      if (bankDetail.id) {
        response = await axios.put(`${API_ENDPOINTS.BANK_DETAILS}/update/${bankDetail.id}`, payload);
      } else {
        response = await axios.post(`${API_ENDPOINTS.BANK_DETAILS}/create`, payload);
      }

      setBankDetails(prev =>
        bankDetail.id
          ? prev.map(b => (b.id === bankDetail.id ? response.data : b))
          : [...prev, response.data]
      );
      setBankDetailModalOpen(false);
    } catch (error) {
      console.error('Error submitting bank detail:', error);
      alert(error.response?.data?.error || 'Failed to submit bank detail.');
    }
  };

  // Delete bank detail
  const deleteBankDetail = async (bankDetailId) => {
    try {
      await axios.delete(`${API_ENDPOINTS.BANK_DETAILS}/delete/${bankDetailId}`);
      setBankDetails(prev => prev.filter(bankDetail => bankDetail.id !== bankDetailId));
    } catch (error) {
      console.error('Error deleting bank detail:', error);
      alert(error.response?.data?.error || 'Failed to delete bank detail.');
    }
  };

  // Handle year change
  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  // Handle add upcoming year
  const handleAddUpcomingYear = (event) => {
    event.stopPropagation();
    setRandomCode(Math.random().toString(36).substring(2, 8));
    setModalOpen(true);
  };

  // Confirm add upcoming year
  const confirmAddUpcomingYear = async () => {
    try {
      const response = await axios.post(API_ENDPOINTS.FINANCIAL_YEARS);
      const newYear = response.data.year;
      setFinancialYears(prev => [newYear, ...prev]);
      setSelectedYear(newYear);
      setTotalYears(prev => prev + 1);
      
      // Reload the page after adding a new financial year
      window.location.reload();
    } catch (error) {
      console.error('Error adding financial year:', error);
      alert(error.response?.data?.error || 'Failed to add financial year.');
    }
    setModalOpen(false);
  };

  const backupDatabase = async () => {
    try {
      const response = await axios.post(`${API_ENDPOINTS.BACKUP}`);
      if (response.data.success) {
        const { backupFile } = response.data;
        // Fetch the backup file as a blob
        const downloadUrl = `${API_ENDPOINTS.BACKUP}/download/${backupFile}`;
        const fileResponse = await axios.get(downloadUrl, { responseType: 'blob' });
        const blob = fileResponse.data;
  
        // Try to use showSaveFilePicker for modern browsers
        if (window.showSaveFilePicker) {
          const handle = await window.showSaveFilePicker({
            suggestedName: backupFile,
            types: [
              {
                description: 'SQLite Database',
                accept: { 'application/x-sqlite3': ['.db'] },
              },
            ],
          });
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
          alert(`${response.data.message} Backup file saved to selected location.`);
        } else {
          // Fallback for browsers without showSaveFilePicker
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = backupFile;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          alert(`${response.data.message} Backup file: ${backupFile} has started downloading.`);
        }
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error('Error during database backup:', error);
      alert(error.response?.data?.message || 'Failed to backup database.');
    }
  };

  // Open restore modal
  const openRestoreModal = () => {
    setRestoreModalOpen(true);
  };

  

  const restoreDatabase = async () => {
    try {
      if (!backupFile) {
        alert('Please select a backup file.');
        return;
      }
      
      // Create form data for file upload
      const formData = new FormData();
      formData.append('backupFile', backupFile);
      
      // Make the API call
      const response = await axios.post(`${API_ENDPOINTS.BACKUP}/restore`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        alert(response.data.message);
        setRestoreModalOpen(false);
        setBackupFile(null);
        
        // Refresh data after restore
        fetchLevels();
        fetchOrganisations();
        fetchRoles();
        fetchCurrencies();
        fetchBankDetails();
        fetchExchangeRates(selectedYear);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error('Error during database restore:', error);
      alert(error.response?.data?.message || 'Failed to restore database.');
    }
  };

  // Handle show more years
  const handleShowMoreYears = async (event) => {
    event.stopPropagation();
    try {
      const response = await axios.get(`${API_ENDPOINTS.FINANCIAL_YEARS}?limit=${totalYears}`);
      const allYears = response.data.financialYears.map(year => year.year);
      setFinancialYears(allYears);
      setShowMoreAvailable(false);
    } catch (error) {
      console.error('Error fetching all financial years:', error);
      alert('Failed to fetch all financial years.');
    }
  };

  // Format year for display
  const formatYear = (year) => {
    const nextYear = parseInt(year) + 1;
    return `${year}-${nextYear}`;
  };

  return (
    <div className="flex flex-col items-center p-7">
      <div className="w-full bg-white rounded-3xl shadow-sm p-8 mb-5">
        <div className="flex justify-between items-center w-full mb-0">
          <h2 className="text-xl font-normal">Financial Year</h2>
          <div className="flex gap-2.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="min-w-[120px] px-5 py-2.5 rounded-full border-gray-300 bg-white text-black hover:border-blue-500 transition-colors flex items-center justify-between"
                  ref={buttonRef}
                >
                  {selectedYear ? formatYear(selectedYear) : 'Select Year'}
                  <ChevronDown className="ml-2" size={24} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="bg-white"
                style={{ width: buttonRef.current ? buttonRef.current.offsetWidth : 'auto' }}
              >
                {financialYears.map((year, index) => (
                  <DropdownMenuItem key={`${year}-${index}`} onClick={() => handleYearChange(year)}>
                    {formatYear(year)}
                  </DropdownMenuItem>
                ))}
                {showMoreAvailable && (
                  <DropdownMenuItem onClick={handleShowMoreYears}>Show More</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              onClick={handleAddUpcomingYear}
              className="bg-[#048DFF] cursor-pointer text-white hover:bg-white hover:text-[#048DFF] hover:border-blue-500 border-2 border-[#048DFF] rounded-3xl px-6 py-2 transition-all"
            >
              Add Financial Year
            </Button>
          </div>
        </div>
      </div>

      <div className="w-full bg-white rounded-3xl shadow-sm p-8 mb-5">
        <div className="flex justify-between items-center w-full mb-0">
          <h2 className="text-xl font-normal">Backup and Restore</h2>
          <div className="flex gap-2.5">
            <Button onClick={backupDatabase} className="bg-[#048DFF] shadow-md cursor-pointer text-white hover:bg-white hover:text-[#048DFF] hover:border-blue-500 border-2 border-[#048DFF] rounded-3xl px-6 py-2 transition-all">
              Backup Database
            </Button>
            <Button onClick={openRestoreModal} className="bg-[#048DFF] shadow-md cursor-pointer text-white hover:bg-white hover:text-[#048DFF] hover:border-blue-500 border-2 border-[#048DFF] rounded-3xl px-6 py-2 transition-all">
              Restore Database
            </Button>
          </div>
        </div>
      </div>

      {restoreModalOpen && (
  <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-xs bg-opacity-10">
    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
      <h3 className="text-lg font-normal mb-4">Restore Database</h3>
      
      <div className="mb-4">
        <input
          type="file"
          onChange={(e) => setBackupFile(e.target.files[0])}
          className="w-full border rounded-md p-2"
          accept=".db"
        />
        <p className="text-xs text-gray-500 mt-1">
          Select your database backup file (.db)
        </p>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button
          onClick={() => {
            setRestoreModalOpen(false);
            setBackupFile(null);
          }}
          className="bg-gray-300 text-black hover:bg-gray-400 rounded-full"
        >
          Cancel
        </Button>
        <Button
          onClick={restoreDatabase}
          className="bg-blue-500 text-white cursor-pointer hover:bg-blue-500/90 rounded-full"
        >
          Restore
        </Button>
      </div>
    </div>
  </div>
)}

      <div className="flex justify-between w-full gap-5">
        <div className="flex-1 bg-white rounded-3xl shadow-sm p-8 mb-5 max-h-[300px] ">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-normal">Employee Levels</h2>
            <Button
              onClick={handleAddEmployeeLevel}
              className="bg-[#048DFF] shadow-md cursor-pointer text-white hover:bg-white hover:text-[#048DFF] hover:border-blue-500 border-2 border-[#048DFF] rounded-3xl px-6 py-2 transition-all"
            >
              Add New Level
            </Button>
          </div>
          {employeeLevels.length > 0 ? (
            <div className="max-h-[200px] overflow-y-auto">
            <Table>
              <TableHeader >
                <TableRow className="bg-[#EDEFF2] border-none">
                  <TableHead className="text-center text-sm font-normal text-black">Name</TableHead>
                  <TableHead className="text-center text-sm font-normal text-black">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employeeLevels.map((level) => (
                  <TableRow key={level.id}>
                    <TableCell className="text-center text-sm text-black border-b border-[#EDEFF2]">
                      {level.LevelName}
                    </TableCell>
                    <TableCell className="text-center text-sm text-black border-b border-[#EDEFF2]">
                      <button
                        className="text-gray-500 cursor-pointer hover:text-blue-500 mx-4"
                        title="Edit"
                        onClick={(event) => handleEditEmployeeLevel(level, event)}
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        className="text-gray-500  cursor-pointer hover:text-red-500 mx-4"
                        title="Delete"
                        onClick={() => deleteLevel(level.id)}
                      >
                        <Trash size={20} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          ) : (
            <p className="text-center text-sm text-gray-500">No levels available.</p>
          )}
        </div>

        <div className="flex-1 bg-white rounded-3xl shadow-sm p-8 mb-5 max-h-[300px] ">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-normal">Employee Roles</h2>
            <Button
              onClick={handleAddEmployeeRole}
              className="bg-[#048DFF] shadow-md cursor-pointer text-white hover:bg-white hover:text-[#048DFF] hover:border-blue-500 border-2 border-[#048DFF] rounded-3xl px-6 py-2 transition-all"
            >
              Add New Role
            </Button>
          </div>
          {employeeRoles.length > 0 ? (
             <div className="max-h-[200px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-none bg-[#EDEFF2]">
                  <TableHead className="text-center text-sm font-normal text-black">Name</TableHead>
                  <TableHead className="text-center text-sm font-normal text-black">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employeeRoles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="text-center text-sm text-black border-b border-[#EDEFF2]">
                      {role.RoleName}
                    </TableCell>
                    <TableCell className="text-center text-sm text-black border-b border-[#EDEFF2]">
                      <button
                        className="text-gray-500 cursor-pointer hover:text-blue-500 mx-4"
                        title="Edit"
                        onClick={(event) => handleEditEmployeeRole(role, event)}
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        className="text-gray-500 cursor-pointer hover:text-red-500 mx-4"
                        title="Delete"
                        onClick={() => deleteRole(role.id)}
                      >
                        <Trash size={20} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          ) : (
            <p className="text-center text-sm text-gray-500">No roles available.</p>
          )}
        </div>
      </div>

      <div className="flex justify-between w-full gap-5">
        <div className="flex-1 bg-white rounded-3xl shadow-sm p-8 mb-5 max-h-[300px] ">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-normal">Organisations</h2>
            <Button
              onClick={handleAddOrganisation}
              className="bg-[#048DFF] shadow-md cursor-pointer text-white hover:bg-white hover:text-[#048DFF] hover:border-blue-500 border-2 border-[#048DFF] rounded-3xl px-6 py-2 transition-all"
            >
              Add New Organisation
            </Button>
          </div>
          {organisations.length > 0 ? (
             <div className="max-h-[200px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#EDEFF2] border-none">
                  <TableHead className="text-center text-sm font-normal text-black">Name</TableHead>
                  <TableHead className="text-center text-sm font-normal text-black">Abbreviation</TableHead>
                  <TableHead className="text-center text-sm font-normal text-black">Reg. Number</TableHead>
                  <TableHead className="text-center text-sm font-normal text-black">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organisations.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell className="text-center text-sm text-black border-b border-[#EDEFF2]">
                      {org.OrganisationName}
                    </TableCell>
                    <TableCell className="text-center text-sm text-black border-b border-[#EDEFF2]">
                      {org.Abbreviation}
                    </TableCell>
                    <TableCell className="text-center text-sm text-black border-b border-[#EDEFF2]">
                      {org.RegNumber}
                    </TableCell>
                    <TableCell className="text-center text-sm text-black border-b border-[#EDEFF2]">
                      <button
                        className="text-gray-500 hover:text-blue-500 cursor-pointer mx-4"
                        title="Edit"
                        onClick={(event) => handleEditOrganisation(org, event)}
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        className="text-gray-500 hover:text-red-500 cursor-pointer mx-4"
                        title="Delete"
                        onClick={() => deleteOrganisation(org.id)}
                      >
                        <Trash size={20} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          ) : (
            <p className="text-center text-sm text-gray-500">No organisations available.</p>
          )}
        </div>
      </div>

      <div className="flex justify-between w-full gap-5">
        <div className="flex-1 bg-white rounded-3xl shadow-sm p-8 mb-5 max-h-[300px] ">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-normal">Bank Details</h2>
            <Button
              onClick={handleAddBankDetail}
             className="bg-[#048DFF] shadow-md cursor-pointer text-white hover:bg-white hover:text-[#048DFF] hover:border-blue-500 border-2 border-[#048DFF] rounded-3xl px-6 py-2 transition-all"
            >
              Add New Bank Detail
            </Button>
          </div>
          {bankDetails.length > 0 ? (
             <div className="max-h-[200px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#EDEFF2] border-none">
                  <TableHead className="text-center text-sm font-normal text-black">Bank Name</TableHead>
                  <TableHead className="text-center text-sm font-normal text-black">Account Number</TableHead>
                  <TableHead className="text-center text-sm font-normal text-black">Swift Code</TableHead>
                  <TableHead className="text-center text-sm font-normal text-black">IFSC Code</TableHead>
                  <TableHead className="text-center text-sm font-normal text-black">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bankDetails.map((detail) => (
                  <TableRow key={detail.id}>
                    <TableCell className="text-center text-sm text-black border-b border-[#EDEFF2]">
                      {detail.BankName}
                    </TableCell>
                    <TableCell className="text-center text-sm text-black border-b border-[#EDEFF2]">
                      {detail.AccountNumber}
                    </TableCell>
                    <TableCell className="text-center text-sm text-black border-b border-[#EDEFF2]">
                      {detail.SwiftCode}
                    </TableCell>
                    <TableCell className="text-center text-sm text-black border-b border-[#EDEFF2]">
                      {detail.IFSC}
                    </TableCell>
                    <TableCell className="text-center text-sm text-black border-b border-[#EDEFF2]">
                      <button
                        className="text-gray-500 hover:text-blue-500 cursor-pointer mx-4"
                        title="Edit"
                        onClick={(event) => handleEditBankDetail(detail, event)}
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        className="text-gray-500 hover:text-red-500 cursor-pointer mx-4"
                        title="Delete"
                        onClick={() => deleteBankDetail(detail.id)}
                      >
                        <Trash size={20} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          ) : (
            <p className="text-center text-sm text-gray-500">No bank details available.</p>
          )}
        </div>
      </div>

      <div className="flex justify-between w-full gap-5">
        <div className="flex-1 bg-white rounded-3xl shadow-sm p-8 mb-5 max-h-[300px]">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-normal">Currencies</h2>
            <Button
              onClick={handleAddCurrency}
              className="bg-[#048DFF] shadow-md cursor-pointer text-white hover:bg-white hover:text-[#048DFF] hover:border-blue-500 border-2 border-[#048DFF] rounded-3xl px-6 py-2 transition-all"
            >
              Add New Currency
            </Button>
          </div>
          {currencies.length > 0 ? (
             <div className="max-h-[200px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#EDEFF2] border-none">
                  <TableHead className="text-center text-sm font-normal text-black">Code</TableHead>
                  <TableHead className="text-center text-sm font-normal text-black">Name</TableHead>
                  <TableHead className="text-center text-sm font-normal text-black">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currencies.map((currency) => (
                  <TableRow key={currency.id}>
                    <TableCell className="text-center text-sm text-black border-b border-gray-300">
                      {currency.CurrencyCode}
                    </TableCell>
                    <TableCell className="text-center text-sm text-black border-b border-gray-300">
                      {currency.CurrencyName}
                    </TableCell>
                    <TableCell className="text-center text-sm text-black border-b border-gray-300">
                      <button
                        className="text-gray-500 hover:text-blue-500 cursor-pointer mx-4"
                        title="Edit"
                        onClick={(event) => handleEditCurrency(currency, event)}
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        className="text-gray-500 hover:text-red-500 cursor-pointer mx-4"
                        title="Delete"
                        onClick={() => deleteCurrency(currency.id)}
                      >
                        <Trash size={20} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          ) : (
            <p className="text-center text-sm text-gray-500">No currencies available.</p>
          )}
        </div>
        <div className="flex-1 bg-white rounded-3xl shadow-sm p-8 mb-5 max-h-[300px] ">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-normal">Currency Exchange Rate</h2>
            <Button
              onClick={handleAddExchangeRate}
              className="bg-[#048DFF] shadow-md cursor-pointer text-white hover:bg-white hover:text-[#048DFF] hover:border-blue-500 border-2 border-[#048DFF] rounded-3xl px-6 py-2 transition-all"
            >
              Add New Exchange Rate
            </Button>
          </div>
          {exchangeRates.length > 0 ? (
             <div className="max-h-[200px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#EDEFF2] border-none">
                  <TableHead className="text-center text-sm font-normal text-black">Currency From</TableHead>
                  <TableHead className="text-center text-sm font-normal text-black">Currency To</TableHead>
                  <TableHead className="text-center text-sm font-normal text-black">Exchange Rate</TableHead>
                  <TableHead className="text-center text-sm font-normal text-black">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exchangeRates.map((rate) => (
                  <TableRow key={rate.id}>
                    <TableCell className="text-center text-sm text-black border-b border-[#EDEFF2]">
                      {rate.CurrencyFrom?.CurrencyName || 'N/A'}
                    </TableCell>
                    <TableCell className="text-center text-sm text-black border-b border-[#EDEFF2]">
                      {rate.CurrencyTo?.CurrencyName || 'N/A'}
                    </TableCell>
                    <TableCell className="text-center text-sm text-black border-b border-[#EDEFF2]">
                      {parseFloat(rate.Rate).toFixed(6)}
                    </TableCell>
                    <TableCell className="text-center text-sm text-black border-b border-[#EDEFF2]">
                      <button
                        className="text-gray-500 hover:text-blue-500 mx-4 cursor-pointer"
                        title="Edit"
                        onClick={(event) => handleEditExchangeRate(rate, event)}
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        className="text-gray-500 hover:text-red-500 mx-4 cursor-pointer"
                        title="Delete"
                        onClick={() => deleteExchangeRate(rate.id)}
                      >
                        <Trash size={20} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          ) : (
            <p className="text-center text-sm text-gray-500">No exchange rates available.</p>
          )}
        </div>
      </div>

      <RoleModal
        open={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        mode={roleModalMode}
        initialData={roleModalData}
        onSubmit={handleRoleSubmit}
      />
      <OrganisationModal
        open={organisationModalOpen}
        onClose={() => setOrganisationModalOpen(false)}
        mode={organisationModalMode}
        initialData={organisationModalData}
        onSubmit={handleOrganisationSubmit}
      />
      <LevelModal
        open={levelModalOpen}
        onClose={() => setLevelModalOpen(false)}
        mode={levelModalMode}
        initialData={levelModalData}
        onSubmit={handleLevelSubmit}
      />
      <CurrencyExchangeModal
        open={currencyExchangeModalOpen}
        onClose={() => setCurrencyExchangeModalOpen(false)}
        mode={currencyExchangeModalMode}
        initialData={currencyExchangeModalData}
        onSubmit={handleExchangeRateSubmit}
        currencies={currencies}
      />
      <CurrencyModal
        open={currencyModalOpen}
        onClose={() => setCurrencyModalOpen(false)}
        mode={currencyModalMode}
        initialData={currencyModalData}
        onSubmit={handleCurrencySubmit}
      />
      <BankDetailModal
        open={bankDetailModalOpen}
        onClose={() => setBankDetailModalOpen(false)}
        mode={bankDetailModalMode}
        initialData={bankDetailModalData}
        onSubmit={handleBankDetailSubmit}
      />
      <ConfirmationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmAddUpcomingYear}
        randomCode={randomCode}
      />
    </div>
  );
};


export default OtherSettings;

