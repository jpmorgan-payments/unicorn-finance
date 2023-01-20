import React from 'react';
import { Outlet } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { AppContext } from '../context/AppContext';
import JsonDialog from './JsonDialog';
import Sidebar from './sidebar';
import WhatAPI from './whatApi';
import ErrorFallback from './errorFallback';

function Layout() {
  const {
    displayingMockedData,
    setDisplayingMockedData,
    displayingApiData,
    setDisplayingApiData,
  } = React.useContext(AppContext);

  const toggleMockedData = () => {
    setDisplayingMockedData(!displayingMockedData);
  };
  const toggleApiData = () => {
    setDisplayingApiData(!displayingApiData);
  }; return (
    <div className="flex flex-col lg:flex-row h-full text-gray-900 min-h-screen w-full max-w-screen">
      <Sidebar />
      <main className="h-auto lg:h-full lg:min-h-screen lg:w-11/12 w-full">
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
        >
          <Outlet />
          <JsonDialog />
          <WhatAPI
            toggleMockedData={toggleMockedData}
            mockedDataEnabled={displayingMockedData}
            toggleApiData={toggleApiData}
            apiDataEnabled={displayingApiData}
          />
        </ErrorBoundary>

      </main>
    </div>
  );
}

export default Layout;
