import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const blobName = searchParams.get('blobName');
    const isPublic = searchParams.get('isPublic') !== 'false';

    if (!blobName) {
      return NextResponse.json(
        { error: 'Blob name is required' },
        { status: 400 }
      );
    }

    const blobUrl = isPublic
      ? process.env.NEXT_PUBLIC_AZURE_BLOB_CONNECTION_URL
      : process.env.NEXT_PUBLIC_AZURE_BLOB_SERVICE_CONNECTION_URL;

    const sasToken = isPublic
      ? process.env.NEXT_AZURE_BLOB_SAS_TOKEN
      : process.env.NEXT_AZURE_BLOB_SERVICE_SAS_TOKEN;

    if (!blobUrl || !sasToken) {
      return NextResponse.json(
        { error: 'Azure Blob Storage configuration is missing' },
        { status: 500 }
      );
    }

    const baseUrl = blobUrl.endsWith('/') ? blobUrl.slice(0, -1) : blobUrl;

    const fileName = blobName.split('/').pop() || blobName;
    const deleteUrl = `${baseUrl}/${fileName}${sasToken}`;

    const response = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'x-ms-date': new Date().toUTCString(),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete blob: ${response.statusText}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting from blob storage:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
