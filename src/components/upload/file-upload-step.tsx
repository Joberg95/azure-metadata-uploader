'use client';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FileUpload } from '@/types';
import { useState } from 'react';
import { Upload, X } from 'lucide-react';

interface FileUploadStepProps {
  files: FileUpload[];
  setFiles: (files: FileUpload[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function FileUploadStep({
  files,
  setFiles,
  onNext,
  onBack,
}: FileUploadStepProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setIsProcessing(true);
      setProcessProgress(0);

      try {
        const newFiles = Array.from(e.target.files).map((file) => ({
          file,
          public: true,
          metadata: {
            lang: '',
            manualtype: [],
            releasedate: null,
            regions: {
              EU: false,
              NA: false,
              SA: false,
              ME: false,
              AS: false,
              AU: false,
              IN: false,
            },
          },
        }));

        const totalFiles = newFiles.length;
        let completedFiles = 0;

        for (let i = 0; i < newFiles.length; i++) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          completedFiles++;
          setProcessProgress(Math.round((completedFiles / totalFiles) * 100));
        }

        setFiles([...files, ...newFiles]);
      } catch (error) {
        console.error('File processing failed:', error);
        alert('Failed to process files. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
  };

  const validateStep = () => {
    return files.length > 0;
  };

  return (
    <div className='space-y-4'>
      <div
        className='border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors'
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <Upload className='mx-auto h-12 w-12 text-gray-400' />
        <div className='mt-4 flex justify-center text-sm leading-6 text-gray-600'>
          <label
            htmlFor='file-upload'
            className='relative cursor-pointer rounded-md font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500'
          >
            <span className='text-black'>Choose files</span>
            <input
              id='file-upload'
              name='file-upload'
              type='file'
              className='sr-only'
              multiple
              accept='.pdf,application/pdf'
              onChange={handleFileChange}
              disabled={isProcessing}
            />
          </label>
          <p className='pl-1'>or drag and drop</p>
        </div>
      </div>

      {isProcessing && (
        <div className='mt-2'>
          <Progress value={processProgress} className='mb-2' />
          <p className='text-sm text-center'>
            Processing files... {processProgress}%
          </p>
        </div>
      )}

      {files.length > 0 && (
        <div className='mt-4'>
          <h3 className='font-semibold mb-2'>Selected Files:</h3>
          <ul className='space-y-2'>
            {files.map((fileUpload, index) => (
              <li
                key={index}
                className='text-sm flex items-center justify-between'
              >
                <div>
                  {fileUpload.file.name}
                  <span className='text-xs text-gray-500 ml-2'>
                    (Ready for upload)
                  </span>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => handleRemoveFile(index)}
                  disabled={isProcessing}
                >
                  <X className='h-4 w-4' />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className='flex justify-between mt-6'>
        <Button variant='outline' onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={!validateStep() || isProcessing}>
          Next
        </Button>
      </div>
    </div>
  );
}
