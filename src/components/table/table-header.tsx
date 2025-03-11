"use client";

import React from "react";

interface TableHeaderProps {
  title: string;
  description?: string;
}

export default function TableHeaderSection({
  title,
  description,
}: TableHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="font-bold text-xl">{title}</h1>

      {description && (
        <p className="text-muted-foreground mt-2 mb-4">{description}</p>
      )}
    </div>
  );
}
