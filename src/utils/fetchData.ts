import { TableEntity } from "@/types";

let cachedData: TableEntity[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000;

export const fetchData = async (): Promise<TableEntity[]> => {
  const currentTime = Date.now();

  if (cachedData && currentTime - lastFetchTime < CACHE_DURATION) {
    return cachedData;
  }

  try {
    const response = await fetch("/api/table", {
      cache: "no-cache",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    const data = await response.json();
    const items = data.value || [];

    cachedData = items;
    lastFetchTime = currentTime;

    return items;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const invalidateDataCache = () => {
  cachedData = null;
  lastFetchTime = 0;
};
