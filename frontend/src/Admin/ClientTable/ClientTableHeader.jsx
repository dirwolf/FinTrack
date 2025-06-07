import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';

const ClientTableHeader = () => (
  <TableRow className="bg-[#EDEFF2] text-[16px] border-0" style={{ borderBottom: 'none' }}>
    <TableCell className="py-3 px-1">Client Name</TableCell>
    <TableCell className="py-3 px-1"> Contact person</TableCell>
    <TableCell className="py-3 px-1">Email</TableCell>
    <TableCell className="py-3 px-1">Reg. Address</TableCell>
    <TableCell className="py-3 px-1">Billing Currency</TableCell>
    <TableCell className="py-3 px-1 text-center">Actions</TableCell>
  </TableRow>
);

export default ClientTableHeader;