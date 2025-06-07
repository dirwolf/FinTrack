import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useYear } from '../../../contexts/YearContexts';
import { formatCurrency } from '../../../utils/currency';
import { API_ENDPOINTS } from '../../../config';

const fiscalMonths = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

const BillingSetup = () => {
  const [data, setData] = useState([]);
  const [clients, setClients] = useState([]);
  const [editIndex, setEditIndex] = useState({ row: -1, column: '' });
  const [tempValue, setTempValue] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [currencyCode, setCurrencyCode] = useState('');
  const [loading, setLoading] = useState(true);

  const { selectedYear } = useYear();

  // Fetch clients when selectedYear changes
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        if (selectedYear) {
          console.log('Fetching clients for year:', selectedYear);
          
          // First ensure billing details exist
          try {
            console.log('Creating billing details for year:', selectedYear);
            await axios.post(`${API_ENDPOINTS.FINANCIAL_YEARS}/create-billing/${selectedYear}`);
            console.log('Billing details created successfully');
          } catch (error) {
            console.error('Error creating billing details:', error);
            // Continue even if this fails - we'll still try to fetch clients
          }

          // Then fetch the clients
          const response = await axios.get(`${API_ENDPOINTS.BILLING}/clients/${selectedYear}`);
          console.log('Clients response:', response.data);
          setClients(response.data);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching clients:', err);
        setLoading(false);
      }
    };
    fetchClients();
  }, [selectedYear]);

  // Fetch billing data when client or year changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (selectedClient && selectedYear) {
          const response = await axios.get(`${API_ENDPOINTS.BILLING}/data/${selectedClient}/${selectedYear}`);
          setData(response.data);
          if (response.data.length > 0) {
            setCurrencyCode(response.data[0].currencyCode);
          }
        }
      } catch (err) {
        console.error('Error fetching billing data:', err);
      }
    };
    fetchData();
  }, [selectedClient, selectedYear]);

  // const formatNumberWithCommas = (number) => {
  //   if (number == null) return '';
  //   return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  // };

  const handleDoubleClick = (row, column, value) => {
    setEditIndex({ row, column });
    setTempValue(value);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value) && value >= 0) {
      setTempValue(value);
    }
  };

  const handleBlur = async () => {
    try {
      const newData = [...data];
      newData[editIndex.row][editIndex.column] = parseFloat(tempValue);
      setData(newData);

      await axios.put(`${API_ENDPOINTS.BILLING}/data/${newData[editIndex.row].id}`, {
        month: editIndex.column,
        amount: parseFloat(tempValue),
      });

      setEditIndex({ row: -1, column: '' });
    } catch (err) {
      console.error('Error updating billing data:', err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    
    <div className="w-full mx-auto max-w-[1400px] bg-white rounded-3xl shadow-lg pt-6 pl-6 p-19">
      <div className="flex justify-between items-center w-full ">
        <h2 className="text-[24px] text-[#272727]  ">Billing Setup</h2>
        <div className="flex gap-2">
          <Select onValueChange={setSelectedClient} value={selectedClient}>
            <SelectTrigger className="cursor-pointer min-w-[180px]">
              <SelectValue placeholder="Select Client" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {clients.map((client) => (
                <SelectItem className="cursor-pointer" key={client.id} value={client.id}>
                  {client.ClientName} ({client.Abbreviation})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="min-w-[120px] flex items-center text-sm text-[#272727] bg-gray-200 border-2 border-gray-300 px-3 py-2 rounded-md opacity-70 cursor-not-allowed">
            {selectedYear ? `${selectedYear}-${parseInt(selectedYear) + 1}` : 'Select Year'}
          </div>
        </div>
      </div>

      <div className="md:w-[1020px] mt-5  2xl:w-auto">
        {selectedClient && (
          <div style={{ width: '100%', overflowX: 'auto', maxWidth: '100%' }}>

            <table className="w-full border-collapse items-center bg-white shadow-md">
              <thead >
                <tr className="bg-[#EDEFF2] text-[16px] font-normal ">
                  <th className="p-2 border-b text-[16px] font-normal border-[#EDEFF2]">Name</th>
                  <th className="p-2 border-b text-[16px] font-normal border-[#EDEFF2]">CTC/M</th>
                  {fiscalMonths.map(month => (
                    <th key={month} className="p-2 border-b text-[16px] font-normal border-[#EDEFF2]">{month}</th>

                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((item, rowIndex) => (

                  <tr key={item.id} className="text-sm text-black border-b border-[#9DA4B3] hover:bg-[#E6F2FF] transition-colors duration-200">
                    <td className="p-3  border-b border-[#EDEFF2]">{item.name}</td>
                    <td className="p-3 border-b border-[#EDEFF2]">{formatCurrency(item.ctcMonthly, 'INR')}</td>
                    {fiscalMonths.map(column => (
                      <td
                        key={`${item.id}-${column}`}
                        className="p-2 border-b border-[#EDEFF2]"


                        onDoubleClick={() => handleDoubleClick(rowIndex, column, item[column])}
                      >
                        {editIndex.row === rowIndex && editIndex.column === column ? (
                          <Input
                            value={tempValue}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            type="number"
                            min="0"
                            step="0.01"
                            className="h-8"
                            autoFocus
                          />
                        ) : (
                          formatCurrency(item[column], currencyCode)
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>

  );
};

export default BillingSetup;