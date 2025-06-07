import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useYear } from '../contexts/YearContexts';
import { API_ENDPOINTS } from '../config';

const fiscalMonths = [
  { label: 'April', value: 4 },
  { label: 'May', value: 5 },
  { label: 'June', value: 6 },
  { label: 'July', value: 7 },
  { label: 'August', value: 8 },
  { label: 'September', value: 9 },
  { label: 'October', value: 10 },
  { label: 'November', value: 11 },
  { label: 'December', value: 12 },
  { label: 'January', value: 1 },
  { label: 'February', value: 2 },
  { label: 'March', value: 3 },
];

const GenerateInvoicePage = () => {
  const [clients, setClients] = useState([]);
  const [generatedInvoices, setGeneratedInvoices] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [allSelected, setAllSelected] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const { selectedYear, loading } = useYear();

  const fetchClients = async () => {
    try {
      const res = await fetch(`${API_ENDPOINTS.CLIENTS}?year=${selectedYear}`);
      if (!res.ok) throw new Error(`Failed to fetch clients: ${res.status}`);
      const data = await res.json();
      setClients(data);
    } catch (err) {
      console.error('Error fetching clients:', err);
      alert('Failed to fetch clients. Please try again.');
    }
  };

  const fetchGeneratedInvoices = async () => {
    try {
      const res = await fetch(`${API_ENDPOINTS.INVOICES}/generated/${selectedYear}/${selectedMonth}`);
      if (!res.ok) throw new Error(`Failed to fetch invoices: ${res.status}`);
      const data = await res.json();
      setGeneratedInvoices(data);
      console.log('Generated invoices data:', data);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      alert('Failed to fetch invoices. Please try again.');
    }
  };

  useEffect(() => {
    if (selectedYear) {
      fetchClients();
      fetchGeneratedInvoices();
    }
  }, [selectedYear, selectedMonth]);

  // Compute mergedInvoices using useMemo
  const mergedInvoices = useMemo(() => {
    return clients.map((client) => {
      const invoice = generatedInvoices.find((inv) => inv.ClientID === client.id);
      return invoice
        ? {
          id: invoice.id,
          clientId: client.id,
          clientName: client.ClientName,
          totalAmount: parseFloat(invoice.TotalAmount || 0),
          currencyCode: invoice.BillingCurrency?.CurrencyCode || '',
          generatedOn: invoice.GeneratedOn ? new Date(invoice.GeneratedOn) : null,
          invoicedOn: invoice.InvoicedOn ? new Date(invoice.InvoicedOn) : null,
          year: invoice.Year,
          month: invoice.Month,
          status: invoice.Status,
          pdfPath: invoice.PdfPath,
        }
        : {
          id: null,
          clientId: client.id,
          clientName: client.ClientName,
          totalAmount: 0,
          currencyCode: '',
          generatedOn: null,
          invoicedOn: null,
          year: null,
          month: null,
          status: 'Not generated yet',
          pdfPath: null,
        };
    });
  }, [clients, generatedInvoices]);

  // Auto-select generated invoices
  useEffect(() => {
    const generatedInvoiceIds = mergedInvoices
      .filter((invoice) => invoice.id && invoice.pdfPath)
      .map((invoice) => invoice.id);
    setSelectedRows((prev) => {
      const newSelection = [...new Set([...prev, ...generatedInvoiceIds])];
      return newSelection;
    });
  }, [mergedInvoices]);

  const handleGenerateInvoice = async () => {
    const toGenerate = mergedInvoices.filter((inv) => selectedRows.includes(inv.clientId) && !inv.id);
    console.log('Invoices to generate:', toGenerate);
    if (toGenerate.length === 0) {
      alert('No invoices selected to generate.');
      return;
    }

    try {
      for (const inv of toGenerate) {
        const response = await fetch(`${API_ENDPOINTS.INVOICES}/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ year: selectedYear, month: selectedMonth, clientId: inv.clientId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to generate invoice for ${inv.clientName}: ${errorData.error}`);
        }
      }
      await fetchGeneratedInvoices();
    } catch (err) {
      console.error('Generate invoice failed:', err);
      alert(`Error generating invoices: ${err.message}`);
    }
  };

  const handleDownload = async () => {
    const toDownload = mergedInvoices.filter((inv) => selectedRows.includes(inv.id) && inv.pdfPath);
    if (toDownload.length === 0) {
      alert('No generated invoices selected to download.');
      return;
    }

    try {
      for (const inv of toDownload) {
        const response = await fetch(`${API_ENDPOINTS.INVOICES}/download/${inv.id}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to download invoice ${inv.id}: ${errorData.error}`);
        }

        const blob = await response.blob();
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename;

        // Try to extract filename from Content-Disposition
        if (contentDisposition && contentDisposition.includes('filename=')) {
          filename = contentDisposition.split('filename=')[1].replace(/"/g, '');
        } else {
          // Fallback: Construct filename as {Month} {Year} {ClientName} Invoice.pdf
          const monthName = fiscalMonths.find((m) => m.value === inv.month)?.label.slice(0, 3);
          const sanitizedClientName = inv.clientName.replace(/[^a-zA-Z0-9]/g, '_');
          filename = `${monthName} ${inv.year} ${sanitizedClientName} Invoice.pdf`;
        }

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Download invoice failed:', err);
      alert(`Error downloading invoices: ${err.message}`);
    }
  };

  const handleDelete = async () => {
    const toDelete = mergedInvoices.filter((inv) => selectedRows.includes(inv.id) && inv.pdfPath);
    if (toDelete.length === 0) {
      alert('No generated invoices selected to delete.');
      return;
    }

    try {
      for (const inv of toDelete) {
        const response = await fetch(`${API_ENDPOINTS.INVOICES}/delete/${inv.id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error(`Failed to delete invoice ${inv.id}`);
      }
      await fetchGeneratedInvoices();
    } catch (err) {
      console.error('Delete invoice failed:', err);
      alert('Failed to delete invoice(s). Please try again.');
    }
  };

  const handleMarkAsSent = async () => {
    const toMark = mergedInvoices.filter((inv) => selectedRows.includes(inv.id) && inv.pdfPath);
    if (toMark.length === 0) {
      alert('No generated invoices selected to mark as sent.');
      return;
    }
    try {
      for (const inv of toMark) {
        const response = await fetch(`${API_ENDPOINTS.INVOICES}/mark-sent/${inv.id}`, { method: 'PUT' });
        if (!response.ok) throw new Error(`Failed to mark invoice ${inv.id} as sent`);
      }
      await fetchGeneratedInvoices();
    } catch (err) {
      console.error('Mark as sent failed:', err);
      alert('Failed to mark invoice(s) as sent. Please try again.');
    }
  };

  const handleRegenerate = async () => {
    const toRegenerate = mergedInvoices.filter((inv) => selectedRows.includes(inv.id) && inv.pdfPath);
    if (toRegenerate.length === 0) {
      alert('No generated invoices selected to regenerate.');
      return;
    }

    try {
      for (const inv of toRegenerate) {
        const response = await fetch(`${API_ENDPOINTS.INVOICES}/regenerate/${inv.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to regenerate invoice ${inv.id}: ${errorData.error}`);
        }
      }
      await fetchGeneratedInvoices();
    } catch (err) {
      console.error('Regenerate invoice failed:', err);
      alert('Failed to regenerate invoice(s). Please try again.');
    }
  };

  const handleViewInvoice = (filePath) => {
    window.open(`${API_ENDPOINTS.INVOICES}/view/${filePath}`, '_blank');
  };

  useEffect(() => {
    setAllSelected(selectedRows.length === mergedInvoices.length && mergedInvoices.length > 0);
  }, [selectedRows, mergedInvoices]);

  const handleRowSelect = (checked, rowId) => {
    setSelectedRows((prev) =>
      checked ? [...prev, rowId] : prev.filter((id) => id !== rowId)
    );
  };

  const handleSelectAll = (checked) => {
    setAllSelected(checked);
    setSelectedRows(checked ? mergedInvoices.map((m) => m.id || m.clientId) : []);
  };

  const hasNonGeneratedSelected = selectedRows.some((rowId) => {
    const inv = mergedInvoices.find((i) => (i.id || i.clientId) === rowId);
    return inv && !inv.id;
  });

  const hasGeneratedSelected = selectedRows.some((rowId) => {
    const inv = mergedInvoices.find((i) => i.id === rowId);
    return inv && inv.id;
  });

  // Helper function to format date as DD/MM/YY
  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(-2)}`;
  };

  // Helper function to get full invoice date from month and year
  const getInvoiceDate = (year, month) => {
    if (!year || !month) return 'N/A';
    const date = new Date(year, month - 1, 15);
    return formatDate(date);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex flex-col items-center gap-5 p-4">
      <Card className="w-full rounded-4xl shadow-sm bg-white border-white h-28">
        <CardHeader className="flex flex-row items-center justify-between pt-5">
          <h2 className="text-2xl font-normal text-black">
            FY: {selectedYear ? `${selectedYear}-${parseInt(selectedYear) + 1}` : 'Select Year'}
          </h2>
          <div className="flex items-center gap-3">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-40 rounded-full border-gray-300">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent className="bg-white border-none">
                {fiscalMonths.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      <Card className="w-full bg-white border-white rounded-3xl shadow-sm">
        <CardContent className="p-7">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-[24px] font-normal text-[#272727]">Generated Invoices</h2>

            <div className="flex-1 flex justify-center">
              {hasGeneratedSelected && (
                <div className="flex gap-3 flex-wrap justify-center">
                  <Button
                    onClick={handleDelete}
                    className="px-6 py-2 text-[#FF6E65] transition-all duration-300 ease-in-out 
            hover:bg-[rgba(255,110,101,0.08)] hover:text-[#FF6E65] 
            disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Delete
                  </Button>
                  <Button
                    onClick={handleDownload}
                    className="px-6 py-2 text-[#048DFF] transition-all duration-300 ease-in-out 
            hover:bg-[rgba(4,141,255,0.08)] hover:text-[#048DFF]
            disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Download
                  </Button>
                  <Button
                    onClick={handleMarkAsSent}
                    className="px-6 py-2 text-[#00C7B5] transition-all duration-300 ease-in-out 
            hover:bg-[rgba(0,199,181,0.08)] hover:text-[#00C7B5] 
            disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Mark as Sent to Client
                  </Button>
                  <Button
                    onClick={handleRegenerate}
                    className="bg-blue-500 text-white hover:bg-white hover:text-blue-500 hover:border-blue-500 border-2 border-blue-500 rounded-3xl px-6 py-2 transition-all cursor-pointer"
                  >
                    Re-generate
                  </Button>
                </div>
              )}
            </div>

            <div className="ml-auto">
              <Button
                onClick={handleGenerateInvoice}
                
                className="bg-blue-500 text-white hover:bg-white hover:text-blue-500 hover:border-blue-500 border-2 border-blue-500 rounded-3xl px-6 py-2 transition-all cursor-pointer"
              >
                Generate Invoice(s)
              </Button>
            </div>
          </div>


          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-center">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                      indeterminate={selectedRows.length > 0 && selectedRows.length < mergedInvoices.length}
                      className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 data-[state=checked]:text-white"
                    />
                  </th>
                  <th className="p-3 text-[14px] font-normal text-[#7B7B7B] mb-1">Client</th>
                  <th className="p-3 text-[14px] font-normal text-[#7B7B7B] mb-1">Total Billing Amount</th>
                  <th className="p-3 text-[14px] font-normal text-[#7B7B7B] mb-1">Generated On</th>
                  <th className="p-3 text-[14px] font-normal text-[#7B7B7B] mb-1">Invoice Date</th>
                  <th className="p-3 text-[14px] font-normal text-[#7B7B7B] mb-1">Status</th>
                  <th className="p-3 text-[14px] font-normal text-[#7B7B7B] mb-1">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mergedInvoices.map((invoice, index) => (
                  <tr
                    key={`${invoice.id || invoice.clientId}-${index}`}
                    className="text-sm text-black border-b border-[#EDEFF2] hover:bg-[#E6F2FF] transition-colors duration-200"
                  >
                    <td className="p-3 text-center">
                      <Checkbox
                        checked={selectedRows.includes(invoice.id || invoice.clientId)}
                        onCheckedChange={(checked) => handleRowSelect(checked, invoice.id || invoice.clientId)}
                        className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 data-[state=checked]:text-white"
                      />
                    </td>
                    <td className="p-3 text-center">{invoice.clientName}</td>
                    <td className="p-3 text-center">
                      {invoice.id
                        ? `${invoice.currencyCode} ${invoice.totalAmount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                        : 'N/A'}
                    </td>
                    <td className="p-3 text-center">{formatDate(invoice.generatedOn)}</td>
                    <td className="p-3 text-center">{getInvoiceDate(invoice.year, invoice.month)}</td>
                    <td className="p-3 text-center">{invoice.status}</td>
                    <td className="p-3 text-center">
                      {invoice.pdfPath ? (
                        <Button
                          variant="outline"
                          className="rounded-full border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                          onClick={() => handleViewInvoice(invoice.pdfPath)}
                        >
                          View
                        </Button>
                      ) : (
                        'N/A'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GenerateInvoicePage;