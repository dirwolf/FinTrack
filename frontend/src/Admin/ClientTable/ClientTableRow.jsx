import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ClientTableRow = ({ data, onEditClient, onDeleteClient }) => {
  const navigate = useNavigate();

  const handleViewClick = () => {
    navigate(`/client-detail/${data.id}`);
  };

  const handleEditClick = () => {
    onEditClient(data);
  };

  const handleDeleteClick = () => {
    onDeleteClient(data.id);
  };

  return (
    <TableRow className="hover:bg-blue-50 border-b border-[#EDEFF2]">
      {/* Removed the ID cell */}
      <TableCell className="py-3 px-1">{data.ClientName}</TableCell>
      <TableCell className="py-3 px-1">{data.ContactPerson}</TableCell>
      <TableCell className="py-3 px-1">{data.Email}</TableCell>
      <TableCell className="py-3 px-1">{data.RegisteredAddress}</TableCell>
      <TableCell className="py-3 px-1">{data.BillingCurrency ? data.BillingCurrency.CurrencyName : 'N/A'}</TableCell>
      <TableCell className="py-3 px-1">
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-500 cursor-pointer hover:text-blue-500 mr-2"
          title="View Client"
          onClick={handleViewClick}
        >
          <Eye className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-500 cursor-pointer hover:text-teal-500 mr-2"
          title="Edit Client"
          onClick={handleEditClick}
        >
          <Edit className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-500 cursor-pointer hover:text-red-500"
          title="Delete Client"
          onClick={handleDeleteClick}
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default ClientTableRow;
