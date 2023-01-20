import React from 'react';
import StatusTable from '../components/statusTable';
import Spinner from '../components/spinner';
import useGet from '../hooks/useGet';
import { AppContext } from '../context/AppContext';
import mockedDataUntyped from '../mockedJson/uf-service-status.json';

import { config } from '../config';
import { BankType } from '../types/serviceStatusTypes';

const mockedData: BankType[] = mockedDataUntyped as BankType[];

function ServiceStatusPage() {
  const { statusConfig } = config;
  const {
    displayingMockedData,
  } = React.useContext(AppContext);
  const {
    isError, data, error,
  } = useGet(
    statusConfig.apiDetails[0].backendPath,
    statusConfig.apiDetails[0].cacheKey,
    statusConfig.apiDetails[0].refreshInterval,
    displayingMockedData,
  );

  const displayTable = () => {
    if (displayingMockedData) {
      return (
        <StatusTable
          serviceStatusData={mockedData}
        />
      );
    }
    if (!displayingMockedData && (isError || error)) {
      return (
        <div className="pt-24 text-center" data-cy="errorMessage">
          Error gathering information from API. Toggle on mocked data below to see example information
        </div>
      );
    }
    if (data && !displayingMockedData) {
      return (
        <StatusTable
          serviceStatusData={data}
        />
      );
    }
    return (
      <div className="text-center pt-24">
        <Spinner />
      </div>
    );
  };

  return (
    <div className="relative p-8">
      <h2 className="text-2xl font-medium mb-4">Service status</h2>
      <div className="overflow-auto ">{displayTable()}</div>
    </div>
  );
}

export default ServiceStatusPage;
