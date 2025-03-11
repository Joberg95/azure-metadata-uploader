export interface Market {
  EU: boolean;
  NA: boolean;
  SA: boolean;
  ME: boolean;
  AS: boolean;
  AU: boolean;
  IN: boolean;
}

export interface LanguageVariant {
  lang: string;
  url: string;
  manualtype: string[];
  releasedate: string | null;
}

export interface TableStorageEntry {
  documentno: string;
  familyname: string;
  manualtitle: string;
  productcategory: string;
  productgin: string;
  serialno: string;
  projectno?: string;
  subcategory: string;
  public: boolean;
  languagevariants: LanguageVariant[];
  market: Market;
}

export interface TableEntity {
  RowKey?: string;
  PartitionKey?: string;
  documentno?: string;
  familyname?: string;
  manualtitle?: string;
  manualtype?: string[];
  productcategory?: string;
  productgin?: string;
  projectno?: string;
  releasedate?: string | null;
  serialno?: string;
  subcategory?: string;
  public?: boolean;
  languagevariants?: string | LanguageVariant[];
  market?: string | Market;
  [key: string]: unknown;
}

export interface FormattedTableData {
  Key: string;
  PartitionKey: string;
  RowKey: string;
  documentno: string;
  familyname: string;
  manualtitle: string;
  manualtype: string[];
  productcategory: string;
  productgin: string;
  projectno: string;
  releasedate: string | null;
  serialno: string;
  subcategory: string;
  public: boolean;
  languagevariants: LanguageVariant[];
  market: Market;
}

export interface FileUpload {
  file: File;
  url?: string;
  public?: boolean;
  metadata?: {
    lang: string;
    manualtype: string[];
    releasedate: string | null;
    regions: {
      EU: boolean;
      NA: boolean;
      SA: boolean;
      ME: boolean;
      AS: boolean;
      AU: boolean;
      IN: boolean;
    };
  };
}

export interface MetaData {
  documentno: string;
  familyname: string;
  manualtitle: string;
  productcategory: string;
  productgin: string;
  serialno: string;
  projectno: string;
  subcategory: string;
  public: boolean;
}
