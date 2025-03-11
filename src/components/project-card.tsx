"use client";

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { TableStorageEntry } from "@/types";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ProjectCardProps {
  project: Partial<TableStorageEntry>;
  children: React.ReactNode;
  documentCount?: number;
}

export function ProjectCard({
  project,
  children,
  documentCount = 0,
}: ProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasMany = documentCount > 4;

  const releaseDate = project.languagevariants?.[0]?.releasedate || "N/A";

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl">
          {project.projectno || "Unknown Project"}
        </CardTitle>
        <CardDescription>
          {project.manualtitle || "No title available"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2">
          {project.documentno && (
            <div className="flex justify-between">
              <span className="text-sm font-medium">Document number:</span>
              <span className="text-sm">{project.documentno}</span>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold">
              Document Items: {documentCount}
            </h3>
            {hasMany && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 px-3 py-1 rounded-md bg-white border border-border text-primary hover:bg-primary/5 transition-colors text-xs font-medium"
                aria-label={isExpanded ? "Collapse all" : "Expand all"}
              >
                {isExpanded ? (
                  <>
                    <span>Collapse</span>
                    <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    <span>Expand</span>
                    <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
          <div className="space-y-2">{isExpanded && children}</div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between">
        <div className="text-sm text-muted-foreground">
          Released: {releaseDate}
        </div>
      </CardFooter>
    </Card>
  );
}
