import React from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import GenerateInvoicePage from './GenerateInvoicePage'; // Adjust the path based on your file structure

export const InvoiceGeneratorPage = () => {
  return (
    <div className="p-4">
        <CardHeader className="flex items-center justify-between px-8 py-4">
          <h1 className="text-3xl font-normal text-black">Invoice Generator</h1>
        </CardHeader>
      <GenerateInvoicePage />
    </div>
  );
};

export default InvoiceGeneratorPage;