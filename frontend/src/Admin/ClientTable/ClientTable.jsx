import React from 'react';
import { Table, TableBody, TableHeader } from '@/components/ui/table';
import Tableheader from './ClientTableHeader';
import ClientTableRow from './ClientTableRow';

const ClientTable = ({ data, onEditClient, onDeleteClient }) => (
  <div className="p-1">
    <Table className="w-full mt-5">
      <TableHeader>
        <Tableheader />
      </TableHeader>
      <TableBody>
        {data.map((row, index) => (
          <ClientTableRow key={index} data={row} onEditClient={onEditClient} onDeleteClient={onDeleteClient} />
        ))}
      </TableBody>
    </Table>
  </div>
);

export default ClientTable;