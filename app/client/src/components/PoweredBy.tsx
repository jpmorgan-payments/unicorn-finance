import React from "react";

export const PoweredBy = ({
  apiName,
  apiUrl,
}: {
  apiName: string;
  apiUrl: string;
}) => (
  <a
    href={apiUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="text-gray-500 text-xs"
  >
    Powered by{" "}
    <strong style={{ textDecoration: "underline" }}>{apiName}</strong> →
  </a>
);
