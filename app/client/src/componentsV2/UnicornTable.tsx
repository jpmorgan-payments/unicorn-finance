import React from "react";
import { Table, TableData } from "@mantine/core";

interface UnicornTableProps {
  columns: string[];
  data: string[][];
  onRowClick?: (rowIndex: number) => void;
}

export const UnicornTable: React.FC<UnicornTableProps> = ({
  columns,
  data,
  onRowClick,
}) => {
  // Validate that data rows match column count
  const isDataValid = data.every((row) => row.length === columns.length);

  if (!isDataValid) {
    console.warn(
      "UnicornTable: Some data rows do not match the number of columns",
    );
  }

  // If we have onRowClick, we need to render a custom table
  if (onRowClick) {
    return (
      <Table.ScrollContainer minWidth={500}>
        <Table>
          <Table.Thead>
            <Table.Tr>
              {columns.map((column, index) => (
                <Table.Th key={index}>{column}</Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.map((row, rowIndex) => (
              <Table.Tr
                key={rowIndex}
                onClick={() => onRowClick(rowIndex)}
                style={{
                  cursor: "pointer",
                  transition: "background-color 0.15s ease",
                }}
                className="hover:bg-gray-50 active:bg-gray-100"
              >
                {row.map((cell, cellIndex) => (
                  <Table.Td key={cellIndex}>{cell}</Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    );
  }

  // Transform data into Mantine Table format for non-clickable tables
  const tableData: TableData = {
    head: columns,
    body: data,
  };

  return (
    <Table.ScrollContainer minWidth={500}>
      <Table data={tableData} />
    </Table.ScrollContainer>
  );
};
