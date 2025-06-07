import React, { useState, useEffect } from 'react';
import ClientTable from '@/Admin/ClientTable/ClientTable';
import ClientModal from '@/Modal/EmployeeModal/ClientModel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { API_ENDPOINTS } from '../../../config';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ClientMaster = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [query, setQuery] = useState('');

  const fetchClients = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.CLIENTS);
      if (!response.ok) throw new Error('Failed to fetch clients');
      const fetchedClients = await response.json();
      setClients(fetchedClients);
      setFilteredClients(fetchedClients);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Error fetching clients', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // New useEffect to handle search filtering on the frontend
  useEffect(() => {
    if (query.trim() === '') {
      setFilteredClients(clients); // Show all clients if query is empty
    } else {
      const lowercasedQuery = query.toLowerCase();
      // Add debug output to see client object structure
      console.log("Client objects structure:", clients[0]);
      
      const filtered = clients.filter(client => {
        // Check if client exists
        if (!client) return false;
        
        // Convert the client object to a string and search in all properties
        const clientString = JSON.stringify(client).toLowerCase();
        return clientString.includes(lowercasedQuery);
      });
      
      setFilteredClients(filtered);
    }
  }, [query, clients]);

  const handleSearch = (value) => {
    setQuery(value);
    // No API call here anymore - filtering is done in the useEffect above
  };

  const handleOpenModal = () => {
    setSelectedClient(null);
    setModalOpen(true);
  };

  const handleSubmitClient = async (newClient) => {
    try {
      if (selectedClient) {
        // Update existing client
        const response = await fetch(`${API_ENDPOINTS.CLIENTS}/${selectedClient.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newClient),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update client');
        }
        toast.success('Client updated successfully', {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        // Create new client
        const response = await fetch(API_ENDPOINTS.CLIENTS, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newClient),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create client');
        }
        toast.success('Client created successfully', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
      await fetchClients(); // Refresh client list
    } catch (error) {
      console.error('Error saving client:', error);
      if (error.message.includes('Client with the same name already exists')) {
        toast.error('Client with the same name already exists', {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        toast.error(`Error: ${error.message}`, {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    }
  };

  const handleCloseModal = (formData) => {
    setModalOpen(false);
    if (formData) {
      handleSubmitClient(formData);
    }
  };

  const handleEditClient = (client) => {
    setSelectedClient(client);
    setModalOpen(true);
  };

  const handleDeleteClient = async (clientId) => {
    try {
      // Attempt to delete the client directly
      const response = await fetch(`${API_ENDPOINTS.CLIENTS}/${clientId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        // Check if the error is due to associated resources
        if (errorData.error && errorData.error.includes('Client cannot be deleted with active employees')) {
          toast.error('Client cannot be deleted with active employee association.', {
            position: 'top-right',
            autoClose: 3000,
          });
        } else {
          throw new Error(errorData.error || 'Failed to delete client');
        }
        return;
      }
      
      toast.success('Client deleted successfully', {
        position: 'top-right',
        autoClose: 3000,
      });
      await fetchClients(); // Refresh client list
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error(`Error: ${error.message}`, {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };
  

  return (
    <div className=" ">
      <div className="max-w-[1600px] mx-auto bg-white rounded-3xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[24px] text-[#272727]">Client Master</h2>
          <div className="flex gap-4 items-center">
            <div className="max-w-[280px] rounded-full bg-white shadow-sm flex items-center px-3 border border-gray-300">
              <Search className="h-4 w-4 text-gray-500 mr-2" />
              <Input
                type="text"
                placeholder="Search by name"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-2 text-sm"
                autoComplete="off"
              />
            </div>
            <Button className="bg-[#048DFF] shadow-md cursor-pointer text-white hover:bg-white hover:text-[#048DFF] hover:border-blue-500 border-2 border-[#048DFF] rounded-3xl px-6 py-2 transition-all" onClick={handleOpenModal}>Add Client</Button>
          </div>
        </div>

        {filteredClients.length > 0 ? (
          <ClientTable
            data={filteredClients}
            onEditClient={handleEditClient}
            onDeleteClient={handleDeleteClient}
          />
        ) : (
          <p className="text-center py-4 text-gray-500">No clients found.</p>
        )}

        <ClientModal
          open={modalOpen}
          onClose={handleCloseModal}
          initialData={selectedClient}
          onSubmit={handleSubmitClient}
        />

      </div>
      <ToastContainer />
    </div>
  );
};

export default ClientMaster;