/* eslint-disable no-nested-ternary */
import React from 'react';
import { AppContext } from '../../context/AppContext';
import { config } from '../../config';
import { BankType } from '../../types/serviceStatusTypes';
import APIDetails from '../api_details';
import TableItem from './table_item';

const tableHeaders = [
  'Participant ID',
  'Partcipant Name',
  'Status',
  'Clearing System',
];

const renderErrorMessage = (message: string) => (
  <div className="pt-24 text-center" data-cy="errorMessage">
    {message}
  </div>
);

function StatusTable({ serviceStatusData } : { serviceStatusData: BankType[] }) {
  const { displayingApiData } = React.useContext(AppContext);

  const { statusConfig: { apiDetails } } = config;
  return (
    <div className="relative">
      {displayingApiData ? <APIDetails details={apiDetails[0]} absolute={false} />
        : serviceStatusData.length === 0 ? renderErrorMessage(
          'There are no upcoming outages. Want to know what this data looks like? Toggle on mocked data below.',
        ) : (
          <table className="mb-6 min-w-full border-b border-gray-200 text-xs">

            <thead className="border-b-2">
              <tr>
                {tableHeaders
                && tableHeaders.map((header) => (
                  <th
                    scope="col"
                    className="py-2 text-left font-medium uppercase text-gray-500"
                    key={`tableHeader=${header}`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {serviceStatusData.length > 0
              && serviceStatusData.map((outage : BankType) => (
                <tr key={`outage-${outage.participantId}-${outage.participantName}`}>
                  <TableItem text={outage.participantId} />
                  <TableItem text={outage.participantName} />
                  <TableItem text={outage.status} status />
                  <TableItem text={outage.clearingSystem} />
                </tr>
              ))}
            </tbody>
          </table>
        )}
    </div>
  );
}

export default StatusTable;
