import React from "react";
import { NavLink } from "react-router-dom";
import { Avatar, Image } from "@mantine/core";

// Images
import ufLogoLarge from "../images/uf-logo.svg";
import avatar from "../images/avatar.png";
import github from "../images/github.png";
import EnvironmentSwitcher from "./EnvironmentSwitcher";

// Navigation configuration
const links = [
  // {
  //   to: "/accounts",
  //   label: "Accounts",
  // },
  {
    to: "/payments",
    label: "Payments",
  },
  {
    to: "/validations",
    label: "Validations",
  },
];

export const Sidebar = () => {
  return (
    <div className="flex w-full flex-row items-center justify-between p-4 lg:flex-col lg:p-6">
      <NavLink to="/" className="block">
        <Image
          src={ufLogoLarge}
          alt="Unicorn Finance Logo"
          className="w-20 lg:w-16"
        />
      </NavLink>

      {/* Navigation Links */}
      <ul className="flex flex-row gap-4 lg:flex-col lg:gap-2 lg:mt-8">
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive }) =>
                `px-3 py-2 text-sm transition-colors hover:text-gray-900 lg:px-4 lg:py-3 lg:border-l-2 lg:border-transparent rounded-md ${
                  isActive
                    ? "text-gray-900 lg:border-pink-500 bg-pink-50 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`
              }
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Profile Section - Desktop Only */}
      <div className="hidden lg:block lg:mt-auto lg:mb-4  bottom-0 absolute">
        <a
          href="https://github.com/jpmorgan-payments/unicorn-finance"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 mb-4"
        >
          <span>Github</span>
          <img className="w-5 h-5" src={github} alt="Github" />
        </a>

        <div className="flex items-center gap-3">
          <Avatar src={avatar} alt="Unicorn avatar" size="md" />
          <p className="text-sm font-medium text-gray-900">Business Unicorn</p>
        </div>
      </div>
    </div>
  );
};
