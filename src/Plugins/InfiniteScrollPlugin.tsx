import React from 'react';
import { IResponsiveTablePlugin, IPluginAPI } from './IResponsiveTablePlugin';

export class InfiniteScrollPlugin<TData> implements IResponsiveTablePlugin<TData> {
  public id = 'infinite-scroll';
  private api!: IPluginAPI<TData>;
  private isLoadingMore = false;

  constructor() {
  }

  public onPluginInit = (api: IPluginAPI<TData>) => {
    this.api = api;
    this.attachScrollListener();
  };

  private attachScrollListener = () => {
    const scrollableElement = this.api.getScrollableElement?.();
    if (scrollableElement) {
      scrollableElement.addEventListener('scroll', this.handleScroll);
    }
  };

  private handleScroll = async () => {
    const scrollableElement = this.api.getScrollableElement?.();
    if (!scrollableElement || !this.api.infiniteScrollProps?.enableInfiniteScroll) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = scrollableElement;

    const scrollThreshold = 200; // Load more data when 200px from the bottom

    if (
      scrollHeight - scrollTop - clientHeight < scrollThreshold &&
      this.api.infiniteScrollProps.hasMore &&
      !this.isLoadingMore
    ) {
      this.isLoadingMore = true;
      this.api.forceUpdate(); // Trigger re-render to show loading component

      const newData = await this.api.infiniteScrollProps.onLoadMore?.(this.api.getData());

      if (newData) {
        // The main component will handle appending data via processData
      } else {
        // No more data, update hasMore in parent if necessary
      }

      this.isLoadingMore = false;
      this.api.forceUpdate(); // Trigger re-render to hide loading component
    }
  };

  public processData = (data: TData[]): TData[] => {
    // This plugin doesn't modify the data directly, but rather triggers loading more.
    // The main component's data prop should be updated by the consumer of the table.
    return data;
  };

  public renderFooter = () => {
    if (!this.api.infiniteScrollProps) {
      return null;
    }

    if (this.isLoadingMore) {
      return this.api.infiniteScrollProps.loadingMoreComponent || <div>Loading more...</div>;
    } else if (!this.api.infiniteScrollProps.hasMore) {
      return this.api.infiniteScrollProps.noMoreDataComponent || <div>No more data.</div>;
    }
    return null;
  };
}
