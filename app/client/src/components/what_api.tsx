import React, { Fragment } from 'react';
import { Switch, Tab } from '@headlessui/react';
import { AppContext, Environment } from '../context/AppContext';

function WhatAPI() {
  const {
    displayingMockedData,
    setDisplayingMockedData,
    displayingApiData,
    setDisplayingApiData,
    setCurrentEnvironment,
    currentEnvironment

  } = React.useContext(AppContext);

  const environments = Object.keys(Environment)
  const selectedEnvironmentIndex = environments.indexOf(currentEnvironment);
  return (
    <div className="fixed bottom-0 text-center left-1/2 -ml-56 mb-2 z-20">
      <div className="bg-yellow-100 pl-4 pr-2 py-2 text-xs rounded-3xl border border-yellow-300 text-yellow-700 shadow-xl flex items-center">
        <Switch.Group>
          <div className="flex items-center ml-4">
            <Switch.Label className="text-xs mr-2">
              What APIs are being used on this page?
            </Switch.Label>
            <Switch
              checked={displayingApiData}
              onChange={() => setDisplayingApiData(!displayingApiData)}
              className={`${displayingApiData ? 'bg-green-400 ' : 'bg-gray-200'
                } relative inline-flex items-center h-6 rounded-full w-11 txt-xs`}
              data-cy="showApiData"
            >
              <span className="sr-only">Show api data</span>
              <span
                className={`${displayingApiData ? 'translate-x-6' : 'translate-x-1'
                  } inline-block w-4 h-4 transform bg-white rounded-full`}
              />
            </Switch>
          </div>
        </Switch.Group>
        <Tab.Group
          onChange={(index) => {
            setCurrentEnvironment(environments[index] as Environment)

          }} selectedIndex={selectedEnvironmentIndex > -1 ? selectedEnvironmentIndex : 0}>
          <Tab.List>
            {environments.map(env => <Tab as={Fragment} key={env}>
              {({ selected }) => (
                /* Use the `selected` state to conditionally style the selected tab. */
                <button
                  className={
                    selected ? 'bg-blue-500 text-white' : 'bg-white text-black'
                  }
                >
                  {env}
                </button>
              )}
            </Tab>)}
          </Tab.List>
        </Tab.Group>
        <Switch.Group>
          <div className="flex items-center ml-4">
            <Switch.Label className="text-xs mr-2">
              Show mocked data
            </Switch.Label>
            <Switch
              data-cy="showMockedData"
              checked={displayingMockedData}
              onChange={() => setDisplayingMockedData(!displayingMockedData)}
              className={`${displayingMockedData ? 'bg-green-400 ' : 'bg-gray-200'
                } relative inline-flex items-center h-6 rounded-full w-11 txt-xs`}
            >
              <span className="sr-only">Show mocked data</span>
              <span
                className={`${displayingMockedData ? 'translate-x-6' : 'translate-x-1'
                  } inline-block w-4 h-4 transform bg-white rounded-full`}
              />
            </Switch>
          </div>
        </Switch.Group>
      </div >
    </div >
  );
}

export default WhatAPI;
