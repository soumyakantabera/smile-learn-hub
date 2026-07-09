import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ContentData } from '@/types/content';
import { loadContent, refreshContent } from '@/lib/content';

interface ContentContextType {
  content: ContentData | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<ContentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (force = false) => {
    try {
      const data = force ? await refreshContent() : await loadContent();
      setContent(data);
      setError(null);
    } catch (err) {
      setError('Failed to load content');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(async () => {
    await load(true);
  }, [load]);

  return (
    <ContentContext.Provider value={{ content, isLoading, error, refresh }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
}
