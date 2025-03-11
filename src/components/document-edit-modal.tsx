'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import { FormattedTableData, Market } from '@/types';
import { invalidateDataCache } from '@/utils/fetchData';

interface DocumentEditModalProps {
  document: FormattedTableData;
  onClose: () => void;
  onUpdate: () => void;
}

export default function DocumentEditModal({
  document,
  onClose,
  onUpdate,
}: DocumentEditModalProps) {
  const [formData, setFormData] = useState<FormattedTableData>({ ...document });
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<
    'idle' | 'updating' | 'success' | 'error'
  >('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState<number | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleMarketChange = (region: keyof Market, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      market: {
        ...prev.market,
        [region]: checked,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateStatus('updating');
    setStatusMessage('Updating document...');

    try {
      if (formData.languagevariants.length === 0) {
        throw new Error('At least one language variant is required');
      }

      const response = await fetch('/api/table', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          PartitionKey: formData.PartitionKey,
          RowKey: formData.RowKey,
          documentno: formData.documentno,
          familyname: formData.familyname,
          manualtitle: formData.manualtitle,
          manualtype: Array.isArray(formData.manualtype)
            ? JSON.stringify(formData.manualtype)
            : formData.manualtype,
          productcategory: formData.productcategory,
          productgin: formData.productgin,
          projectno: formData.projectno,
          releasedate: formData.releasedate,
          serialno: formData.serialno,
          subcategory: formData.subcategory,
          public: formData.public,
          languagevariants: JSON.stringify(formData.languagevariants),
          market: JSON.stringify(formData.market),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update document');
      }

      invalidateDataCache();
      setUpdateStatus('success');
      setStatusMessage('Document updated successfully!');
      setTimeout(() => {
        onUpdate();
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error updating document:', error);
      setUpdateStatus('error');
      setStatusMessage(
        error instanceof Error
          ? error.message
          : 'Failed to update document. Please try again.'
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const confirmDeleteVariant = (index: number) => {
    setVariantToDelete(index);
    setShowDeleteConfirmation(true);
  };

  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
    setVariantToDelete(null);
  };

  const handleDeleteVariant = async () => {
    if (variantToDelete === null) return;

    const index = variantToDelete;
    setShowDeleteConfirmation(false);
    setVariantToDelete(null);

    try {
      const variant = formData.languagevariants[index];

      const url = new URL(variant.url);
      const pathParts = url.pathname.split('/');
      const blobName = pathParts[pathParts.length - 1];

      const response = await fetch(
        `/api/blob/delete?blobName=${blobName}&isPublic=${formData.public}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete file');
      }

      const newVariants = [...formData.languagevariants];
      newVariants.splice(index, 1);
      setFormData((prev) => ({
        ...prev,
        languagevariants: newVariants,
      }));

      setUpdateStatus('success');
      setStatusMessage('Language variant deleted successfully');
      setTimeout(() => {
        setUpdateStatus('idle');
        setStatusMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error deleting language variant:', error);
      setUpdateStatus('error');
      setStatusMessage('Failed to delete language variant. Please try again.');
      setTimeout(() => {
        setUpdateStatus('idle');
        setStatusMessage('');
      }, 3000);
    }
  };

  const renderLanguageVariants = () => {
    return formData.languagevariants.map((variant, index) => (
      <div key={index} className='border p-4 rounded-md mb-4'>
        <div className='flex justify-between items-center mb-2'>
          <h4 className='font-medium'>Language Variant {index + 1}</h4>
          <Button
            variant='destructive'
            size='sm'
            onClick={() => confirmDeleteVariant(index)}
            disabled={isUpdating}
            type='button'
          >
            <Trash2 className='h-4 w-4 mr-1' />
            Delete
          </Button>
        </div>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium mb-1'>Language</label>
            <input
              type='text'
              className='w-full p-2 border rounded-md'
              value={variant.lang}
              onChange={(e) => {
                const newVariants = [...formData.languagevariants];
                newVariants[index] = { ...variant, lang: e.target.value };
                setFormData((prev) => ({
                  ...prev,
                  languagevariants: newVariants,
                }));
              }}
            />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>URL</label>
            <input
              type='text'
              className='w-full p-2 border rounded-md'
              value={variant.url}
              onChange={(e) => {
                const newVariants = [...formData.languagevariants];
                newVariants[index] = { ...variant, url: e.target.value };
                setFormData((prev) => ({
                  ...prev,
                  languagevariants: newVariants,
                }));
              }}
            />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>
              Release Date
            </label>
            <input
              type='date'
              className='w-full p-2 border rounded-md'
              value={
                variant.releasedate
                  ? new Date(variant.releasedate).toISOString().split('T')[0]
                  : ''
              }
              onChange={(e) => {
                const newVariants = [...formData.languagevariants];
                newVariants[index] = {
                  ...variant,
                  releasedate: e.target.value,
                };
                setFormData((prev) => ({
                  ...prev,
                  languagevariants: newVariants,
                }));
              }}
            />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>
              Manual Types (comma separated)
            </label>
            <input
              type='text'
              className='w-full p-2 border rounded-md'
              value={
                Array.isArray(variant.manualtype)
                  ? variant.manualtype.join(', ')
                  : ''
              }
              onChange={(e) => {
                const newVariants = [...formData.languagevariants];
                newVariants[index] = {
                  ...variant,
                  manualtype: e.target.value
                    .split(',')
                    .map((type) => type.trim()),
                };
                setFormData((prev) => ({
                  ...prev,
                  languagevariants: newVariants,
                }));
              }}
            />
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg w-[900px] max-h-[80vh] flex flex-col overflow-hidden'>
        <div className='flex justify-between items-center p-6 bg-white sticky top-0 z-10 border-b'>
          <h2 className='text-2xl font-bold'>Edit Document</h2>
          <Button
            variant='ghost'
            size='sm'
            onClick={onClose}
            disabled={isUpdating}
          >
            <X className='h-4 w-4' />
          </Button>
        </div>

        <div className='p-6 overflow-y-auto'>
          <form onSubmit={handleSubmit}>
            <div className='space-y-6'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium mb-1'>
                    Document No
                  </label>
                  <input
                    type='text'
                    name='documentno'
                    className='w-full p-2 border rounded-md'
                    value={formData.documentno}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium mb-1'>
                    Manual Title
                  </label>
                  <input
                    type='text'
                    name='manualtitle'
                    className='w-full p-2 border rounded-md'
                    value={formData.manualtitle}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium mb-1'>
                    Family Name
                  </label>
                  <input
                    type='text'
                    name='familyname'
                    className='w-full p-2 border rounded-md'
                    value={formData.familyname}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium mb-1'>
                    Product Category
                  </label>
                  <input
                    type='text'
                    name='productcategory'
                    className='w-full p-2 border rounded-md'
                    value={formData.productcategory}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium mb-1'>
                    Product GIN
                  </label>
                  <input
                    type='text'
                    name='productgin'
                    className='w-full p-2 border rounded-md'
                    value={formData.productgin}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium mb-1'>
                    Serial No
                  </label>
                  <input
                    type='text'
                    name='serialno'
                    className='w-full p-2 border rounded-md'
                    value={formData.serialno}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium mb-1'>
                    Project No
                  </label>
                  <input
                    type='text'
                    name='projectno'
                    className='w-full p-2 border rounded-md'
                    value={formData.projectno}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium mb-1'>
                    Subcategory
                  </label>
                  <input
                    type='text'
                    name='subcategory'
                    className='w-full p-2 border rounded-md'
                    value={formData.subcategory}
                    onChange={handleInputChange}
                  />
                </div>
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id='public'
                    name='public'
                    className='mr-2'
                    checked={formData.public}
                    onChange={handleCheckboxChange}
                  />
                  <label htmlFor='public' className='text-sm font-medium'>
                    Public
                  </label>
                </div>
              </div>

              <div>
                <h3 className='text-lg font-medium mb-2'>Market</h3>
                <div className='grid grid-cols-4 gap-4'>
                  {Object.entries(formData.market).map(([region, value]) => (
                    <div key={region} className='flex items-center'>
                      <input
                        type='checkbox'
                        id={region}
                        className='mr-2'
                        checked={value}
                        onChange={(e) =>
                          handleMarketChange(
                            region as keyof Market,
                            e.target.checked
                          )
                        }
                      />
                      <label htmlFor={region} className='text-sm font-medium'>
                        {region}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className='text-lg font-medium mb-2'>Language Variants</h3>
                {renderLanguageVariants()}
              </div>

              <div className='flex justify-end space-x-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={onClose}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button type='submit' disabled={isUpdating}>
                  {isUpdating ? 'Updating...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </form>

          {updateStatus !== 'idle' && (
            <div className='mt-4 p-4 rounded-md text-center'>
              {updateStatus === 'updating' && <p>Updating document...</p>}
              {updateStatus === 'success' && (
                <p className='text-green-500'>{statusMessage}</p>
              )}
              {updateStatus === 'error' && (
                <p className='text-red-500'>{statusMessage}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {showDeleteConfirmation && (
        <div className='fixed inset-0 bg-black/70 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-lg w-[400px]'>
            <div className='flex items-center mb-4'>
              <AlertTriangle className='h-6 w-6 text-amber-500 mr-2' />
              <h3 className='text-xl font-bold'>Delete Language Variant?</h3>
            </div>
            <p className='mb-6'>
              Are you sure you want to delete this language variant?
            </p>
            <div className='flex justify-end gap-2'>
              <Button variant='outline' onClick={cancelDelete}>
                Cancel
              </Button>
              <Button variant='destructive' onClick={handleDeleteVariant}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
