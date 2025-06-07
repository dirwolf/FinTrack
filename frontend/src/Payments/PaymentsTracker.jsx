"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { DatePicker, ConfigProvider } from "antd"
import dayjs from "dayjs"
import { API_ENDPOINTS } from "../config"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export default function PaymentTracker() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedClient, setSelectedClient] = useState(null)
  const [date, setDate] = useState(null)
  const [amount, setAmount] = useState("")
  const [remark, setRemark] = useState("")
  const [reconciliationNote, setReconciliationNote] = useState("")
  const [clientPayments, setClientPayments] = useState([])
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentError, setPaymentError] = useState(null)
  const [submitLoading, setSubmitLoading] = useState(false)
  const currentDate = new Date()

  // Fetch clients when component mounts
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true)
        const response = await axios.get(API_ENDPOINTS.CLIENTS)
        setClients(response.data)
        setError(null)
      } catch (err) {
        setError("Failed to fetch clients")
        console.error("Error fetching clients:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchClients()
  }, [])

  // Fetch payments for selected client
  useEffect(() => {
    const fetchClientPayments = async () => {
      if (!selectedClient) {
        setClientPayments([])
        return
      }

      try {
        setPaymentLoading(true)
        const response = await axios.get(`${API_ENDPOINTS.PAYMENT_TRACKER}/payment/last-three/${selectedClient}`)
        setClientPayments(response.data.payments || [])
        setPaymentError(null)
      } catch (err) {
        setPaymentError("Failed to fetch payments for this client")
        console.error("Error fetching client payments:", err)
        setClientPayments([])
      } finally {
        setPaymentLoading(false)
      }
    }

    fetchClientPayments()
  }, [selectedClient])

  // Handle date change from Ant Design DatePicker
  const handleDateChange = (date, dateString) => {
    setDate(date ? date.toDate() : null)
  }

  const handleRecordPayment = async () => {
    if (!selectedClient || !date || !amount) {
      alert("Please select a client, date, and enter an amount")
      return
    }

    try {
      setSubmitLoading(true)
      
      // Format the date to ISO string for the backend
      const formattedDate = date.toISOString()
      
      // Send payment data to backend
      await axios.post(`${API_ENDPOINTS.PAYMENT_TRACKER}/payment`, {
        ClientID: parseInt(selectedClient),
        ReceivedDate: formattedDate,
        Amount: parseFloat(amount),
        Remark: remark
      })

      // Refresh the payments list
      const response = await axios.get(`${API_ENDPOINTS.PAYMENT_TRACKER}/payment/last-three/${selectedClient}`)
      setClientPayments(response.data.payments || [])
      
      // Reset form
      setDate(null)
      setAmount("")
      setRemark("")
      
      alert("Payment recorded successfully")
    } catch (err) {
      console.error("Error recording payment:", err)
      alert(`Failed to record payment: ${err.response?.data?.error || err.message}`)
    } finally {
      setSubmitLoading(false)
    }
  }

  // Format date for display using dayjs instead of date-fns
  const formatDisplayDate = (dateString) => {
    try {
      return dayjs(dateString).format("DD/MM/YYYY")
    } catch (error) {
      return dateString
    }
  }

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
        activeShadow: '0 0 0 3px rgb(209 213 219)', // gray-300 ring with width 3
      }
    }
  }

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-3xl mb-6">Payment Tracker</h1>

      <Card className="mb-6 bg-white rounded-3xl border-0 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-normal">Track the Payment</CardTitle>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Last Updated on: {dayjs(currentDate).format("DD/MM/YYYY")}
              </span>
              {loading ? (
                <div>Loading clients...</div>
              ) : error ? (
                <div className="text-red-500">{error}</div>
              ) : (
                <Select onValueChange={setSelectedClient}>
                  <SelectTrigger className="w-[180px] cursor-pointer focus-visible:ring-gray-300 focus-visible:ring-3 focus-visible:ring-offset-0">
                    <SelectValue placeholder="Select Client" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectGroup>
                      <SelectItem value="default" disabled>Select Client</SelectItem>
                      {clients.map((client) => (
                        <SelectItem 
                          className="cursor-pointer" 
                          key={client.id} 
                          value={client.id.toString()}
                        >
                          {client.ClientName}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="mb-6 bg-white rounded-3xl border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center gap-36">
            <Label htmlFor="reconciliation" className="text-xl font-normal whitespace-nowrap">
              Reconciliation Note
            </Label>
            <Textarea
              id="reconciliation"
              placeholder="Reconciliation Note"
              value={reconciliationNote}
              onChange={(e) => setReconciliationNote(e.target.value)}
              className="min-h-[80px] focus-visible:ring-gray-300 focus-visible:ring-3 focus-visible:ring-offset-0"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6 bg-white border-0 rounded-3xl shadow-md">
  <CardContent className="p-6">
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
      <div className="space-y-2">
        <h3 className="text-xl">Record New Payment</h3>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="date">Received Date</Label>
        {/* Ant Design DatePicker with custom styling */}
        <ConfigProvider theme={antTheme}>
          <DatePicker
            id="date"
            format="DD/MM/YYYY"
            onChange={handleDateChange}
            value={date ? dayjs(date) : null}
            style={{ 
              width: '100%', 
              height: '35px',
              borderColor: '#000000' // Inline style for border color
            }}
            placeholder="Select date"
          />
        </ConfigProvider>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        
          <Input 
            id="amount" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            className="pl-7 focus-visible:ring-gray-300 focus-visible:ring-3 focus-visible:ring-offset-0"
            type="number"
            step="0.01" 
          />
        
      </div>

      <div className="space-y-2">
        <Label htmlFor="remark">Remark</Label>
        <Input 
          id="remark" 
          placeholder="Remark" 
          value={remark} 
          onChange={(e) => setRemark(e.target.value)} 
          className="focus-visible:ring-gray-300 focus-visible:ring-3 focus-visible:ring-offset-0"
        />
      </div>

      <Button 
  className="bg-blue-500 shadow-lg hover:bg-white text-white hover:text-blue-500 border border-transparent hover:border-blue-500 rounded-full h-10 cursor-pointer focus-visible:ring-gray-300 focus-visible:ring-3 focus-visible:ring-offset-0 transition-all duration-300" 
  onClick={handleRecordPayment}
  disabled={!selectedClient || !date || !amount || submitLoading}
>
  {submitLoading ? "Recording..." : "Record Payment"}
</Button>

    </div>
  </CardContent>
</Card>



{selectedClient && (
  <Card className="bg-white border-0 rounded-3xl shadow-md">
    <CardContent className="px-4">
      <div className="overflow-hidden rounded-md border border-gray-300">
        <Table className="[&_thead_tr]:border-b-0 [&_thead]:border-b-0">
          <TableHeader className="bg-slate-200 !border-b-0">
            <TableRow className="!border-b-0">
              <TableHead className="w-[200px] text-center">Date</TableHead>
              <TableHead className="w-[200px] text-center">Amount</TableHead>
              <TableHead className="text-center">Remark</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">Loading payments...</TableCell>
              </TableRow>
            ) : paymentError ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4 text-red-500">{paymentError}</TableCell>
              </TableRow>
            ) : clientPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">No payment records found for this client</TableCell>
              </TableRow>
            ) : (
              clientPayments.map((payment) => (
                <TableRow key={payment.id} className="border-t border-gray-300">
                  <TableCell className="text-center">{formatDisplayDate(payment.ReceivedDate)}</TableCell>
                  <TableCell className="text-center">{parseFloat(payment.Amount).toFixed(2)}</TableCell>
                  <TableCell className="text-center">{payment.Remark || "-"}</TableCell>
                </TableRow>
              ))
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
