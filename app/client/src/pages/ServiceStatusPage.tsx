import React from 'react';
import StatusTable from '../components/statusTable';
import Spinner from '../components/spinner';
import useServiceStatusGet from '../hooks/useServiceStatusGet';
import { AppContext, Environment } from '../context/AppContext';
import mockedDataUntyped from '../mockedJson/uf-service-status.json';

import { config } from '../config';
import { BankType } from '../types/serviceStatusTypes';

const mockedData: BankType[] = mockedDataUntyped as BankType[];

function ServiceStatusPage() {
  const { statusConfig } = config;
  const { currentEnvironment } = React.useContext(AppContext);


  const { isError, data, error } = useServiceStatusGet(
    statusConfig.apiDetails[0],
    statusConfig.apiDetails[0].cacheKey,
    statusConfig.apiDetails[0].refreshInterval,
    currentEnvironment,
  );

  const displayTable = () => {
    if (currentEnvironment === Environment.MOCKED) {
      return (
        <StatusTable
          serviceStatusData={mockedData}
        />
      );
    } else {
      if (isError || error) {
        return (
          <div className="pt-24 text-center" data-cy="errorMessage">
            Error gathering information from API. Toggle on mocked data below to see example information
          </div>
        );
      }
      if (data) {
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
    }
  }

  return (
    <div className="relative p-8">
      <h2 className="text-2xl font-medium mb-4">Service status</h2>
      <div className="overflow-auto ">{displayTable()}</div>
    </div>
  );
}

export default ServiceStatusPage;
