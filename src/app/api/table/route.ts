import { NextResponse } from "next/server";

export async function GET() {
  const tableUrl = process.env.NEXT_PUBLIC_AZURE_TABLE_URL;
  const sasToken = process.env.NEXT_AZURE_SAS_TOKEN;

  if (!tableUrl || !sasToken) {
    return NextResponse.json(
      { error: "Missing required environment variables" },
      { status: 500 }
    );
  }

  try {
    const timestamp = new Date().getTime();
    const response = await fetch(
      `${tableUrl}${sasToken}&$top=1000&_=${timestamp}`,
      {
        headers: {
          Accept: "application/json;odata=nometadata",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const tableUrl = process.env.NEXT_PUBLIC_AZURE_TABLE_URL;
    const sasToken = process.env.NEXT_AZURE_SAS_TOKEN;

    if (!tableUrl || !sasToken) {
      return NextResponse.json(
        { error: "Missing required environment variables" },
        { status: 500 }
      );
    }

    const entity = await request.json();
    const baseUrl = tableUrl.replace(/\/$/, "");
    const fullUrl = baseUrl + sasToken;

    const response = await fetch(fullUrl, {
      method: "POST",
      headers: {
        Accept: "application/json;odata=nometadata",
        "Content-Type": "application/json;odata=nometadata",
        Prefer: "return-no-content",
      },
      body: JSON.stringify(entity),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create table entry: ${errorText}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating table entry:", error);
    return NextResponse.json(
      { error: "Failed to create table entry" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const tableUrl = process.env.NEXT_PUBLIC_AZURE_TABLE_URL;
    const sasToken = process.env.NEXT_AZURE_SAS_TOKEN;

    if (!tableUrl || !sasToken) {
      return NextResponse.json(
        { error: "Missing required environment variables" },
        { status: 500 }
      );
    }

    const entity = await request.json();
    const baseUrl = tableUrl.replace(/\/$/, "");
    const entityUrl = `${baseUrl}(PartitionKey='${entity.PartitionKey}',RowKey='${entity.RowKey}')${sasToken}`;

    const response = await fetch(entityUrl, {
      method: "PUT",
      headers: {
        Accept: "application/json;odata=nometadata",
        "Content-Type": "application/json;odata=nometadata",
        Prefer: "return-no-content",
      },
      body: JSON.stringify(entity),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update table entry: ${errorText}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating table entry:", error);
    return NextResponse.json(
      { error: "Failed to update table entry" },
      { status: 500 }
    );
  }
}
