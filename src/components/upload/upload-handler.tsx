'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import MetadataStep from '@/components/upload/metadata-step';
import FileUploadStep from '@/components/upload/file-upload-step';
import FileMetadataStep from '@/components/upload/file-metadata-step';
import { Progress } from '@/components/ui/progress';
import { FileUpload, MetaData, TableStorageEntry } from '@/types';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { uploadToBlob, deleteFromBlob } from '@/utils/storageService';

interface UploadHandlerProps {
  onUpload: (
    data: TableStorageEntry
  ) => Promise<{ success: boolean; message: string }>;
  onClose: () => void;
}

export default function UploadHandler({
  onUpload,
  onClose,
}: UploadHandlerProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [metadata, setMetadata] = useState<MetaData>({
    documentno: '',
    familyname: '',
    manualtitle: '',
    productcategory: '',
    productgin: '',
    serialno: '',
    projectno: '',
    subcategory: '',
    public: true,
  });
  const [fileUploads, setFileUploads] = useState<FileUpload[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<
    'idle' | 'uploading' | 'success' | 'error'
  >('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

  const handleNext = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleClose = async () => {
    if (isUploading) {
      setShowCloseConfirmation(true);
      return;
    }

    onClose();
  };

  const handleConfirmClose = () => {
    setShowCloseConfirmation(false);
    setIsUploading(false);
    onClose();
  };

  const handleSubmit = async () => {
    setIsUploading(true);
    setUploadStatus('uploading');
    setUploadProgress(0);
    setStatusMessage('Uploading documents...');
    setCurrentStep(4);

    try {
      const totalFiles = fileUploads.length;
      const uploadedFiles: FileUpload[] = [];
      let completedFiles = 0;

      for (const fileUpload of fileUploads) {
        try {
          const blobResponse = await uploadToBlob(
            fileUpload.file,
            fileUpload.public !== false
          );

          if (blobResponse.success) {
            uploadedFiles.push({
              ...fileUpload,
              url: blobResponse.url,
            });
          } else {
            throw new Error(
              `Failed to upload ${fileUpload.file.name}: ${blobResponse.error}`
            );
          }
        } catch (error) {
          console.error('File upload failed:', error);
          throw error;
        }

        completedFiles++;
        setUploadProgress(Math.round((completedFiles / totalFiles) * 80));
      }

      const tableStorageEntry: TableStorageEntry = {
        ...metadata,
        languagevariants: uploadedFiles.map((file) => ({
          lang: file.metadata?.lang || '',
          url: file.url || '',
          manualtype: file.metadata?.manualtype || [],
          releasedate: file.metadata?.releasedate || null,
        })),
        market: uploadedFiles[0]?.metadata?.regions || {
          EU: false,
          NA: false,
          SA: false,
          ME: false,
          AS: false,
          AU: false,
          IN: false,
        },
      };

      setUploadProgress(90);

      const result = await onUpload(tableStorageEntry);

      setUploadProgress(100);

      if (result.success) {
        setUploadStatus('success');
        setStatusMessage(result.message);
      } else {
        setUploadStatus('error');
        setStatusMessage(result.message);

        try {
          await Promise.all(
            uploadedFiles.map(async (file) => {
              if (file.url) {
                try {
                  const url = new URL(file.url);
                  const pathParts = url.pathname.split('/');
                  if (pathParts.length >= 1) {
                    const blobPath = pathParts[pathParts.length - 1];
                    if (blobPath) {
                      return deleteFromBlob(blobPath, file.public !== false);
                    }
                  }
                } catch (error) {
                  console.error('Failed to parse file URL:', error);
                }
              }
              return Promise.resolve();
            })
          );
        } catch (cleanupError) {
          console.error('Failed to clean up uploaded files:', cleanupError);
        }
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('error');
      setStatusMessage('Upload failed. Please try again.');
      setUploadProgress(100);
    } finally {
      setIsUploading(false);
    }
  };

  const renderUploadStatus = () => {
    return (
      <div className='py-6'>
        <div className='mb-6'>
          <Progress
            value={uploadProgress}
            className={`h-4 ${
              uploadStatus === 'error'
                ? 'bg-red-100 [&>div]:bg-red-500'
                : uploadStatus === 'success'
                ? 'bg-green-100 [&>div]:bg-green-500'
                : ''
            }`}
          />
        </div>

        <div className='flex items-center justify-center gap-2 mb-6'>
          {uploadStatus === 'success' && (
            <CheckCircle className='h-6 w-6 text-green-500' />
          )}
          {uploadStatus === 'error' && (
            <AlertCircle className='h-6 w-6 text-red-500' />
          )}
          <p
            className={`text-lg ${
              uploadStatus === 'error'
                ? 'text-red-500'
                : uploadStatus === 'success'
                ? 'text-green-500'
                : ''
            }`}
          >
            {statusMessage}{' '}
            {uploadStatus === 'uploading' && `(${uploadProgress}%)`}
          </p>
        </div>
        <div className='flex justify-center gap-2'>
          {uploadStatus === 'success' ? (
            <Button
              onClick={onClose}
              className='bg-green-500 hover:bg-green-600'
            >
              Done
            </Button>
          ) : uploadStatus === 'error' ? (
            <Button onClick={handleClose} variant='outline'>
              Close
            </Button>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
      <div className='bg-white p-6 rounded-lg w-[900px] max-h-[80vh] overflow-y-auto'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-2xl font-bold'>
            {currentStep === 1
              ? 'Document Metadata'
              : currentStep === 2
              ? 'Upload Files'
              : currentStep === 3
              ? 'File Details'
              : 'Upload Status'}
          </h2>
          <Button
            variant='ghost'
            size='sm'
            onClick={handleClose}
            disabled={isUploading}
          >
            <X className='h-4 w-4' />
          </Button>
        </div>

        <div className='mb-6'>
          <div className='flex justify-between mb-2'>
            {[
              'Document Metadata',
              'Add Files',
              'File Details',
              'Upload Status',
            ].map((step, index) => (
              <div
                key={index}
                className={`flex-1 text-center ${
                  currentStep === index + 1 ? 'font-bold' : 'text-gray-400'
                }`}
              >
                {step}
              </div>
            ))}
          </div>
          <Progress value={(currentStep / 4) * 100} className='h-2' />
        </div>

        {currentStep === 1 && (
          <MetadataStep
            metadata={metadata}
            setMetadata={setMetadata}
            onNext={handleNext}
            onClose={handleClose}
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

        {currentStep === 4 && renderUploadStatus()}

        {showCloseConfirmation && (
          <div className='fixed inset-0 bg-black/70 flex items-center justify-center z-50'>
            <div className='bg-white p-6 rounded-lg w-[400px]'>
              <h3 className='text-xl font-bold mb-4'>Cancel Upload?</h3>
              <p className='mb-6'>
                Are you sure you want to cancel the upload? All progress will be
                lost.
              </p>
              <div className='flex justify-end gap-2'>
                <Button
                  variant='outline'
                  onClick={() => setShowCloseConfirmation(false)}
                >
                  Continue Upload
                </Button>
                <Button variant='destructive' onClick={handleConfirmClose}>
                  Cancel Upload
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
