import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { DatePicker, ConfigProvider } from "antd"
import axios from "axios"
import dayjs from "dayjs"
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from '../../config';

export default function ClientLedger() {
  const [clients, setClients] = useState([])
  const [selectedClient, setSelectedClient] = useState("")
  const [selectedPeriod, setSelectedPeriod] = useState("")
  const [showLedger, setShowLedger] = useState(false)
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [ledgerEntries, setLedgerEntries] = useState([])
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Custom theme for Ant Design components
  const antTheme = {
    token: {
      colorBorder: '#000000',           // Black border color
      colorPrimary: '#1677ff',          // Keep primary color as default blue
      borderRadius: 4,                  // Match your UI border radius
      colorBgContainer: '#ffffff',      // White background
      colorTextPlaceholder: 'rgba(0, 0, 0, 0.45)', // Default placeholder color
    },
    components: {
      DatePicker: {
        activeBorderColor: '#000000',   // Black border when active
        hoverBorderColor: '#000000',    // Black border on hover
      }
    }
  }

  // Fetch clients on component mount
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true)
        const response = await axios.get(API_ENDPOINTS.CLIENTS)
        setClients(response.data)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching clients:', err)
        setError('Failed to load clients')
        setLoading(false)
      }
    }

    fetchClients()
  }, [])

  // Handle start date change
  const handleStartDateChange = (date) => {
    setStartDate(date);
  }

  // Handle end date change
  const handleEndDateChange = (date) => {
    setEndDate(date);
  }

  // Modify the handleShowLedger function to add console logs
  const handleShowLedger = async () => {
    if (selectedClient && 
        (selectedPeriod !== "custom" || (startDate && endDate))) {
      try {
        setLoading(true)
        
        // Calculate date range based on selected period
        let startDateStr = ''
        let endDateStr = dayjs().format('YYYY-MM-DD') // Current date
        
        if (selectedPeriod === "custom" && startDate && endDate) {
          startDateStr = dayjs(startDate).format('YYYY-MM-DD')
          endDateStr = dayjs(endDate).format('YYYY-MM-DD')
        } else {
          switch (selectedPeriod) {
            case "1month":
              startDateStr = dayjs().subtract(1, 'month').format('YYYY-MM-DD')
              break
            case "3months":
              startDateStr = dayjs().subtract(3, 'month').format('YYYY-MM-DD')
              break
            case "6months":
              startDateStr = dayjs().subtract(6, 'month').format('YYYY-MM-DD')
              break
            case "1year":
              startDateStr = dayjs().subtract(1, 'year').format('YYYY-MM-DD')
              break
            default:
              break
          }
        }
        
        console.log("Request parameters:", {
          clientId: selectedClient,
          startDate: startDateStr,
          endDate: endDateStr
        });
        
        // Fetch ledger data from backend - using POST as required by your API
        const response = await axios.post(`${API_ENDPOINTS.LEDGER}/by-client-date-range`, {
          clientId: selectedClient,
          startDate: startDateStr,
          endDate: endDateStr
        })
        
        console.log("API Response:", response.data);
        console.log("Entries received:", response.data.entries);
        
        // Check if there are any invoice entries
        const invoiceEntries = response.data.entries.filter(entry => 
          entry.type === 'Invoice' || entry.type === 'invoice'
        );
        console.log("Invoice entries:", invoiceEntries);
        
        // Check if there are any payment entries
        const paymentEntries = response.data.entries.filter(entry => 
          entry.type === 'Payment' || entry.type === 'payment'
        );
        console.log("Payment entries:", paymentEntries);
        
        setLedgerEntries(response.data.entries)
        setBalance(response.data.balance)
        setShowLedger(true)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching ledger data:', err)
        setError('Failed to load ledger data')
        setLoading(false)
      }
    }
  }

  const isButtonDisabled = () => {
    // Button should be disabled if:
    // 1. No client is selected
    // 2. No period is selected
    // 3. If custom period is selected but date range is not complete
    
    if (!selectedClient) return true;
    if (!selectedPeriod) return true;
    if (selectedPeriod === "custom" && (!startDate || !endDate)) return true;
    return false;
  }

  const handleDownload = async () => {
    try {
      if (!selectedClient) return;
      
      let startDateStr = ''
      let endDateStr = dayjs().format('YYYY-MM-DD')
      
      if (selectedPeriod === "custom" && startDate && endDate) {
        startDateStr = dayjs(startDate).format('YYYY-MM-DD')
        endDateStr = dayjs(endDate).format('YYYY-MM-DD')
      } else {
        switch (selectedPeriod) {
          case "1month":
            startDateStr = dayjs().subtract(1, 'month').format('YYYY-MM-DD')
            break
          case "3months":
            startDateStr = dayjs().subtract(3, 'month').format('YYYY-MM-DD')
            break
          case "6months":
            startDateStr = dayjs().subtract(6, 'month').format('YYYY-MM-DD')
            break
          case "1year":
            startDateStr = dayjs().subtract(1, 'year').format('YYYY-MM-DD')
            break
          default:
            break
        }
      }
      
      // Request the PDF download
      const response = await axios.get(`${API_ENDPOINTS.LEDGER}/client/${selectedClient}/download`, {
        params: {
          startDate: startDateStr,
          endDate: endDateStr
        },
        responseType: 'blob'
      })
      
      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `client_ledger_${selectedClient}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      console.error('Error downloading ledger:', err)
      setError('Failed to download ledger')
    }
  }

  // Format date for display - with error handling
  const formatDate = (dateString) => {
    try {
      if (!dateString) return '-';
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return '-';
      }
      
      return dayjs(date).format('DD/MM/YYYY');
    } catch (err) {
      console.error('Error formatting date:', dateString, err);
      return '-';
    }
  }

  // Format number with commas
  const formatNumberWithCommas = (number) => {
    if (number == null) return '-'
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white border-0 rounded-3xl shadow-md">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl">Client Ledger</h2>

            <div className="flex items-center gap-4">
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger className="w-[180px] cursor-pointer">
                  <SelectValue placeholder="Select Client" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {clients.map(client => (
                    <SelectItem 
                      key={client.id} 
                      className="cursor-pointer" 
                      value={client.id.toString()}
                    >
                      {client.ClientName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="cursor-pointer w-[180px]">
                  <SelectValue placeholder="Select Period" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="1month" className="cursor-pointer">Last 1 month</SelectItem>
                  <SelectItem value="3months" className="cursor-pointer">Last 3 months</SelectItem>
                  <SelectItem value="6months" className="cursor-pointer">Last 6 months</SelectItem>
                  <SelectItem value="1year" className="cursor-pointer">Last 1 year</SelectItem>
                  <SelectItem value="custom" className="cursor-pointer">Custom Date Range</SelectItem>
                </SelectContent>
              </Select>

              {selectedPeriod === "custom" && (
                <div className="flex gap-2">
                  {/* Two separate DatePickers for start and end dates */}
                  <ConfigProvider theme={antTheme}>
                    <DatePicker 
                      placeholder="Start Date"
                      onChange={handleStartDateChange}
                      value={startDate ? dayjs(startDate) : null}
                      format="DD/MM/YYYY"
                      style={{ 
                        width: '160px', 
                        height: '35px',
                        borderColor: '#000000'
                      }}
                    />
                    <DatePicker 
                      placeholder="End Date"
                      onChange={handleEndDateChange}
                      value={endDate ? dayjs(endDate) : null}
                      format="DD/MM/YYYY"
                      style={{ 
                        width: '160px', 
                        height: '35px',
                        borderColor: '#000000'
                      }}
                    />
                  </ConfigProvider>
                </div>
              )}

<Button 
  className="bg-blue-500 shadow-lg hover:bg-white text-white hover:text-blue-500 border border-transparent hover:border-blue-500 rounded-full cursor-pointer transition-all duration-300" 
  disabled={isButtonDisabled() || loading}
  onClick={handleShowLedger}
>
  {loading ? "Loading..." : "Show Ledger"}
</Button>

            </div>
          </div>
          
          {error && (
            <div className="text-red-500 mt-2">{error}</div>
          )}
        </CardContent>
      </Card>

      {showLedger && (
        <Card className="bg-white border-0 rounded-3xl shadow-md">
          <CardContent className="p-0">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl ">Ledger</h3>
              <div className="flex items-center gap-2">
                <span className="font-medium">Balance: {formatNumberWithCommas(balance)}</span>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  DOWNLOAD
                </Button>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden m-4">
              <Table className="[&_thead_tr]:border-b-0 [&_thead]:border-b-0">
                <TableHeader className="bg-slate-200 !border-b-0">
                  <TableRow>
                    <TableHead className="text-center">Date</TableHead>
                    <TableHead className="text-center">Particulars</TableHead>
                    <TableHead className="text-center">Invoice Raised</TableHead>
                    <TableHead className="text-center">Payment Received</TableHead>
                    <TableHead className="text-center">Balance Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledgerEntries.length > 0 ? (
                    ledgerEntries.map((entry, index) => (
                      <TableRow key={index} className="border-b border-slate-200">
                        <TableCell className="text-center">{formatDate(entry.Date || entry.date)}</TableCell>
                        <TableCell className="text-center">{entry.type === 'Invoice' || entry.type === 'invoice' ? 'Invoice Raised' : 'Payment Received'}</TableCell>
                        <TableCell className="text-center">
                          {(entry.type === 'Invoice' || entry.type === 'invoice') 
                            ? formatNumberWithCommas(entry.InvoiceRaised || entry.amount) 
                            : '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          {(entry.type === 'Payment' || entry.type === 'payment') 
                            ? formatNumberWithCommas(Math.abs(entry.PaymentReceived || entry.amount)) 
                            : '-'}
                        </TableCell>
                        <TableCell className="text-center">{formatNumberWithCommas(entry.BalancePayment || entry.balance)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">No ledger entries found for the selected period</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
