import React from 'react';
import { Table, TableHeader, TableBody } from '@/components/ui/table';
import EmployeeTableHeader from './EmployeeTableHeader';
import EmployeeTableRow from './EmployeeTableRow';

const EmployeeTable = ({
  data,
  onEdit,
  onDelete,
  roles,
  levels,
  organisations,
  fetchRoleById,
  fetchLevelById,
  fetchOrganisationById,
  clientAssignments,
  clientErrors,
}) => {
  return (
    <Table className="w-full">
      <TableHeader>
        <EmployeeTableHeader />
      </TableHeader>
      <TableBody>
        {data.map((employee) => (
          <EmployeeTableRow
            key={employee.id}
            data={employee}
            onEdit={onEdit}
            onDelete={onDelete}
            fetchRoleById={fetchRoleById}
            fetchLevelById={fetchLevelById}
            fetchOrganisationById={fetchOrganisationById}
            clientAssignments={clientAssignments}
            clientError={clientErrors[employee.id]} // Pass specific error for this employee
          />
        ))}
      </TableBody>
    </Table>
  );
};

export default EmployeeTable;