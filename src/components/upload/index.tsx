"use client";

import { useState } from "react";
import MetadataStep from "./metadata-step";
import FileMetadataStep from "./file-metadata-step";
import FileUploadStep from "./file-upload-step";
import { FileUpload, MetaData, TableStorageEntry } from "@/types";

interface UploadHandlerProps {
  onUpload: (data: TableStorageEntry) => Promise<void>;
  onClose: () => void;
}





export default function UploadHandler({
  onUpload,
  onClose,
}: UploadHandlerProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [metadata, setMetadata] = useState<MetaData>({
    documentno: "",
    familyname: "",
    manualtitle: "",
    productcategory: "",
    productgin: "",
    serialno: "",
    projectno: "",
    subcategory: "",
    public: true,
  });
  const [fileUploads, setFileUploads] = useState<FileUpload[]>([]);

  const handleNext = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    try {
      const tableStorageEntry: TableStorageEntry = {
        ...metadata,
        languagevariants: fileUploads.map((file) => ({
          lang: file.metadata?.lang || "",
          url: file.url || "",
          manualtype: file.metadata?.manualtype || [],
          releasedate: file.metadata?.releasedate ?? null,
        })),
        market: fileUploads[0]?.metadata?.regions || {
          EU: false,
          NA: false,
          SA: false,
          ME: false,
          AS: false,
          AU: false,
          IN: false,
        },
      };

      await onUpload(tableStorageEntry);
      onClose();
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-[500px] max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">
          {currentStep === 1
            ? "Document Metadata"
            : currentStep === 2
            ? "File Upload"
            : "File Details"}
        </h2>

        {currentStep === 1 && (
          <MetadataStep
            metadata={metadata}
            setMetadata={setMetadata}
            onNext={handleNext}
            onClose={onClose}
          />
        )}

        {currentStep === 2 && (
          <FileUploadStep
            files={fileUploads}
            setFiles={setFileUploads}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {currentStep === 3 && (
          <FileMetadataStep
            files={fileUploads}
            setFiles={setFileUploads}
            onBack={handleBack}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
}
