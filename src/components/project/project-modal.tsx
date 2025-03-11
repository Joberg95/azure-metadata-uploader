'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import TableSearch from '@/components/table/table-search';
import { fetchData } from '@/utils/fetchData';
import { formatTableData } from '@/utils/formatTableData';
import { FormattedTableData } from '@/types';

interface ProjectCreationModalProps {
  onClose: () => void;
  onProjectCreated: () => void;
}

export default function ProjectCreationModal({
  onClose,
  onProjectCreated,
}: ProjectCreationModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [projectData, setProjectData] = useState({
    projectno: '',
    documents: [] as FormattedTableData[],
  });
  const [searchResults, setSearchResults] = useState<FormattedTableData[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<
    'idle' | 'updating' | 'success' | 'error'
  >('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleNext = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const data = await fetchData();
      const formattedData = formatTableData(data);
      const filtered = formattedData.filter((item) =>
        item.documentno.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(filtered);
    } catch (error) {
      console.error('Error searching documents:', error);
    }
  };

  const handleAddDocument = (document: FormattedTableData) => {
    if (
      !projectData.documents.some(
        (doc) => doc.documentno === document.documentno
      )
    ) {
      setProjectData((prev) => ({
        ...prev,
        documents: [...prev.documents, document],
      }));
    }
  };

  const handleRemoveDocument = (documentNo: string) => {
    setProjectData((prev) => ({
      ...prev,
      documents: prev.documents.filter((doc) => doc.documentno !== documentNo),
    }));
  };

  const handleSubmit = async () => {
    setIsUpdating(true);
    setUpdateStatus('updating');
    setStatusMessage('Updating documents with project number...');

    try {
      const updatePromises = projectData.documents.map(async (doc) => {
        const response = await fetch('/api/table', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            PartitionKey: doc.PartitionKey,
            RowKey: doc.RowKey,
            projectno: projectData.projectno,
            documentno: doc.documentno,
            manualtitle: doc.manualtitle,
            manualtype: JSON.stringify(doc.manualtype),
            productcategory: doc.productcategory,
            productgin: doc.productgin,
            serialno: doc.serialno,
            releasedate: doc.releasedate,
            languagevariants: JSON.stringify(doc.languagevariants),
            market: JSON.stringify(doc.market),
            public: doc.public,
            familyname: doc.familyname,
            subcategory: doc.subcategory,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(
            error.error || `Failed to update document ${doc.documentno}`
          );
        }
      });

      await Promise.all(updatePromises);
      setUpdateStatus('success');
      setStatusMessage('Project created successfully!');
      onProjectCreated();
      onClose();
    } catch (error) {
      console.error('Error updating documents:', error);
      setUpdateStatus('error');
      setStatusMessage('Failed to create project. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const renderUploadStatus = () => {
    return (
      <div className='text-center py-8'>
        {updateStatus === 'success' ? (
          <CheckCircle className='mx-auto h-12 w-12 text-green-500 mb-4' />
        ) : updateStatus === 'error' ? (
          <AlertCircle className='mx-auto h-12 w-12 text-red-500 mb-4' />
        ) : (
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4' />
        )}
        <p className='text-lg font-medium'>{statusMessage}</p>
      </div>
    );
  };

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
      <div className='bg-white p-6 rounded-lg w-[900px] max-h-[80vh] overflow-y-auto'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-2xl font-bold'>
            {currentStep === 1
              ? 'Project Details'
              : currentStep === 2
              ? 'Add Documents'
              : 'Create Project'}
          </h2>
          <Button
            variant='ghost'
            size='sm'
            onClick={onClose}
            disabled={isUpdating}
          >
            <X className='h-4 w-4' />
          </Button>
        </div>

        <div className='mb-6'>
          <div className='flex justify-between mb-2'>
            {['Project Details', 'Add Documents', 'Create Project'].map(
              (step, index) => (
                <div
                  key={index}
                  className={`flex-1 text-center ${
                    currentStep === index + 1 ? 'font-bold' : 'text-gray-400'
                  }`}
                >
                  {step}
                </div>
              )
            )}
          </div>
          <Progress value={(currentStep / 3) * 100} className='h-2' />
        </div>

        {currentStep === 1 && (
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium mb-1'>
                Project Number
              </label>
              <input
                type='text'
                className='w-full p-2 border rounded-md'
                value={projectData.projectno}
                onChange={(e) =>
                  setProjectData((prev) => ({
                    ...prev,
                    projectno: e.target.value,
                  }))
                }
                placeholder='Enter project number'
              />
            </div>
            <div className='flex justify-end'>
              <Button
                onClick={handleNext}
                disabled={!projectData.projectno.trim()}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className='space-y-4'>
            <TableSearch onSearch={handleSearch} />
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <h3 className='font-medium mb-2'>Search Results</h3>
                <div className='space-y-2 max-h-[400px] overflow-y-auto'>
                  {searchResults.map((doc) => (
                    <div
                      key={doc.documentno}
                      className='p-2 border rounded-md flex justify-between items-center'
                    >
                      <div>
                        <div className='font-medium'>{doc.documentno}</div>
                        <div className='text-sm text-gray-500'>
                          {doc.manualtitle}
                        </div>
                      </div>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleAddDocument(doc)}
                        disabled={projectData.documents.some(
                          (d) => d.documentno === doc.documentno
                        )}
                      >
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className='font-medium mb-2'>Selected Documents</h3>
                <div className='space-y-2 max-h-[400px] overflow-y-auto'>
                  {projectData.documents.map((doc) => (
                    <div
                      key={doc.documentno}
                      className='p-2 border rounded-md flex justify-between items-center'
                    >
                      <div>
                        <div className='font-medium'>{doc.documentno}</div>
                        <div className='text-sm text-gray-500'>
                          {doc.manualtitle}
                        </div>
                      </div>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleRemoveDocument(doc.documentno)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className='flex justify-between'>
              <Button variant='outline' onClick={handleBack}>
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={projectData.documents.length === 0}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className='space-y-4'>
            <div className='space-y-2'>
              <h3 className='font-medium'>Project Summary</h3>
              <div className='p-4 border rounded-md'>
                <div className='mb-2'>
                  <span className='font-medium'>Project Number:</span>{' '}
                  {projectData.projectno}
                </div>
                <div>
                  <span className='font-medium'>Documents:</span>
                  <ul className='list-disc list-inside mt-2'>
                    {projectData.documents.map((doc) => (
                      <li key={doc.documentno}>
                        {doc.documentno} - {doc.manualtitle}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className='flex justify-between'>
              <Button variant='outline' onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={isUpdating}>
                Create Project
              </Button>
            </div>
          </div>
        )}

        {isUpdating && renderUploadStatus()}
      </div>
    </div>
  );
}
