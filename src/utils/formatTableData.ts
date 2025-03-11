import { TableEntity, FormattedTableData } from '@/types';

export function formatTableEntity(entity: TableEntity): FormattedTableData {
  return {
    Key: entity.RowKey || '',
    PartitionKey: entity.PartitionKey || '',
    RowKey: entity.RowKey || '',
    documentno: entity.documentno || '',
    familyname: entity.familyname || '',
    manualtitle: entity.manualtitle || '',
    manualtype: entity.manualtype || [],
    productcategory: entity.productcategory || '',
    productgin: entity.productgin || '',
    projectno: entity.projectno || '',
    releasedate: entity.releasedate || null,
    serialno: entity.serialno || '',
    subcategory: entity.subcategory || '',
    public: entity.public || false,
    languagevariants: entity.languagevariants
      ? typeof entity.languagevariants === 'string'
        ? JSON.parse(entity.languagevariants)
        : entity.languagevariants
      : [],
    market: entity.market
      ? typeof entity.market === 'string'
        ? JSON.parse(entity.market)
        : entity.market
      : {
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

export function formatTableData(entities: TableEntity[]): FormattedTableData[] {
  return entities.map(formatTableEntity);
}
