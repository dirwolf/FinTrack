import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';

const EmployeeTableHeader = () => (
  <TableRow className="bg-[#EDEFF2] border-0" style={{ borderBottom: 'none' }}>
    <TableCell className="py-3 px-1 text-[16px] font-normal text-center">Name</TableCell>
    <TableCell className="py-3 px-1 text-[16px] font-normal text-center">Employee Code</TableCell>
    <TableCell className="py-3 px-1 text-[16px] font-normal text-center">Role</TableCell>
    <TableCell className="py-3 px-1 text-[16px] font-normal text-center">Level</TableCell>
    <TableCell className="py-3 px-1 text-[16px] font-normal text-center">Organisation</TableCell>
    <TableCell className="py-3 px-1 text-[16px] font-normal text-center">Projects</TableCell>
    <TableCell className="py-3 px-1 text-[16px] font-normal text-center">CTC Annual</TableCell>
    <TableCell className="py-3 px-1 text-[16px] font-normal text-center">CTC Monthly</TableCell>
    <TableCell className="py-3 px-1 text-[16px] font-normal text-center">Status</TableCell>
    <TableCell className="py-3 px-1 text-[16px] font-normal text-center">Actions</TableCell>
  </TableRow>
);

export default EmployeeTableHeader;
