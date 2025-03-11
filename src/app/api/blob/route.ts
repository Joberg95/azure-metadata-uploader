import { NextResponse } from 'next/server';

export async function GET() {
  const blobUrl = process.env.NEXT_PUBLIC_AZURE_BLOB_CONNECTION_URL;
  const sasToken = process.env.NEXT_AZURE_BLOB_SAS_TOKEN;

  if (!blobUrl || !sasToken) {
    return NextResponse.json(
      { error: 'Missing required environment variables' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(`${blobUrl}${sasToken}`, {
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-cache',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
