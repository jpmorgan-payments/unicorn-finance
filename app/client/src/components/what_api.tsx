import React, { Fragment } from 'react';
import { Switch, Tab } from '@headlessui/react';
import { AppContext, Environment } from '../context/AppContext';

function WhatAPI() {
  const {
    displayingApiData,
    setDisplayingApiData,
    setCurrentEnvironment,
    currentEnvironment

  } = React.useContext(AppContext);

  const environments = Object.keys(Environment)
  const selectedEnvironmentIndex = environments.indexOf(currentEnvironment);
  return (
    <div className="gap-2 fixed bottom-0 text-center left-1/2 z-20 bg-yellow-100 text-xs rounded-3xl border border-yellow-300 text-yellow-700 shadow-xl flex items-center -translate-x-2/4	-translate-y-2/4	">
      <Switch.Group>
        <div className="flex items-center ml-4">
          <Switch.Label className="text-xs mr-2">
            What APIs are being used on this page?
          </Switch.Label>
          <Switch
            checked={displayingApiData}
            onChange={() => setDisplayingApiData(!displayingApiData)}
            className={`${displayingApiData ? 'bg-green-700 ' : 'bg-amber-50'
              } relative inline-flex items-center h-6 rounded-full w-11 txt-xs border-yellow-600  border`}
            data-cy="showApiData"
          >
            <span className="sr-only">Show api data</span>
            <span
              className={`${displayingApiData ? 'translate-x-6 bg-white' : 'translate-x-1 bg-yellow-600'
                } inline-block w-4 h-4 transform rounded-full`}
            />
          </Switch>
        </div>
      </Switch.Group>
      <div className='flex flex-row gap-2 items-center'>

        <p>Select the environment to test</p>
        <span className='bg-amber-50 rounded-full border-yellow-600 border font-bold'>
          <Tab.Group
            onChange={(index) => {
              setCurrentEnvironment(environments[index] as Environment)

            }} selectedIndex={selectedEnvironmentIndex > -1 ? selectedEnvironmentIndex : 0}>
            <Tab.List>
              {environments.map(env => <Tab as={Fragment} key={env} data-cy={`env-${env}`}>
                {({ selected }) => (
                  /* Use the `selected` state to conditionally style the selected tab. */
                  <button
                    className={
                      ` rounded-full px-4 py-2 ${selected ? 'bg-green-700 text-white border-green-700 border' : 'bg-amber-50 text-yellow-700'}`
                    }
                  >
                    {env}
                  </button>
                )}
              </Tab>)}
            </Tab.List>
          </Tab.Group>
        </span>
      </div>
    </div >
  );
}

export default WhatAPI;
