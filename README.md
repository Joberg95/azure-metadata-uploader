# Azure Metadata Manager

A web application for managing metadata for Azure Blob Storage documents. This application allows users to add, edit, copy, or delete documents with file specific meta data.

## Features

- Metadata doc management for Azure Blob Storage
- Authentication with Azure AD

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
NEXT_PUBLIC_AZURE_TABLE_URL=your-azure-table-url
NEXT_AZURE_SAS_TOKEN=your-sas-token
NEXT_PUBLIC_AZURE_BLOB_CONNECTION_URL=your-blob-connection-url
NEXT_AZURE_BLOB_SAS_TOKEN=your-blob-sas-token
NEXTAUTH_SECRET=your-nextauth-secret
AZURE_AD_CLIENT_SECRET=your-ad-client-secret
AZURE_AD_CLIENT_ID=your-ad-client-id
AZURE_AD_TENANT_ID=your-ad-tenant-id
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_AZURE_BLOB_SERVICE_CONNECTION_URL=your-service-connection-url
NEXT_AZURE_BLOB_SERVICE_SAS_TOKEN=your-service-sas-token
```

## Deployment

This project can be deployed to Azure Container Apps using docker and the included Azure Pipelines configuration.
