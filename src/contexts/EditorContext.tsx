import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ContentData, Course, Module, ContentItem } from '@/types/content';
import { loadContent } from '@/lib/content';
import type { Batch } from '@/types/content';
import {
  saveDraft,
  loadDraft,
  clearDraft,
  exportDraftAsJson,
  generateId,
  addCourse,
  updateCourse,
  deleteCourse,
  addModule,
  updateModule,
  deleteModule,
  addItem,
  updateItem,
  deleteItem,
  reorderModulesInCourse,
  reorderItemsInModule,
} from '@/lib/editorStorage';

interface EditorContextType {
  content: ContentData | null;
  isLoading: boolean;
  isDirty: boolean;
  lastSaved: Date | null;
  
  // Course operations
  createCourse: (course: Omit<Course, 'id' | 'modules'>, batchKey: string) => string;
  editCourse: (course: Course) => void;
  removeCourse: (courseId: string) => void;
  
  // Module operations
  createModule: (module: Omit<Module, 'id' | 'items'>) => string;
  editModule: (module: Module) => void;
  removeModule: (moduleId: string) => void;
  
  // Item operations
  createItem: (item: Omit<ContentItem, 'id'>) => string;
  editItem: (item: ContentItem) => void;
  removeItem: (itemId: string) => void;
  
  // Reorder operations
  reorderModules: (courseId: string, fromIndex: number, toIndex: number) => void;
  reorderItems: (moduleId: string, fromIndex: number, toIndex: number) => void;
  
  // Batch operations
  createBatch: (key: string, batch: Batch) => void;
  editBatch: (key: string, batch: Batch) => void;
  removeBatch: (key: string) => void;
  
  // Draft operations
  saveChanges: () => void;
  discardChanges: () => void;
  exportContent: () => void;
  resetToProduction: () => Promise<void>;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<ContentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load content on mount (prefer draft, fallback to production)
  useEffect(() => {
    const init = async () => {
      const draft = loadDraft();
      if (draft) {
        setContent(draft);
        setLastSaved(new Date(draft.lastModified));
      } else {
        const prodContent = await loadContent();
        setContent(prodContent);
      }
      setIsLoading(false);
    };
    init();
  }, []);

  // Auto-save when content changes
  useEffect(() => {
    if (content && isDirty) {
      saveDraft(content);
      setLastSaved(new Date());
      setIsDirty(false);
    }
  }, [content, isDirty]);

  // Course operations
  const createCourse = useCallback((courseData: Omit<Course, 'id' | 'modules'>, batchKey: string): string => {
    const id = generateId('course');
    const course: Course = { ...courseData, id, modules: [] };
    setContent(prev => prev ? addCourse(prev, course, batchKey) : prev);
    setIsDirty(true);
    return id;
  }, []);

  const editCourse = useCallback((course: Course) => {
    setContent(prev => prev ? updateCourse(prev, course) : prev);
    setIsDirty(true);
  }, []);

  const removeCourse = useCallback((courseId: string) => {
    setContent(prev => prev ? deleteCourse(prev, courseId) : prev);
    setIsDirty(true);
  }, []);

  // Module operations
  const createModule = useCallback((moduleData: Omit<Module, 'id' | 'items'>): string => {
    const id = generateId('module');
    const module: Module = { ...moduleData, id, items: [] };
    setContent(prev => prev ? addModule(prev, module) : prev);
    setIsDirty(true);
    return id;
  }, []);

  const editModule = useCallback((module: Module) => {
    setContent(prev => prev ? updateModule(prev, module) : prev);
    setIsDirty(true);
  }, []);

  const removeModule = useCallback((moduleId: string) => {
    setContent(prev => prev ? deleteModule(prev, moduleId) : prev);
    setIsDirty(true);
  }, []);

  // Item operations
  const createItem = useCallback((itemData: Omit<ContentItem, 'id'>): string => {
    const id = generateId('item');
    const item: ContentItem = { ...itemData, id };
    setContent(prev => prev ? addItem(prev, item) : prev);
    setIsDirty(true);
    return id;
  }, []);

  const editItem = useCallback((item: ContentItem) => {
    setContent(prev => prev ? updateItem(prev, item) : prev);
    setIsDirty(true);
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setContent(prev => prev ? deleteItem(prev, itemId) : prev);
    setIsDirty(true);
  }, []);

  // Reorder operations
  const reorderModules = useCallback((courseId: string, fromIndex: number, toIndex: number) => {
    setContent(prev => prev ? reorderModulesInCourse(prev, courseId, fromIndex, toIndex) : prev);
    setIsDirty(true);
  }, []);

  const reorderItems = useCallback((moduleId: string, fromIndex: number, toIndex: number) => {
    setContent(prev => prev ? reorderItemsInModule(prev, moduleId, fromIndex, toIndex) : prev);
    setIsDirty(true);
  }, []);

  // Batch operations
  const createBatch = useCallback((key: string, batch: Batch) => {
    setContent(prev => {
      if (!prev) return prev;
      return { ...prev, batches: { ...prev.batches, [key]: batch } };
    });
    setIsDirty(true);
  }, []);

  const editBatch = useCallback((key: string, batch: Batch) => {
    setContent(prev => {
      if (!prev) return prev;
      return { ...prev, batches: { ...prev.batches, [key]: batch } };
    });
    setIsDirty(true);
  }, []);

  const removeBatch = useCallback((key: string) => {
    setContent(prev => {
      if (!prev) return prev;
      const newBatches = { ...prev.batches };
      delete newBatches[key];
      return { ...prev, batches: newBatches };
    });
    setIsDirty(true);
  }, []);

  // Draft operations
  const saveChanges = useCallback(() => {
    if (content) {
      saveDraft(content);
      setLastSaved(new Date());
      setIsDirty(false);
    }
  }, [content]);

  const discardChanges = useCallback(() => {
    clearDraft();
    setIsDirty(false);
  }, []);

  const exportContent = useCallback(() => {
    if (content) {
      exportDraftAsJson(content);
    }
  }, [content]);

  const resetToProduction = useCallback(async () => {
    clearDraft();
    const prodContent = await loadContent();
    setContent(prodContent);
    setIsDirty(false);
    setLastSaved(null);
  }, []);

  return (
    <EditorContext.Provider
      value={{
        content,
        isLoading,
        isDirty,
        lastSaved,
        createCourse,
        editCourse,
        removeCourse,
        createModule,
        editModule,
        removeModule,
        createItem,
        editItem,
        removeItem,
        reorderModules,
        reorderItems,
        createBatch,
        editBatch,
        removeBatch,
        saveChanges,
        discardChanges,
        exportContent,
        resetToProduction,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
}
