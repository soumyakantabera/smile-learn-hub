import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ContentData } from '@/types/content';
import { loadContent } from '@/lib/content';

interface ContentContextType {
  content: ContentData | null;
  isLoading: boolean;
  error: string | null;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<ContentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await loadContent();
        setContent(data);
      } catch (err) {
        setError('Failed to load content');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  return (
    <ContentContext.Provider value={{ content, isLoading, error }}>
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
