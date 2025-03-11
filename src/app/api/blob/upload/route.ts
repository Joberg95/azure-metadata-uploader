import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    formData.get('projectId');
    const isPublic = formData.get('isPublic') !== 'false';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
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

    const blobName = file.name;

    const baseUrl = blobUrl.endsWith('/') ? blobUrl.slice(0, -1) : blobUrl;
    const uploadUrl = `${baseUrl}/${blobName}${sasToken}`;

    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'x-ms-blob-type': 'BlockBlob',
        'Content-Type': file.type,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to upload file: ${response.statusText}`);
    }

    const fileUrl = `${baseUrl}/${blobName}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      blobName,
      container: isPublic ? 'instructionmanuals' : 'servicemanuals',
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
