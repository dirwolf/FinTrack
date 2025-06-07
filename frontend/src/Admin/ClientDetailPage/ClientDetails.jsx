import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2 } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import ResourceModal from "../../Modal/EmployeeModal/ResourceModal";
import ClientModal from "../../Modal/EmployeeModal/ClientModel";
import { formatCurrency } from "../../utils/currency";
import { ToastContainer, toast } from "react-toastify";
import { API_ENDPOINTS } from "../../config";

import "react-toastify/dist/ReactToastify.css";

const ClientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Active");
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [client, setClient] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch client and resources
  const fetchClientData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch client details
      const clientResponse = await fetch(`${API_ENDPOINTS.CLIENTS}/${id}`);
      if (!clientResponse.ok) {
        const errorData = await clientResponse.json();
        throw new Error(errorData.error || "Failed to fetch client");
      }
      const clientData = await clientResponse.json();
      console.log("Fetched client data:", clientData);
      setClient(clientData);

      // Fetch resources
      try {
        const resourcesResponse = await fetch(`${API_ENDPOINTS.CLIENT_EMPLOYEES}/client/${id}`);
        if (!resourcesResponse.ok) {
          const errorData = await resourcesResponse.json();
          console.warn("Resources fetch error:", errorData.error);
          setResources([]);
        } else {
          const resourcesData = await resourcesResponse.json();
          console.log("Resources data:", resourcesData);
          setResources(Array.isArray(resourcesData) ? resourcesData : []);
        }
      } catch (resourceError) {
        console.warn("Error fetching resources:", resourceError.message);
        setResources([]);
      }
    } catch (err) {
      console.error("Error fetching client data:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientData();
  }, [id]);

  const filteredResources = resources.filter((r) => r.Status === activeTab);

  const formatDate = (date, status) => {

    if (status === "Active") return "N/A"; // Return "N/A" for Active resources
    return date ? new Date(date).toISOString().split("T")[0] : "N/A";
  };


  // Helper function to safely get employee name
  const getEmployeeName = (employee) => {
    if (!employee) {
      console.warn("Employee data missing in resource");
      return "N/A";
    }
    if (employee.EmployeeName) return employee.EmployeeName;
    const name = `${employee.FirstName || ''} ${employee.LastName || ''}`.trim();
    return name || "N/A";
  };

  // Helper function to safely get employee code
  const getEmployeeCode = (employee) => {
    if (!employee) {
      console.warn("Employee data missing in resource");
      return "N/A";
    }
    return employee.EmpCode || "N/A";
  };

  // Helper function to format billing
  const formatBilling = (billing, currency) => {
    if (!billing) return "N/A";
    const currencyName =  currency?.CurrencyCode || "INR";
    return `${currencyName} ${parseFloat(billing).toFixed(2)}`;
  };

  const handleAddResource = () => {
    setSelectedResource(null);
    setIsResourceModalOpen(true);
  };

  const handleEditResource = (resource) => {
    console.log("Editing resource:", resource);
    setSelectedResource({ ...resource, ClientID: id });
    setIsResourceModalOpen(true);
  };

  const handleResourceSubmit = async (payload) => {
    try {
      if (payload.delete) {
        const response = await fetch(`${API_ENDPOINTS.CLIENT_EMPLOYEES}/${selectedResource.id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete resource");
        }
        setResources((prev) => prev.filter((r) => r.id !== selectedResource.id));
        toast.success("Resource deleted successfully");

      } else {
        if (selectedResource && selectedResource.id) {
          // Update existing resource
          const response = await fetch(`${API_ENDPOINTS.CLIENT_EMPLOYEES}/${selectedResource.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to update resource");
          }
          const updatedResource = await response.json();
          setResources((prev) =>
            prev.map((r) => (r.id === selectedResource.id ? updatedResource : r))
          );
          toast.success("Resource updated successfully");

        } else {
          // Create new resource
          const response = await fetch(API_ENDPOINTS.CLIENT_EMPLOYEES, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...payload, ClientID: id }),
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to create resource");
          }
          const newResource = await response.json();
          setResources((prev) => [...prev, newResource]);
          toast.success("Resource created successfully");

        }
      }

      // Refresh resources after update
      await fetchClientData();
    } catch (err) {
      console.error("Error submitting resource:", err.message);
      toast.error(`Error: ${err.message}`);
    }
    setIsResourceModalOpen(false);
    setSelectedResource(null);
  };

  const handleCloseResourceModal = () => {
    setIsResourceModalOpen(false);
    setSelectedResource(null);
  };

  const handleEditClient = () => {
    console.log("Opening client modal with data:", client);
    setIsClientModalOpen(true);
  };

  const handleClientSubmit = async (updatedClientData) => {
    try {
      console.log("Submitting client update with data:", updatedClientData);
      const response = await fetch(`${API_ENDPOINTS.CLIENTS}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedClientData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update client");
      }
      await fetchClientData();
      toast.success("Client updated successfully");

    } catch (err) {
      console.error("Error updating client:", err);
      toast.error(`Error: ${err.message}`);
    }
    setIsClientModalOpen(false);
  };

  const handleCloseClientModal = (formData) => {
    if (formData) {
      handleClientSubmit(formData);
    } else {
      setIsClientModalOpen(false);
    }
  };

  const handleDeleteResource = async (resourceId) => {
    const resource = resources.find((r) => r.id === resourceId);
    
    if (resource.Status === "Active") {
      toast.error("Cannot delete client employee with active status");
      return;
    }
    
    if (window.confirm("Are you sure you want to delete this resource?")) {
      try {
        const response = await fetch(`${API_ENDPOINTS.CLIENT_EMPLOYEES}/${resourceId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete resource");
        }
        
        setResources((prev) => prev.filter((r) => r.id !== resourceId));
        await fetchClientData();
        toast.success("Resource deleted successfully", {
          position: "top-right",
          autoClose: 3000,
        });
      } catch (err) {
        console.error("Error deleting resource:", err.message);
        toast.error(`Error: ${err.message}`, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    }
  };
  

  const handleDeleteClient = async () => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        const response = await fetch(`${API_ENDPOINTS.CLIENTS}/${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          if (errorData.error && errorData.error.includes("Client cannot be deleted with active employees")) {
            toast.error("Client cannot be deleted with active employees.");
          } else {
            throw new Error(errorData.error || "Failed to delete client");
          }
          return;
        }
        
        toast.success("Client deleted successfully", {
          position: "top-right",
          autoClose: 3000,
        });
        navigate("/admin");
      } catch (err) {
        console.error("Error deleting client:", err.message);
        toast.error(`Error: ${err.message}`, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    }
  };
  

  // if (loading) return <div className="p-4">Loading...</div>;
  if (error || !client) return <div className="p-4 text-red-500">Error: {error || "Client not found"}</div>;

  return (
    <div className="p-6 space-y-6 min-h-screen">

      {/* This is the correct placement for ToastContainer - at the root level */}
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-normal text-black">
          {`${client.ClientName} (${client.Abbreviation})`}
        </h2>
        <div className="space-x-2">
          <Button
            onClick={() => navigate("/admin/client-master")}
            className="bg-[#048DFF] cursor-pointer shadow-md text-white hover:bg-white hover:text-[#048DFF] hover:border-blue-500 border-2 border-[#048DFF] rounded-3xl px-6 py-2 transition-all">

            Back to Client Master
          </Button>
        </div>
      </div>

      {/* Client Details */}
      <div className="bg-white shadow p-6 rounded-2xl space-y-4">
        <div className="flex justify-between items-center border-b border-[#EDEFF2] pb-4">
          <h3 className="text-[24px] text-[#272727]">Client Details</h3>
          <div className="space-x-2">
            <Button
              onClick={handleEditClient}
              className="bg-[#048DFF] cursor-pointer shadow-md text-white hover:bg-white hover:text-[#048DFF] hover:border-blue-500 border-2 border-[#048DFF] rounded-3xl px-6 py-2 transition-all"

            >
              Edit
            </Button>
            <Button
              variant="destructive"
              className="bg-[#FF6E65] shadow-md cursor-pointer text-white hover:bg-white hover:text-[#FF6E65] hover:border-red-500 border-2 border-[#FF6E65] rounded-3xl px-6 py-2 transition-all"
              onClick={handleDeleteClient}
            >
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div>
            <p className="text-gray-600 text-sm">Company name</p>
            <p>{client.ClientName || "N/A"}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Abbreviation</p>
            <p>{client.Abbreviation || "N/A"}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Contact person</p>
            <p>{client.ContactPerson || "N/A"}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Email</p>
            <p>{client.Email || "N/A"}</p>
          </div>
        </div>

        <div className="border-b border-[#EDEFF2] my-2"></div>

        <div className="grid grid-cols-4 gap-4">
          <div>
            <p className="text-gray-600 text-sm">Registered address</p>
            <p>{client.RegisteredAddress || "N/A"}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Billing currency</p>
            <p>{client.BillingCurrency?.CurrencyName || "N/A"}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Payee Name</p>
            <p>{client.Organisation?.Abbreviation || "N/A"}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Bank Details</p>
            <p>{client.BankDetail?.BankName || "N/A"}</p>
          </div>
        </div>
      </div>

      {/* Resources Assigned */}
      <div className="bg-white shadow p-6 rounded-2xl space-y-4">
        <div className="flex justify-between items-center pb-4">
          <h3 className="text-[24px] text-[#272727] ">Resources Assigned</h3>
          <div className="flex gap-2">
            <Button
              onClick={() => setActiveTab("Active")}
              className={activeTab === "Active" ? "border-none cursor-pointer text-blue-500 shadow-lg" : "cursor-pointer"}
            >
              Active Resources
            </Button>
            <Button
              onClick={() => setActiveTab("Inactive")}
              className={activeTab === "Inactive" ? "border-none cursor-pointer text-blue-500 shadow-lg" : "cursor-pointer"}
            >
              Inactive Resources
            </Button>
            <Button
              onClick={handleAddResource}

              className="bg-[#048DFF] shadow-md  text-white cursor-pointer hover:bg-white hover:text-[#048DFF] hover:border-blue-500 border-2 border-[#048DFF] rounded-3xl px-6 py-2 transition-all">

              Add Resource
            </Button>
          </div>
        </div>

        <div className="my-2"></div>

        <Table>
          <TableHeader >
          <TableRow className='border-b border-[#EDEFF2]'>
              <TableHead>Name</TableHead>
              <TableHead>Emp. Code</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Billing/M</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResources.length > 0 ? (
              filteredResources.map((r) => (
                <TableRow className='border-b border-[#EDEFF2]' key={r.id}>
                  <TableCell>{getEmployeeName(r.Employee)}</TableCell>
                  <TableCell>{getEmployeeCode(r.Employee)}</TableCell>
                  <TableCell>{r.Employee?.Role?.RoleName || "N/A"}</TableCell>
                  <TableCell>{r.Employee?.Level?.LevelName || "N/A"}</TableCell>
                  <TableCell>{r.Employee?.Organisation?.Abbreviation || "N/A"}</TableCell>
                  <TableCell>{formatDate(r.StartDate)}</TableCell>
                  <TableCell>{formatDate(r.EndDate, r.Status)}</TableCell>
                  <TableCell>{formatCurrency(r.MonthlyBilling, r.Client?.BillingCurrency?.CurrencyCode)}</TableCell>
                  <TableCell className="text-blue-500">{r.Status}</TableCell>
                  <TableCell className="flex gap-2">
                    <button onClick={() => handleEditResource(r)}>
                      <Edit className="w-5 h-5 text-blue-500" />
                    </button>
                    <button onClick={() => handleDeleteResource(r.id)}>
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-4">
                  No {activeTab.toLowerCase()} resources found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ResourceModal
        open={isResourceModalOpen}
        onClose={handleCloseResourceModal}
        initialData={selectedResource}
        onSubmit={handleResourceSubmit}
      />

      {isClientModalOpen && (
        <ClientModal
          open={isClientModalOpen}
          onClose={handleCloseClientModal}
          initialData={client}
          onSubmit={handleClientSubmit}
        />
      )}
    </div>
  );
};

export default ClientDetails;