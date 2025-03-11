export interface BlobUploadResponse {
  url: string;
  success: boolean;
  error?: string;
}

export interface TableStorageEntry {
  PartitionKey: string;
  RowKey: string;
  documentno: string;
  manualtitle: string;
  manualtype: string[];
  languagevariants: {
    lang: string;
    url: string;
    manualtype: string[];
    releasedate: string | null;
  }[];
  market: {
    EU: boolean;
    NA: boolean;
    SA: boolean;
    ME: boolean;
    AS: boolean;
    AU: boolean;
    IN: boolean;
  };
  productcategory: string;
  productgin: string;
  releasedate: string | null;
  subcategory: string;
  public: boolean;
}

export async function uploadToBlob(
  file: File,
  isPublic: boolean = true
): Promise<BlobUploadResponse> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', new Date().getTime().toString());
    formData.append('isPublic', isPublic.toString());

    const response = await fetch('/api/blob/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload file');
    }

    const data = await response.json();
    return {
      success: true,
      url: data.url,
    };
  } catch (error) {
    console.error('Error uploading to blob storage:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'error occurred',
      url: '',
    };
  }
}

export async function deleteFromBlob(
  blobName: string,
  isPublic: boolean = true
): Promise<boolean> {
  try {
    const response = await fetch(
      `/api/blob/delete?blobName=${encodeURIComponent(
        blobName
      )}&isPublic=${isPublic}`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete file');
    }

    return true;
  } catch (error) {
    console.error('Error deleting from blob storage:', error);
    return false;
  }
}

export async function createTableEntry(
  entry: TableStorageEntry
): Promise<boolean> {
  try {
    const response = await fetch('/api/table', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entry),
    });

    if (!response.ok) {
      throw new Error('Failed to create table entry');
    }

    return true;
  } catch (error) {
    console.error('Error creating table entry:', error);
    return false;
  }
}
