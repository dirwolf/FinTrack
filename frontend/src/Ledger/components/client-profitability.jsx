import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Bar } from "react-chartjs-2"
import axios from "axios"
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
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

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

// Helper function to generate color palette
const generateColorPalette = (numColors) => {
  const colors = []
  for (let i = 0; i < numColors; i++) {
    const hue = (i * 360) / numColors
    const saturation = 60 + Math.random() * 20
    const lightness = 50 + Math.random() * 10
    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`)
  }
  return colors
}

export default function ClientProfitability() {
  const [clients, setClients] = useState([])
  const [financialYears, setFinancialYears] = useState([])
  const [selectedClient, setSelectedClient] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const [showReport, setShowReport] = useState(false)
  const [profitabilityData, setProfitabilityData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch clients and financial years on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch clients
        const clientsResponse = await axios.get(API_ENDPOINTS.CLIENTS)
        setClients(clientsResponse.data)
        
        // Fetch financial years
        const yearsResponse = await axios.get(API_ENDPOINTS.FINANCIAL_YEARS)
        setFinancialYears(yearsResponse.data.financialYears.map(year => year.year))
        
        // Set default selected year if available
        if (yearsResponse.data.financialYears.length > 0) {
          setSelectedYear(yearsResponse.data.financialYears[0].year)
        }
        
        setLoading(false)
      } catch (err) {
        console.error('Error fetching initial data:', err)
        setError('Failed to load initial data')
        toast.error('Failed to load initial data. Please refresh the page.')
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  // Reset report data when client or year changes
  useEffect(() => {
    // Hide the report when client or year changes
    setShowReport(false)
    setProfitabilityData(null)
  }, [selectedClient, selectedYear])

  const handleShowReport = async () => {
    if (selectedClient && selectedYear) {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch profitability report data from backend
        const response = await axios.get(`${API_ENDPOINTS.PROFITABILITY}/client-report/${selectedClient}/${selectedYear}`)
        
        setProfitabilityData(response.data)
        setShowReport(true)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching profitability report:', err)
        
        // Clear any previous data
        setProfitabilityData(null)
        setShowReport(false)
        
        // Handle specific error messages
        let errorMessage = 'Failed to load profitability report'
        
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          if (err.response.data && err.response.data.error) {
            errorMessage = err.response.data.error
            
            // Check for specific error messages
            if (errorMessage.includes('No billing data found')) {
              errorMessage = `No billing data found for ${clients.find(c => c.id.toString() === selectedClient)?.ClientName} in ${formatYear(selectedYear)}`
            }
          }
        } else if (err.request) {
          // The request was made but no response was received
          errorMessage = 'No response from server. Please check your connection.'
        }
        
        setError(errorMessage)
        toast.error(errorMessage)
        setLoading(false)
      }
    }
  }

  // Format year for display
  const formatYear = (year) => {
    const nextYear = parseInt(year) + 1
    return `${year}-${nextYear}`
  }

  // Chart options
  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => tooltipItems[0].label,
          label: (tooltipItem) => `${tooltipItem.dataset.label}: ₹${tooltipItem.raw.toLocaleString()}`,
          footer: (tooltipItems) => {
            const label = tooltipItems[0].label
            if (profitabilityData) {
              if (tooltipItems[0].datasetIndex === 0 && label !== 'Total Profit') {
                // For yearly data
                const totalProfitData = profitabilityData.yearlyData.find(entry => entry.name === 'Total Profit')
                return totalProfitData ? `Total Client Profit: ₹${totalProfitData.profit.toLocaleString()}` : ''
              } else {
                // For monthly data
                const totalProfitData = profitabilityData.monthlyData[label]?.find(entry => entry.name === 'Total Profit')
                return totalProfitData ? `Total Month Profit: ₹${totalProfitData.profit.toLocaleString()}` : ''
              }
            }
            return ''
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
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        ticks: {
          callback: (value) => `₹${value.toLocaleString()}`
        }
      },
    },
  }

  // Create datasets for monthly data - showing employee contributions per month
  const createMonthlyDatasets = () => {
    if (!profitabilityData || !profitabilityData.monthlyData) return { labels: [], datasets: [] }
    
    const months = Object.keys(profitabilityData.monthlyData)
    
    // Get unique employee names across all months (excluding "Total Profit")
    const employeeNames = new Set()
    months.forEach(month => {
      profitabilityData.monthlyData[month].forEach(entry => {
        if (entry.name !== 'Total Profit') {
          employeeNames.add(entry.name)
        }
      })
    })
    
    const uniqueEmployees = Array.from(employeeNames)
    const colors = generateColorPalette(uniqueEmployees.length)
    
    // Create a dataset for each employee
    const datasets = uniqueEmployees.map((employeeName, index) => ({
      label: employeeName,
      data: months.map(month => {
        const entry = profitabilityData.monthlyData[month].find(item => item.name === employeeName)
        return entry ? entry.profit : 0
      }),
      backgroundColor: colors[index],
    }))
    
    return {
      labels: months,
      datasets,
    }
  }

  // Create datasets for yearly data - showing top 5 employees and "Others"
  const createYearlyDatasets = () => {
    if (!profitabilityData || !profitabilityData.yearlyData) return { labels: [], datasets: [] }
    
    // Filter out the "Total Profit" entry
    const employeeData = profitabilityData.yearlyData.filter(entry => entry.name !== 'Total Profit')
    
    const labels = employeeData.map(entry => entry.name)
    const profits = employeeData.map(entry => entry.profit)
    const colors = generateColorPalette(labels.length)
    
    return {
      labels,
      datasets: [{
        label: 'Employee Yearly Profit',
        data: profits,
        backgroundColor: colors,
      }],
    }
  }

  const monthlyChartData = createMonthlyDatasets()
  const yearlyChartData = createYearlyDatasets()

  // Get client name for display
  const getClientName = () => {
    if (profitabilityData && profitabilityData.clientName) {
      return profitabilityData.clientName
    }
    
    const client = clients.find(c => c.id.toString() === selectedClient)
    return client ? client.ClientName : 'Selected Client'
  }

  return (
    <div className="space-y-6">
      {/* Add ToastContainer for notifications */}
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      <Card className="bg-white rounded-3xl border-0 shadow-md">
        <CardContent className="pt-6 pb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl ">Profitability Report</h2>

            <div className="flex items-center gap-4">
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger className="cursor-pointer w-[180px]">
                  <SelectValue placeholder="Select Client" />
                </SelectTrigger>
                <SelectContent className="bg-white" >
                  {clients.map(client => (
                    <SelectItem key={client.id} className="cursor-pointer" value={client.id.toString()}>
                      {client.ClientName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="cursor-pointer w-[180px]">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {financialYears.map(year => (
                    <SelectItem key={year} className="cursor-pointer" value={year}>
                      {formatYear(year)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
  className="bg-blue-500 shadow-lg hover:bg-white text-white hover:text-blue-500 border border-transparent hover:border-blue-500 rounded-full cursor-pointer transition-all duration-300"
  disabled={!selectedClient || !selectedYear || loading}
  onClick={handleShowReport}
>
  {loading ? "Loading..." : "Show Profitability Report"}
</Button>

            </div>
          </div>
          
          {error && (
            <div className="text-red-500 mt-4 p-3 bg-red-50 rounded-md border border-red-200">
              <p className="font-medium">Error:</p>
              <p>{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {showReport && profitabilityData && profitabilityData.monthlyData && profitabilityData.yearlyData && (
        <>
          {/* Monthly Profitability Chart - Employee contributions by month */}
          <Card className="bg-white border-0 rounded-3xl shadow-md">
            <CardContent className="pt-6">
              <h3 className="text-xl  mb-4">
                Monthly Employee Profitability for {getClientName()} - {formatYear(selectedYear)}
              </h3>
              <div className="w-full h-80">
                <Bar data={monthlyChartData} options={options} />
              </div>
            </CardContent>
          </Card>

          {/* Yearly Profitability Chart - Top 5 employees and Others */}
          <Card className="bg-white border-0 rounded-3xl shadow-md">
            <CardContent className="pt-6">
              <h3 className="text-xl  mb-4">
                Yearly Employee Profitability for {getClientName()} - {formatYear(selectedYear)}
              </h3>
              <div className="w-full h-80">
                <Bar data={yearlyChartData} options={{...options, scales: {...options.scales, x: {}}}} />
              </div>
              
              {/* Summary Card */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Profitability Summary</h4>
                <div className="grid grid-cols-4 gap-4">
                  {profitabilityData.yearlyData.map((item, index) => (
                    <div key={index} className="p-3 bg-white rounded-md shadow-sm">
                      <p className="text-sm text-gray-500">{item.name}</p>
                      <p className="text-lg font-semibold">₹{item.profit.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

