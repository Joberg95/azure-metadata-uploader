'use client';

import React, { useState, useEffect } from 'react';
import UploadHandler from '@/components/upload/upload-handler';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TableStorageEntry } from '@/types';
import { fetchData, invalidateDataCache } from '@/utils/fetchData';
import TableSearch from '@/components/table/table-search';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { formatTableData } from '@/utils/formatTableData';
import { FormattedTableData } from '@/types';
import { useSession } from 'next-auth/react';
import DocumentEditModal from '@/components/document-edit-modal';
import { Pencil } from 'lucide-react';

interface TableComponentProps {
  data: FormattedTableData[];
}

export default function DataTable() {
  const { data: session } = useSession();
  const [data, setData] = useState<TableComponentProps['data']>([]);
  const [filteredData, setFilteredData] = useState<TableComponentProps['data']>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] =
    useState<FormattedTableData | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const fetchedData = await fetchData();
        const formattedData = formatTableData(fetchedData);

        setData(formattedData);
        setFilteredData(formattedData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredData(data);
      setCurrentPage(1);
      return;
    }

    const filtered = data.filter((item) =>
      item.documentno.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPageData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const headers = [
    'Document No',
    'Manual Title',
    'Manual Types',
    'Release Date',
    'Actions',
  ];

  const handleUpload = async (uploadData: TableStorageEntry) => {
    try {
      const entity = {
        PartitionKey: uploadData.productcategory,
        RowKey: crypto.randomUUID(),
        documentno: uploadData.documentno,
        familyname: uploadData.familyname,
        manualtitle: uploadData.manualtitle,
        productgin: uploadData.productgin,
        serialno: uploadData.serialno,
        productcategory: uploadData.productcategory,
        projectno: uploadData.projectno || '',
        subcategory: uploadData.subcategory,
        public: uploadData.public,
        languagevariants: JSON.stringify(uploadData.languagevariants),
        market: JSON.stringify(uploadData.market),
      };

      const response = await fetch('/api/table', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entity),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload document');
      }

      invalidateDataCache();
      const fetchedData = await fetchData();
      const formattedData = formatTableData(fetchedData);

      setData(formattedData);
      setFilteredData(formattedData);

      return { success: true, message: 'Document uploaded successfully!' };
    } catch (error) {
      console.error('Error during upload process:', error);
      return {
        success: false,
        message:
          'Failed to complete upload process: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      };
    }
  };

  const handleEdit = (document: FormattedTableData) => {
    setSelectedDocument(document);
    setIsEditModalOpen(true);
  };

  const handleUpdateComplete = async () => {
    try {
      const fetchedData = await fetchData();
      const formattedData = formatTableData(fetchedData);

      setData(formattedData);
      setFilteredData(formattedData);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  if (loading) {
    return <div className='p-6'>Loading data...</div>;
  }

  if (error) {
    return <div className='p-6 text-red-500'>{error}</div>;
  }

  return (
    <div className='p-6'>
      <div className='mb-6'>
        <Button disabled={!session} onClick={() => setIsModalOpen(true)}>
          New document
        </Button>
      </div>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-lg font-medium'>Uploaded Documents</h2>
        <TableSearch onSearch={handleSearch} />
      </div>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((header) => (
                <TableHead key={header}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPageData.map((item, index) => {
              return (
                <TableRow key={index}>
                  <TableCell>{item.documentno}</TableCell>
                  <TableCell>{item.manualtitle}</TableCell>
                  <TableCell>
                    {typeof item.manualtype === 'string'
                      ? (item.manualtype as string).startsWith('[')
                        ? JSON.parse(item.manualtype as string).join(', ')
                        : item.manualtype
                      : Array.isArray(item.manualtype)
                      ? item.manualtype.join(', ')
                      : String(item.manualtype)}
                  </TableCell>
                  <TableCell>{item.releasedate}</TableCell>
                  <TableCell>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleEdit(item)}
                      disabled={!session}
                    >
                      <Pencil className='h-4 w-4 mr-1' />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <div className='flex items-center justify-end space-x-2 py-4'>
        <Pagination className='py-4'>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className={
                  currentPage === 1
                    ? 'pointer-events-none opacity-50'
                    : 'cursor-pointer'
                }
              />
            </PaginationItem>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber;
              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (currentPage <= 3) {
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }

              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    isActive={currentPage === pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className='cursor-pointer'
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                className={
                  currentPage === totalPages || totalPages === 0
                    ? 'pointer-events-none opacity-50'
                    : 'cursor-pointer'
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
      {isModalOpen && (
        <UploadHandler
          onUpload={handleUpload}
          onClose={() => setIsModalOpen(false)}
        />
      )}
      {isEditModalOpen && selectedDocument && (
        <DocumentEditModal
          document={selectedDocument}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedDocument(null);
          }}
          onUpdate={handleUpdateComplete}
        />
      )}
    </div>
  );
}
