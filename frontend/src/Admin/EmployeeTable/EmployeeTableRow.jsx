import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { formatCurrency } from '@/utils/currency';

const EmployeeTableRow = ({
  data,
  onEdit,
  onDelete,
  fetchRoleById,
  fetchLevelById,
  fetchOrganisationById,
  clientAssignments,
  clientError,
}) => {
  const navigate = useNavigate();
  const [roleName, setRoleName] = useState('Loading...');
  const [levelName, setLevelName] = useState('Loading...');
  const [orgAbbreviation, setOrgAbbreviation] = useState('Loading...');

  useEffect(() => {
    const fetchData = async () => {
      if (data.RoleID) {
        const role = await fetchRoleById(data.RoleID);
        setRoleName(role ? role.RoleName : 'N/A');
      } else {
        setRoleName('N/A');
      }

      if (data.LevelID) {
        const level = await fetchLevelById(data.LevelID);
        setLevelName(level ? level.LevelName : 'N/A');
      } else {
        setLevelName('N/A');
      }

      if (data.OrganisationID) {
        const org = await fetchOrganisationById(data.OrganisationID);
        setOrgAbbreviation(org ? org.Abbreviation : 'N/A');
      } else {
        setOrgAbbreviation('N/A');
      }
    };

    fetchData();
  }, [data.RoleID, data.LevelID, data.OrganisationID, fetchRoleById, fetchLevelById, fetchOrganisationById]);

  const handleViewClick = () => {
    navigate(`/employee-detail/${data.id}`);
  };

  const handleDeleteClick = () => {
    if (data.Status === 'Active') {
      toast.error('Active employees cannot be deleted');
      return;
    }
    if (window.confirm('Are you sure you want to delete this employee?')) {
      onDelete(data.id);
    }
  };

  return (
    <TableRow className="hover:bg-blue-50 border-b border-[#EDEFF2]">
      <TableCell className="py-3 px-1 text-center w-[150px] whitespace-normal">{`${data.FirstName} ${data.LastName}`}</TableCell>
      <TableCell className="py-3 px-1 text-center w-[120px] whitespace-normal">{data.EmpCode || 'N/A'}</TableCell>
      <TableCell className="py-3 px-1 text-center w-[120px] whitespace-normal">{roleName}</TableCell>
      <TableCell className="py-3 px-1 text-center w-[120px] whitespace-normal">{levelName}</TableCell>
      <TableCell className="py-3 px-1 text-center w-[120px] whitespace-normal">{orgAbbreviation}</TableCell>
      <TableCell className="py-3 px-1 text-center w-[120px] whitespace-normal">
  {clientError ? (
    <span className="text-red-500">{clientError}</span> // Optional: display error for debugging
  ) : clientAssignments[data.id]?.length > 0 ? (
    clientAssignments[data.id]
      .map((assignment) => assignment.Client?.ClientName || 'N/A')
      .join(', ')
  ) : (
    'N/A' // Display "N/A" when no active assignments]
  )}
</TableCell>
      <TableCell className="py-3 px-1 text-center w-[120px] whitespace-normal">{formatCurrency(data.CTCAnnual)}</TableCell>
      <TableCell className="py-3 px-1 text-center w-[120px] whitespace-normal">{formatCurrency(data.CTCMonthly)}</TableCell>
      <TableCell className="py-3 px-1 text-center w-[100px] whitespace-normal">{data.Status || 'N/A'}</TableCell>
      <TableCell className="py-3 px-1 text-center w-[120px]">
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 cursor-pointer hover:text-blue-600 mr-2"
            title="View Employee"
            onClick={handleViewClick}
          >
            <Eye className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 cursor-pointer hover:text-teal-500 mr-2"
            title="Edit Employee"
            onClick={() => onEdit(data)}
          >
            <Edit className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 cursor-pointer hover:text-red-500"
            title="Delete Employee"
            onClick={handleDeleteClick}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default EmployeeTableRow;
