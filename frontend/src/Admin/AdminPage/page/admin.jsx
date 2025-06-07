import React, { useEffect, useState } from 'react';
import { useLocation, Routes, Route, Navigate } from 'react-router-dom';
import OrderHeader from '../../OrderHeader/OrderHeader';
import EmployeeMaster from '../components/EmployeeMaster';
import EmployeeCost from '../components/EmployeeCost';
import ClientMaster from '../components/ClientMaster';
import BillingSetup from '../components/BillingSetup';
import OtherSettings from '../components/OtherSettings';

// Wrap OtherSettings in a component that handles unmounting properly
const OtherSettingsWrapper = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => {
      // Force reload when unmounting OtherSettings
      if (mounted) {
        window.location.reload();
      }
    };
  }, [mounted]);

  return <OtherSettings />;
};

export const AdminPage = () => {
  const location = useLocation();
  const [currentPath, setCurrentPath] = useState(location.pathname);
  const isOtherSettings = location.pathname.includes('other-settings');

  // Update currentPath when location changes
  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location.pathname]);

  return (
    <div className="p-4">
      <OrderHeader />
      {/* Use key to force re-render when path changes */}
      <div
        className={!isOtherSettings ? 'mx-auto p-7' : ''}
        key={currentPath}
      >
        <Routes>
          <Route path="/" element={<Navigate to="employee-master" replace />} />
          <Route path="employee-master" element={<EmployeeMaster />} />
          <Route path="employee-cost" element={<EmployeeCost />} />
          <Route path="client-master" element={<ClientMaster />} />
          <Route path="billing-setup" element={<BillingSetup />} />
          <Route path="other-settings" element={<OtherSettingsWrapper />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminPage;
