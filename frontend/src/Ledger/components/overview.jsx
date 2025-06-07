import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useMemo } from "react"
import { Bar } from "react-chartjs-2"
import axios from "axios"
import { toast } from 'react-toastify'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { API_ENDPOINTS } from '../../config'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

// Fiscal months
const fiscalMonths = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"]

// Generate random color
const generateRandomColor = () => {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

// Generate color palette
const generateColorPalette = (numColors) => {
  const colors = []
  for (let i = 0; i < numColors; i++) {
    colors.push(generateRandomColor())
  }
  return colors
}

export default function Overview() {
  const [financialYears, setFinancialYears] = useState([])
  const [selectedYear, setSelectedYear] = useState("")
  const [displayedYear, setDisplayedYear] = useState("") // Track the year that's actually being displayed
  const [showProfitability, setShowProfitability] = useState(false)
  const [clientBalanceData, setClientBalanceData] = useState([])
  const [clientProfitabilityData, setClientProfitabilityData] = useState({})
  const [employeeProfitabilityData, setEmployeeProfitabilityData] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [colorPalette, setColorPalette] = useState([]) // Store the color palette
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [clientBalance, setClientBalance] = useState(null);

  // Format number with commas
  const formatNumberWithCommas = (number) => {
    if (number == null) return ''
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  // Format year for display
  const formatYear = (year) => {
    const nextYear = parseInt(year) + 1;
    return `${year}-${nextYear}`;
  }

  // Fetch financial years on component mount
  useEffect(() => {
    const fetchFinancialYears = async () => {
      try {
        setLoading(true)
        const response = await axios.get(API_ENDPOINTS.FINANCIAL_YEARS)
        const years = response.data.financialYears.map(year => year.year)
        setFinancialYears(years)
        
        // Set the first year as default if available
        if (years.length > 0 && !selectedYear) {
          setSelectedYear(years[0])
        }
        
        setLoading(false)
      } catch (err) {
        console.error('Error fetching financial years:', err)
        toast.error('Failed to load financial years')
        setError('Failed to load financial years')
        setLoading(false)
      }
    }

    fetchFinancialYears()
  }, [])

  // Fetch client balance data on component mount
  useEffect(() => {
    const fetchClientBalances = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_ENDPOINTS.CLIENT_BALANCE}/report`);
        setClientBalanceData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching client balances:', err);
        setError('Failed to load client balances');
        setLoading(false);
      }
    };

    fetchClientBalances();
  }, []);

  // Handle showing profitability report
  const handleShowProfitabilityReport = async () => {
    if (!selectedYear) return
    
    try {
      setLoading(true)
      
      // Fetch client profitability data
      try {
        const clientResponse = await axios.get(`${API_ENDPOINTS.PROFITABILITY}/clients-report/${selectedYear}`);
        setClientProfitabilityData(clientResponse.data);
        
        // Generate and store a new color palette when we get new data
        const numClients = Object.keys(clientResponse.data).length
        if (numClients > 0) {
          setColorPalette(generateColorPalette(numClients))
        }
      } catch (clientErr) {
        console.error('Error fetching client profitability data:', clientErr)
        const errorMessage = clientErr.response?.data?.error || 'Failed to load client profitability data'
        toast.error(errorMessage)
        setClientProfitabilityData({})
        setColorPalette([])
      }
      
      // Fetch employee profitability data
      try {
        const employeeResponse = await axios.get(`${API_ENDPOINTS.PROFITABILITY}/employee-report/${selectedYear}`);
        setEmployeeProfitabilityData(employeeResponse.data);
      } catch (employeeErr) {
        console.error('Error fetching employee profitability data:', employeeErr)
        const errorMessage = employeeErr.response?.data?.error || 'Failed to load employee profitability data'
        toast.error(errorMessage)
        setEmployeeProfitabilityData({})
      }
      
      // Update the displayed year to match the selected year
      setDisplayedYear(selectedYear)
      setShowProfitability(true)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching profitability data:', err)
      toast.error('Failed to load profitability data')
      setLoading(false)
    }
  }

  // Create client dataset for chart using the stored color palette
  const createClientDataset = () => {
    const datasets = []
    
    Object.keys(clientProfitabilityData).forEach((clientId, index) => {
      const client = clientProfitabilityData[clientId]
      datasets.push({
        label: client.clientName,
        data: fiscalMonths.map((month) => client.monthlyProfit[month] || 0),
        backgroundColor: colorPalette[index] || generateRandomColor(),
      })
    })
    
    return datasets
  }

  // Chart data - use useMemo to prevent unnecessary recalculations
  const cvtClientData = useMemo(() => {
    return {
      labels: fiscalMonths,
      datasets: Object.keys(clientProfitabilityData).length > 0 ? createClientDataset() : [],
    }
  }, [clientProfitabilityData, colorPalette]);

  // Calculate total CVT Profit
  const totalCvtProfit = useMemo(() => {
    return cvtClientData.datasets.reduce((total, dataset) => {
      return total + dataset.data.reduce((monthTotal, monthProfit) => monthTotal + monthProfit, 0)
    }, 0)
  }, [cvtClientData]);

  // Chart options
  const options = {
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => tooltipItems[0].label,
          label: (tooltipItem) => `Total Profit: ₹${formatNumberWithCommas(tooltipItem.raw.toFixed(2))}`,
          footer: (tooltipItems) => {
            const total = tooltipItems.reduce((sum, item) => sum + item.raw, 0)
            return `Total: ₹${formatNumberWithCommas(total.toFixed(2))}`
          },
        },
        displayColors: true,
        backgroundColor: '#fff',
        titleColor: '#000',
        bodyColor: '#000',
        footerColor: '#000',
        borderColor: '#ddd',
        borderWidth: 1,
        padding: 10,
        mode: 'index',
        intersect: false,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
  }

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_ENDPOINTS.CLIENTS);
        setClients(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching clients:', err);
        setError('Failed to load clients');
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const handleClientChange = async (clientId) => {
    setSelectedClient(clientId);
    if (clientId) {
      try {
        setLoading(true);
        const response = await axios.get(`${API_ENDPOINTS.LEDGER}/client-balance/${clientId}`);
        setClientBalance(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching client balance:', err);
        setError('Failed to load client balance');
        setLoading(false);
      }
    } else {
      setClientBalance(null);
    }
  };

  if (loading && !clientBalanceData.length) {
    return <div className="p-4">Loading data...</div>
  }

  // Only show the main error if it's a critical error that affects the entire page
  if (error && !clientBalanceData.length) {
    return <div className="p-4 text-red-500">Error: {error}</div>
  }

  return (
    <div className="space-y-6">
      {/* Client Balance Report Section */}
      <Card className="bg-white border-0 shadow-md  rounded-3xl">
        <CardContent>
          <h2 className="text-xl  mb-4">Client Balance Report</h2>

          <div className="border border-slate-200 rounded-lg">
            <Table className="[&_thead_tr]:border-b-0 [&_thead]:border-b-0">
              <TableHeader className="bg-slate-200 !border-b-0">
                <TableRow>
                  <TableHead className="w-1/4 text-center">Client</TableHead>
                  <TableHead className="w-1/4 text-center">Total Bill</TableHead>
                  <TableHead className="w-1/4 text-center">Paid Amount</TableHead>
                  <TableHead className="w-1/4 text-center">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientBalanceData.length > 0 ? (
                  clientBalanceData.map((item, index) => (
                    <TableRow key={index} className="border-b border-slate-200">
                      <TableCell className="text-center">{item.clientName}</TableCell>
                      <TableCell className="text-center">{formatNumberWithCommas(item.totalBill)}</TableCell>
                      <TableCell className="text-center">{formatNumberWithCommas(item.totalPaid)}</TableCell>
                      <TableCell className="text-center">{formatNumberWithCommas(item.balance)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">No data available</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Employee & CVT Profitability Report Section */}
      <Card className="bg-white border-0 shadow-md rounded-3xl">
        <CardContent className="pt-6 pb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl ">Employee & CVT Profitability Report</h2>

            <div className="flex items-center gap-4">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[180px] cursor-pointer">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent className="bg-white cursor-pointer">
                  {financialYears.map((year) => (
                    <SelectItem key={year} className="cursor-pointer" value={year}>
                      {formatYear(year)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
  className="bg-blue-500 hover:bg-white text-white shadow-lg hover:text-blue-500 border border-transparent hover:border-blue-500 rounded-full cursor-pointer transition-all duration-300"
  onClick={handleShowProfitabilityReport}
  disabled={!selectedYear || loading}
>
  {loading ? "Loading..." : "Show Profitability Report"}
</Button>

            </div>
          </div>
        </CardContent>
      </Card>

     

      {/* CVT Profitability Report Chart */}
      {showProfitability && Object.keys(clientProfitabilityData).length > 0 && (
        <Card className="bg-white border-0 max-w-screen shadow-md rounded-3xl">
          <CardContent className="pt-6 pb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl ">CVT Profitability Report</h2>
              <div className="text-lg font-medium">
                Total: ₹{formatNumberWithCommas(totalCvtProfit.toFixed(2))}
              </div>
            </div>
            <div style={{ width: '100%', height: '300px', position: 'relative' }}>
              <Bar 
                data={cvtClientData} 
                options={options}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Employee Profitability Table */}
      {showProfitability && Object.keys(employeeProfitabilityData).length > 0 && (
        <div className="bg-white border-0 md:w-6xl 2xl:w-auto shadow-md rounded-3xl p-6">
          <h2 className="text-xl  mb-4">Employee Profitability Report</h2>
          
          <div style={{ width: '100%', overflowX: 'auto', maxWidth: '100%' }}>
            <Table className="[&_thead_tr]:border-b-0 [&_thead]:border-b-0" style={{ width: 'auto' }}>
              <TableHeader className="bg-slate-200 !border-b-0">
                <TableRow>
                  <TableHead className="text-center whitespace-nowrap">#</TableHead>
                  <TableHead className="text-center whitespace-nowrap">Name</TableHead>
                  <TableHead className="text-center whitespace-nowrap">Projects</TableHead>
                  {fiscalMonths.map((month) => (
                    <TableHead key={month} className="text-center whitespace-nowrap">{month}</TableHead>
                  ))}
                  <TableHead className="text-center whitespace-nowrap">Average Monthly Profit</TableHead>
                  <TableHead className="text-center whitespace-nowrap">Yearly Profit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.keys(employeeProfitabilityData).map((employeeId, index) => {
                  const employee = employeeProfitabilityData[employeeId];
                  const monthlyProfits = Object.values(employee.monthlyProfit);
                  const averageProfit = monthlyProfits.reduce((sum, profit) => sum + profit, 0) / 12;
                  const yearlyProfit = monthlyProfits.reduce((sum, profit) => sum + profit, 0);
                  
                  return (
                    <TableRow key={employeeId} className="border-b border-slate-200">
                      <TableCell className="text-center whitespace-nowrap">{index + 1}</TableCell>
                      <TableCell className="text-center whitespace-nowrap">{employee.name}</TableCell>
                      <TableCell className="text-center whitespace-nowrap">{employee.clients.join(', ')}</TableCell>
                      {fiscalMonths.map((month) => (
                        <TableCell key={month} className="text-center whitespace-nowrap">
                          ₹{formatNumberWithCommas((employee.monthlyProfit[month] || 0).toFixed(2))}
                        </TableCell>
                      ))}
                      <TableCell className="text-center whitespace-nowrap">₹{formatNumberWithCommas(averageProfit.toFixed(2))}</TableCell>
                      <TableCell className="text-center whitespace-nowrap">₹{formatNumberWithCommas(yearlyProfit.toFixed(2))}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Show message when profitability data is requested but not available */}
      {showProfitability && 
       Object.keys(clientProfitabilityData).length === 0 && 
       Object.keys(employeeProfitabilityData).length === 0 && (
        <Card className="bg-white border-0 shadow-md rounded-3xl">
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              <p>No profitability data available for the selected year: {formatYear(displayedYear)}.</p>
              <p>Please try selecting a different year or contact support if you believe this is an error.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
