"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MetaData } from "@/types";
import { productCategories } from "@/utils/constants";
import { useState, useEffect } from "react";

interface MetadataStepProps {
  metadata: MetaData;
  setMetadata: (metadata: MetaData) => void;
  onNext: () => void;
  onClose: () => void;
}

interface TableItem {
  projectno?: string;
}

export default function MetadataStep({
  metadata,
  setMetadata,
  onNext,
  onClose,
}: MetadataStepProps) {
  const [projectNumbers, setProjectNumbers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjectNumbers() {
      try {
        const response = await fetch("/api/table");
        if (!response.ok) {
          throw new Error("Failed to fetch project numbers");
        }
        const responseData = await response.json();

        const items = responseData.value || responseData;

        if (!Array.isArray(items)) {
          console.error("Data is not an array:", items);
          setProjectNumbers(["none"]);
          return;
        }

        const uniqueProjects = Array.from(
          new Set(
            items
              .map((item: TableItem) => item.projectno)
              .filter((projectno: string | undefined): projectno is string =>
                Boolean(projectno)
              )
          )
        );
        setProjectNumbers(["none", ...uniqueProjects]);
      } catch (error) {
        console.error("Error fetching project numbers:", error);
        setProjectNumbers(["none"]);
      } finally {
        setLoading(false);
      }
    }

    fetchProjectNumbers();
  }, []);

  const handleMetadataChange = (
    field: keyof MetaData,
    value: string | boolean
  ) => {
    setMetadata({ ...metadata, [field]: value });
  };

  const validateStep = () => {
    return metadata.documentno;
  };

  const handleNext = () => {
    if (validateStep()) {
      onNext();
    }
  };

  return (
    <div className="space-y-4">
      <div className="w-1/2">
        <div>
          <Label htmlFor="documentno">Document Number</Label>
          <Input
            id="documentno"
            value={metadata.documentno}
            onChange={(e) => handleMetadataChange("documentno", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="manualtitle">Manual Title</Label>
          <Input
            id="manualtitle"
            value={metadata.manualtitle}
            onChange={(e) =>
              handleMetadataChange("manualtitle", e.target.value)
            }
          />
        </div>

        <div>
          <Label htmlFor="productgin">Product GIN (article number)</Label>
          <Input
            id="productgin"
            value={metadata.productgin}
            onChange={(e) => handleMetadataChange("productgin", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="serialno">Serial Number</Label>
          <Input
            id="serialno"
            value={metadata.serialno}
            onChange={(e) => handleMetadataChange("serialno", e.target.value)}
          />
        </div>

        <div>
          <Label>Product Category</Label>
          <Select
            value={metadata.productcategory}
            onValueChange={(value) => {
              handleMetadataChange("productcategory", value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {productCategories.map((category) => (
                <SelectItem key={category.code} value={category.code}>
                  {category.display}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Project Number (Optional)</Label>
          <Select
            value={metadata.projectno || "none"}
            onValueChange={(value) =>
              handleMetadataChange("projectno", value === "none" ? "" : value)
            }
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  loading ? "Loading projects..." : "Select project number"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem key="no-project" value="none">
                No Project
              </SelectItem>
              {projectNumbers
                .filter((p) => p !== "none")
                .map((project) => (
                  <SelectItem key={project} value={project}>
                    {project}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleNext} disabled={!validateStep()}>
          Next
        </Button>
      </div>
    </div>
  );
}
