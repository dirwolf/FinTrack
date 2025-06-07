import React from 'react';

const TableCell = ({ children, className = "" }) => (
  <td className={`table-cell text-center whitespace-normal break-words ${className}`}>{children}</td>
);

export default TableCell;
