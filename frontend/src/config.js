// API Configuration
const API_BASE_URL = '/api';  // This will be proxied through Nginx

// Configure axios defaults
import axios from 'axios';
import { toast } from 'react-toastify';

// Add request interceptor for debugging
axios.interceptors.request.use(
  config => {
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  error => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for global error handling
axios.interceptors.response.use(
  response => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  error => {
    console.error('API Error Details:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
      message: error.message
    });
    
    // Handle network errors
    if (!error.response) {
      toast.error('Network error. Please check your connection.');
      return Promise.reject(error);
    }

    // Handle specific error status codes
    switch (error.response.status) {
      case 401:
        toast.error('Session expired. Please login again.');
        // Optionally redirect to login page
        break;
      case 403:
        toast.error('You do not have permission to perform this action.');
        break;
      case 404:
        toast.error('The requested resource was not found.');
        break;
      case 500:
        toast.error('Server error. Please try again later.');
        break;
      default:
        toast.error(error.response.data?.error || 'An error occurred. Please try again.');
    }

    return Promise.reject(error);
  }
);

// Configure axios defaults
axios.defaults.timeout = 30000; // 30 seconds timeout
axios.defaults.withCredentials = true; // Enable credentials

export const API_ENDPOINTS = {

  // API Base URL
  API_BASE_URL: API_BASE_URL,
  // Financial Years
  FINANCIAL_YEARS: `${API_BASE_URL}/financial-years`,
  
  // Clients
  CLIENTS: `${API_BASE_URL}/clients`,
  
  // Client Employees
  CLIENT_EMPLOYEES: `${API_BASE_URL}/client-employees`,
  
  // Employees
  EMPLOYEES: `${API_BASE_URL}/employees`,
  
  // Employee Cost
  EMPLOYEE_COST: `${API_BASE_URL}/employee-cost`,
  
  // Roles
  ROLES: `${API_BASE_URL}/roles`,
  
  // Levels
  LEVELS: `${API_BASE_URL}/levels`,
  
  // Organisations
  ORGANISATIONS: `${API_BASE_URL}/organisations`,
  
  // Currencies
  CURRENCIES: `${API_BASE_URL}/currencies`,
  
  // Exchange Rates
  EXCHANGE_RATES: `${API_BASE_URL}/exchange-rates`,
  
  // Bank Details
  BANK_DETAILS: `${API_BASE_URL}/bank-details`,
  
  // Billing
  BILLING: `${API_BASE_URL}/billing`,
  
  // Invoices
  INVOICES: `${API_BASE_URL}/invoices`,
  
  // Ledger
  LEDGER: `${API_BASE_URL}/ledger`,
  
  // Client Balance
  CLIENT_BALANCE: `${API_BASE_URL}/client-balance`,
  
  // Payment Tracker
  PAYMENT_TRACKER: `${API_BASE_URL}/payment-tracker`,
  
  // Profitability
  PROFITABILITY: `${API_BASE_URL}/profitability`,

  // Backup and Restore
  BACKUP: `${API_BASE_URL}/backup`,
  
};

export default API_ENDPOINTS