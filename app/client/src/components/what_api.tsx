import React, { Fragment } from "react";
import { Tab, TabGroup, TabList } from "@headlessui/react";
import { AppContext, Environment } from "../context/AppContext";

function WhatAPI() {
  const {
    displayingApiData,
    setDisplayingApiData,
    setCurrentEnvironment,
    currentEnvironment,
  } = React.useContext(AppContext);

  const environments = Object.keys(Environment);
  const selectedEnvironmentIndex = environments.indexOf(currentEnvironment);

  return (
    <div className="text-white gap-2 fixed bottom-0 text-center left-1/2 z-20 bg-stone-500 text-sm rounded-3xl border border-stone-500 font-semibold shadow-xl flex items-center -translate-x-2/4	-translate-y-2/4	p-2">
      <div className="flex flex-row gap-2 items-center ml-2">
        <p>API labels</p>
        <span className="bg-stone-700 rounded-full border-stone-700 border font-normal">
          <TabGroup
            onChange={() => setDisplayingApiData(!displayingApiData)}
            selectedIndex={displayingApiData ? 1 : 0}
          >
            <TabList>
              <Tab as={Fragment} key={"hide"} data-cy={`hide-tab`}>
                {({ selected }) => (
                  /* Use the `selected` state to conditionally style the selected tab. */
                  <button
                    className={` rounded-full px-4 py-1 text-xs ${selected ? "bg-white text-black" : "bg-stone-700"}`}
                  >
                    Hide
                  </button>
                )}
              </Tab>
              <Tab as={Fragment} key={"show"} data-cy={`show-tab`}>
                {({ selected }) => (
                  /* Use the `selected` state to conditionally style the selected tab. */
                  <button
                    className={` rounded-full px-4 py-1 text-xs ${selected ? "bg-white text-black" : "bg-stone-700"}`}
                  >
                    Show
                  </button>
                )}
              </Tab>
            </TabList>
          </TabGroup>
        </span>
      </div>

      <div className="flex flex-row gap-2 items-center ml-2">
        <p>Test environment</p>
        <span className="bg-stone-700 rounded-full border-stone-700 border font-normal">
          <TabGroup
            onChange={(index) => {
              setCurrentEnvironment(environments[index] as Environment);
            }}
            selectedIndex={
              selectedEnvironmentIndex > -1 ? selectedEnvironmentIndex : 0
            }
          >
            <TabList>
              {environments.map((env) => (
                <Tab as={Fragment} key={env} data-cy={`env-${env}`}>
                  {({ selected }) => (
                    /* Use the `selected` state to conditionally style the selected tab. */
                    <button
                      className={` rounded-full px-4 py-1 text-xs ${selected ? "bg-white text-black" : "bg-stone-700"}`}
                    >
                      {env}
                    </button>
                  )}
                </Tab>
              ))}
            </TabList>
          </TabGroup>
        </span>
      </div>
    </div>
  );
}

export default WhatAPI;
