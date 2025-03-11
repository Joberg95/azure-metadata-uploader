'use client';

import React from 'react';
import { LanguageVariant } from '@/types';

interface DocumentItemProps {
  documentNo: string;
  title?: string;
  languageVariant: LanguageVariant;
}

export function DocumentItem({
  documentNo,
  title,
  languageVariant,
}: DocumentItemProps) {
  return (
    <div className='bg-white border border-border p-3 rounded-md text-sm shadow-sm'>
      <div className='flex justify-between items-center mb-1'>
        <span className='font-medium'>{languageVariant.lang}</span>
        <span className='text-xs bg-primary/10 text-primary px-2 py-0.5 rounded'>
          {languageVariant.manualtype.join(', ')}
        </span>
      </div>

      <div className='text-xs text-muted-foreground mb-2'>
        {title || `Document ${documentNo}`}
      </div>

      <div className='flex justify-between items-center'>
        <a
          href={languageVariant.url}
          target='_blank'
          rel='noopener noreferrer'
          className='text-xs text-primary hover:text-primary/80 hover:underline'
        >
          View Document
        </a>
        <span className='text-xs text-muted-foreground'>
          {languageVariant.releasedate || 'No release date'}
        </span>
      </div>
    </div>
  );
}
