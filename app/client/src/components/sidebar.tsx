import React from "react";
import { NavLink } from "react-router-dom";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";

// Images
import ufLogoLarge from "../images/uf-logo.svg";
import avatar from "../images/avatar.png";
import github from "../images/github.png";

// Styling constants
const linkClassName =
  "border-t-2 border-transparent px-4 py-8 hover:text-gray-700 lg:border-l-2 lg:border-t-0 lg:px-8 lg:py-2";
const activeClassName = "border-pink-500 text-gray-900";

// Navigation configuration
const links = [
  {
    to: "/accounts",
    label: "Accounts",
  },
  {
    to: "/payments",
    label: "Payments",
  },
];
function Sidebar() {
  const renderMobilePopover = () => (
    <Popover className="relative lg:hidden">
      <PopoverButton className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset">
        <span className="absolute -top-1 left-10 block rounded-xl bg-red-500 p-1" />
        <img className="h-10 w-10 rounded-xl" src={avatar} alt="Avatar" />
      </PopoverButton>

      <PopoverPanel className="absolute left-1/2 z-10 mt-3 w-max max-w-sm -translate-x-3/4 transform px-4">
        <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="relative grid grid-cols-1 gap-3 bg-white p-7">
            <a
              href="https://github.com/jpmorgan-payments/unicorn-finance"
              target="_blank"
              rel="noreferrer"
              className="flex gap-1"
            >
              <img className="w-6 rounded-xl" src={github} alt="Github" />
              Github
            </a>
          </div>
          <div className="relative grid grid-cols-1 gap-2 bg-gray-50 p-4">
            <p className="w-auto font-medium">Business Unicorn</p>
          </div>
        </div>
      </PopoverPanel>
    </Popover>
  );

  const renderDesktopProfile = () => (
    <div className="hidden lg:block">
      <ul className="-ml-4 mb-4 text-xs text-gray-500">
        <a
          target="_blank"
          className="flex items-center gap-1"
          href="https://github.com/jpmorgan-payments/unicorn-finance"
          rel="noreferrer"
        >
          <li className="text-center">Github</li>
          <img className="w-6 rounded-xl" src={github} alt="Github" />
        </a>
      </ul>
      <div className="relative -ml-4 flex text-sm">
        <span className="absolute -top-1 left-10 block rounded-xl bg-red-500 p-1" />
        <img className="h-10 w-10 rounded-xl" src={avatar} alt="Avatar" />
        <div className="flex flex-col pl-4">
          <p className="w-8/12 font-medium">Business Unicorn</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex w-full border-b border-gray-200 lg:w-1/12 lg:flex-none lg:border-r">
      <nav className="flex w-full flex-row items-center justify-between px-4 py-4 lg:flex-col lg:p-8 lg:pr-0">
        <div className="flex flex-row lg:flex-col">
          <NavLink to="accounts" className="mb-0 block lg:mb-12" data-cy="logo">
            <img
              src={ufLogoLarge}
              alt="Unicorn Finance Logo"
              className="mt-2 w-4/5 lg:mt-0 lg:w-4/6"
            />
          </NavLink>

          <ul className="-my-4 ml-0 flex flex-row text-sm text-gray-500 lg:-ml-8 lg:my-0 lg:flex-col">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                data-cy={link.dataCy}
                className={({ isActive }) =>
                  isActive
                    ? `${activeClassName} ${linkClassName}`
                    : linkClassName
                }
              >
                <li>{link.label}</li>
              </NavLink>
            ))}
          </ul>
        </div>

        <div className="mb-2 lg:fixed lg:bottom-0 lg:w-auto" data-cy="popover">
          {renderMobilePopover()}
          {renderDesktopProfile()}
        </div>
      </nav>
    </div>
  );
}

export default Sidebar;
