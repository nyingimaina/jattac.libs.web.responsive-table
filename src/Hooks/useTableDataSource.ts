import { useState, useEffect, useCallback, useRef } from 'react';
import { DataSource, DataSourceResult, IDataSourceParams } from '../Context/TableContext';

interface UseTableDataSourceProps<TData> {
  dataSource?: DataSource<TData>;
  pageSize?: number;
  initialData?: TData[];
  sort?: { columnId: string; direction: 'asc' | 'desc' };
  filter?: string;
}

interface UseTableDataSourceReturn<TData> {
  data: TData[];
  currentPage: number;
  hasMore: boolean;
  totalCount?: number;
  isLoading: boolean;
  isFetchingMore: boolean;
  loadNextPage: () => Promise<void>;
  resetAndFetch: () => Promise<void>;
}

export const useTableDataSource = <TData,>(props: UseTableDataSourceProps<TData>): UseTableDataSourceReturn<TData> => {
  const { dataSource, pageSize = 20, initialData = [], sort, filter } = props;

  const [data, setData] = useState<TData[]>(initialData);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);

  const isInitialMount = useRef(true);

  const fetchData = useCallback(async (page: number, isAppend: boolean) => {
    if (!dataSource) return;

    if (isAppend) {
      setIsFetchingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      const params: IDataSourceParams = {
        page,
        pageSize,
        sort,
        filter,
      };

      const result: DataSourceResult<TData> = await dataSource(params);
      
      let newItems: TData[] = [];
      let newTotalCount: number | undefined = undefined;

      if (Array.isArray(result)) {
        newItems = result;
      } else {
        newItems = result.items;
        newTotalCount = result.totalCount;
      }

      setData(prev => isAppend ? [...prev, ...newItems] : newItems);
      setTotalCount(newTotalCount);
      setCurrentPage(page);

      // Intelligent hasMore detection
      if (newTotalCount !== undefined) {
        const currentTotalLoaded = (isAppend ? data.length : 0) + newItems.length;
        setHasMore(currentTotalLoaded < newTotalCount);
      } else {
        // If we got fewer items than pageSize, we've reached the end
        setHasMore(newItems.length === pageSize);
      }

    } catch (error) {
      console.error('Error fetching data from dataSource:', error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  }, [dataSource, pageSize, sort, filter, data.length]);

  const loadNextPage = useCallback(async () => {
    if (isLoading || isFetchingMore || !hasMore || !dataSource) return;
    await fetchData(currentPage + 1, true);
  }, [currentPage, hasMore, isLoading, isFetchingMore, dataSource, fetchData]);

  const resetAndFetch = useCallback(async () => {
    if (!dataSource) return;
    await fetchData(1, false);
  }, [dataSource, fetchData]);

  // Handle changes in sort or filter (reset to page 1)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (dataSource && initialData.length === 0) {
        resetAndFetch();
      }
      return;
    }

    resetAndFetch();
  }, [sort, filter, dataSource]); // initialData and pageSize changes don't trigger reset by default

  return {
    data,
    currentPage,
    hasMore,
    totalCount,
    isLoading,
    isFetchingMore,
    loadNextPage,
    resetAndFetch,
  };
};
