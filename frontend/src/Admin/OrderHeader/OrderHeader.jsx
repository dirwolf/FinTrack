import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation, useNavigate } from 'react-router-dom';

const OrderHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveTab = () => {
    if (location.pathname.includes('/admin/employee-master')) return 'employee-master';
    if (location.pathname.includes('/admin/employee-cost')) return 'employee-cost';
    if (location.pathname.includes('/admin/client-master')) return 'client-master';
    if (location.pathname.includes('/admin/billing-setup')) return 'billing-setup';
    if (location.pathname.includes('/admin/other-settings')) return 'other-settings';
    return 'employee-master'; // Default tab
  };

  const handleTabChange = (value) => {
    // Check if we're navigating from other-settings
    if (location.pathname.includes('/admin/other-settings') && value !== 'other-settings') {
      // Force a hard navigation
      window.location.href = `/admin/${value}`;
    } else {
      // Normal navigation for other cases
      navigate(`/admin/${value}`);
    }
  };

  // Get the current active tab
  const activeTab = getActiveTab();

  return (
    <header className="px-8 py-6 pb-0 flex items-center justify-between">
      <h1 className="text-3xl font-normal text-black">Admin</h1>
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="bg-transparent border-0 shadow-none gap-4">
          <TabsTrigger 
            value="employee-master" 
            className={`cursor-pointer text-md pb-5 bg-transparent border-0 shadow-none px-4 relative ${
              activeTab === 'employee-master' 
                ? "text-blue-500 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-500" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Employee Master
          </TabsTrigger>
          <TabsTrigger 
            value="employee-cost" 
            className={`cursor-pointer text-md pb-5 bg-transparent border-0 shadow-none px-4 relative ${
              activeTab === 'employee-cost' 
                ? "text-blue-500 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-500" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Employee Cost
          </TabsTrigger>
          <TabsTrigger 
            value="client-master" 
            className={`cursor-pointer text-md pb-5 bg-transparent border-0 shadow-none px-4 relative ${
              activeTab === 'client-master' 
                ? "text-blue-500 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-500" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Client Master
          </TabsTrigger>
          <TabsTrigger 
            value="billing-setup" 
            className={`cursor-pointer text-md pb-5 bg-transparent border-0 shadow-none px-4 relative ${
              activeTab === 'billing-setup' 
                ? "text-blue-500 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-500" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Billing Setup
          </TabsTrigger>
          <TabsTrigger 
            value="other-settings" 
            className={`cursor-pointer text-md pb-5 bg-transparent border-0 shadow-none px-4 relative ${
              activeTab === 'other-settings' 
                ? "text-blue-500 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-500" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Other Settings
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </header>
  );
};

export default OrderHeader;
