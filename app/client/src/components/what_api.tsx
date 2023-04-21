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
            className={`${displayingApiData ? 'bg-pink-700 ' : 'bg-pink-300'
              } relative inline-flex items-center h-6 rounded-full w-11 txt-xs border-pink-300 border`}
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
      <div className='flex flex-row gap-2 items-center'>

        <p>Select the environment to test</p>
        <span className='bg-pink-300 rounded-full border-pink-300 border'>
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
                      ` rounded-full px-4 py-2 ${selected ? 'bg-pink-700 text-white border-pink-700 border' : 'bg-pink-300 text-white'}`
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
