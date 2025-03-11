'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { manualTypes, manualLanguages, marketRegions } from '@/utils/constants';
import { FileUpload } from '@/types';
import { Market } from '@/types';

interface FileMetadataStepProps {
  files: FileUpload[];
  setFiles: (files: FileUpload[]) => void;
  onBack: () => void;
  onSubmit: () => void;
}

export default function FileMetadataStep({
  files,
  setFiles,
  onBack,
  onSubmit,
}: FileMetadataStepProps) {
  const regions = marketRegions;

  const updateFileMetadata = (
    index: number,
    field: string,
    value: string | string[] | Market | null
  ) => {
    const updatedFiles = [...files];
    if (!updatedFiles[index].metadata) {
      updatedFiles[index].metadata = {
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
      };
    }

    if (field === 'regions') {
      updatedFiles[index].metadata = {
        ...updatedFiles[index].metadata,
        regions: value as Market,
      };
    } else {
      updatedFiles[index].metadata = {
        ...updatedFiles[index].metadata,
        [field]: value,
      };
    }

    setFiles(updatedFiles);
  };

  const handlePublicChange = (index: number, isPublic: boolean) => {
    const updatedFiles = [...files];
    updatedFiles[index] = {
      ...updatedFiles[index],
      public: isPublic,
    };
    setFiles(updatedFiles);
  };

  const validateMetadata = () => {
    return files.every(
      (file) =>
        file.metadata?.lang &&
        file.metadata.manualtype.length > 0 &&
        file.metadata.releasedate
    );
  };

  const handleSubmit = () => {
    if (validateMetadata()) {
      onSubmit();
    }
  };

  return (
    <div className='space-y-4'>
      {files.map((file, index) => (
        <div key={index} className='border p-4 rounded-md'>
          <div className='flex justify-between items-center mb-4'>
            <h3 className='font-semibold'>{file.file.name}</h3>
            <div className='flex items-center space-x-2'>
              <Label htmlFor={`public-${index}`}>Public</Label>
              <Checkbox
                id={`public-${index}`}
                checked={file.public !== undefined ? file.public : true}
                onCheckedChange={(checked) => {
                  handlePublicChange(index, checked === true);
                }}
              />
            </div>
          </div>

          <div className='py-2 w-1/2'>
            <Label>Document Type</Label>
            <Select
              value={file.metadata?.manualtype?.[0]}
              onValueChange={(value) =>
                updateFileMetadata(index, 'manualtype', [value])
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='Select type' />
              </SelectTrigger>
              <SelectContent>
                {manualTypes.map((type) => (
                  <SelectItem key={type.code} value={type.code}>
                    {type.display}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='py-2 w-1/2'>
            <Label>Release Date</Label>
            <Input
              type='date'
              value={file.metadata?.releasedate || ''}
              onChange={(e) =>
                updateFileMetadata(index, 'releasedate', e.target.value)
              }
            />
          </div>

          <div className='py-2 w-1/2'>
            <div>
              <Label>PDF Language</Label>
              <Select
                value={file.metadata?.lang}
                onValueChange={(value) =>
                  updateFileMetadata(index, 'lang', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select language' />
                </SelectTrigger>
                <SelectContent>
                  {manualLanguages.map((language) => (
                    <SelectItem key={language.code} value={language.code}>
                      {language.display}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='mt-4'>
              <Label className='mb-2 block'>Market Regions</Label>
              <div className='grid grid-cols-2 gap-2'>
                {Object.keys(regions).map((region) => (
                  <div key={region} className='flex items-center space-x-2'>
                    <Checkbox
                      id={`region-${region}-${index}`}
                      checked={
                        file.metadata?.regions?.[region as keyof Market] ||
                        false
                      }
                      onCheckedChange={(checked) => {
                        const newRegions = {
                          ...(file.metadata?.regions || {}),
                          [region]: checked === true,
                        };
                        updateFileMetadata(
                          index,
                          'regions',
                          newRegions as Market
                        );
                      }}
                    />
                    <Label
                      htmlFor={`region-${region}-${index}`}
                      className='text-sm font-normal'
                    >
                      {regions[region as keyof typeof regions]}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className='flex justify-between pt-4'>
        <Button variant='outline' onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={!validateMetadata()}>
          Submit
        </Button>
      </div>
    </div>
  );
}
