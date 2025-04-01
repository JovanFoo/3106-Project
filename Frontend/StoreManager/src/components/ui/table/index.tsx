import { ReactNode } from "react";

// Props for Table
interface TableProps {
  children: ReactNode; // Table content (thead, tbody, etc.)
  className?: string; // Optional className for styling
}

// Props for TableHeader
interface TableHeaderProps {
  children: ReactNode; // Header row(s)
  className?: string; // Optional className for styling
}

// Props for TableBody
interface TableBodyProps {
  children: ReactNode; // Body row(s)
  className?: string; // Optional className for styling
}

// Props for TableRow
interface TableRowProps {
  children: ReactNode; // Cells (th or td)
  className?: string; // Optional className for styling
  onclick?: () => void; // Optional click handler
  isHeader?: boolean; // If true, renders as <th>, otherwise <td>
}

// Props for TableCell
interface TableCellProps {
  children: ReactNode; // Cell content
  isHeader?: boolean; // If true, renders as <th>, otherwise <td>
  className?: string; // Optional className for styling
}

// Table Component
const Table: React.FC<TableProps> = ({ children, className }) => {
  return (
    <table
      className={`w-full border-collapse border border-gray-300 ${className}`}
    >
      {children}
    </table>
  );
};

// TableHeader Component
const TableHeader: React.FC<TableHeaderProps> = ({ children, className }) => {
  return (
    <thead
      className={`bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 ${className}`}
    >
      {children}
    </thead>
  );
};

// TableBody Component
const TableBody: React.FC<TableBodyProps> = ({ children, className }) => {
  return <tbody className={className}>{children}</tbody>;
};

// TableRow Component
const TableRow: React.FC<TableRowProps> = ({
  children,
  className,
  isHeader = false,
  onclick = () => {},
}) => {
  if (isHeader) {
    return <tr className={` text-center ${className}`}>{children}</tr>;
  } else {
    return (
      <tr
        className={`text-center border cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 dark:text-slate-300 ${className}`}
        onClick={onclick}
      >
        {children}
      </tr>
    );
  }
};

// TableCell Component
const TableCell: React.FC<TableCellProps> = ({
  children,
  isHeader = false,
  className,
}) => {
  if (isHeader) {
    return (
      <th
        className={`bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 font-semibold border p-2 ${className}`}
      >
        {children}
      </th>
    );
  } else {
    return <td className={`border p-2     ${className}`}>{children}</td>;
  }
};

export { Table, TableHeader, TableBody, TableRow, TableCell };
