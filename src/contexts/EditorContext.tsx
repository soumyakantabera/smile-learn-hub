import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ContentData, Course, Module, ContentItem, Batch } from '@/types/content';
import { loadContent, publishLiveContent, refreshContent } from '@/lib/content';

import {
  saveDraft,
  loadDraft,
  clearDraft,
  exportDraftAsJson,
  generateId,
  addCourse,
  updateCourse,
  deleteCourse,
  duplicateCourse as dupCourseFn,
  addModule,
  updateModule,
  deleteModule,
  duplicateModule as dupModuleFn,
  addItem,
  updateItem,
  deleteItem,
  duplicateItem as dupItemFn,
  moveItem as moveItemFn,
  reorderModulesInCourse,
  reorderItemsInModule,
  getDraftSizeKB,
  listSnapshots,
  restoreSnapshot,
  type Snapshot,
} from '@/lib/editorStorage';

const HISTORY_LIMIT = 30;

interface EditorContextType {
  content: ContentData | null;
  productionContent: ContentData | null;
  isLoading: boolean;
  isDirty: boolean;
  lastSaved: Date | null;
  draftSizeKB: number;
  canUndo: boolean;
  canRedo: boolean;

  createCourse: (course: Omit<Course, 'id' | 'modules'>, batchKey: string) => string;
  editCourse: (course: Course) => void;
  removeCourse: (courseId: string) => void;
  duplicateCourse: (courseId: string) => void;

  createModule: (module: Omit<Module, 'id' | 'items'>) => string;
  editModule: (module: Module) => void;
  removeModule: (moduleId: string) => void;
  duplicateModule: (moduleId: string) => void;

  createItem: (item: Omit<ContentItem, 'id'>) => string;
  editItem: (item: ContentItem) => void;
  removeItem: (itemId: string) => void;
  duplicateItem: (itemId: string) => void;
  moveItem: (itemId: string, targetModuleId: string) => void;

  reorderModules: (courseId: string, fromIndex: number, toIndex: number) => void;
  reorderItems: (moduleId: string, fromIndex: number, toIndex: number) => void;

  createBatch: (key: string, batch: Batch) => void;
  editBatch: (key: string, batch: Batch) => void;
  removeBatch: (key: string) => void;

  saveChanges: () => void;
  discardChanges: () => void;
  exportContent: () => void;
  importContent: (data: ContentData) => void;
  resetToProduction: () => Promise<void>;

  undo: () => void;
  redo: () => void;
  getSnapshots: () => Snapshot[];
  restoreFromSnapshot: (id: string) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<ContentData | null>(null);
  const [productionContent, setProductionContent] = useState<ContentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [draftSizeKB, setDraftSizeKB] = useState(0);

  const past = useRef<ContentData[]>([]);
  const future = useRef<ContentData[]>([]);
  const [, setHistoryTick] = useState(0);
  const skipHistory = useRef(false);

  useEffect(() => {
    const init = async () => {
      const draft = loadDraft();
      const prod = await loadContent();
      setProductionContent(prod);
      if (draft) {
        setContent(draft);
        setLastSaved(new Date(draft.lastModified));
      } else {
        setContent(prod);
      }
      setIsLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (content && isDirty) {
      saveDraft(content);
      setLastSaved(new Date());
      setDraftSizeKB(getDraftSizeKB());
      setIsDirty(false);
    }
  }, [content, isDirty]);

  const mutate = useCallback((updater: (prev: ContentData) => ContentData) => {
    setContent((prev) => {
      if (!prev) return prev;
      if (!skipHistory.current) {
        past.current.push(prev);
        if (past.current.length > HISTORY_LIMIT) past.current.shift();
        future.current = [];
        setHistoryTick((t) => t + 1);
      }
      skipHistory.current = false;
      return updater(prev);
    });
    setIsDirty(true);
  }, []);

  // Courses
  const createCourse = useCallback(
    (courseData: Omit<Course, 'id' | 'modules'>, batchKey: string): string => {
      const id = generateId('course');
      const course: Course = { ...courseData, id, modules: [], status: courseData.status || 'draft' };
      mutate((prev) => addCourse(prev, course, batchKey));
      return id;
    },
    [mutate],
  );
  const editCourse = useCallback((c: Course) => mutate((prev) => updateCourse(prev, c)), [mutate]);
  const removeCourse = useCallback((id: string) => mutate((prev) => deleteCourse(prev, id)), [mutate]);
  const duplicateCourse = useCallback((id: string) => mutate((prev) => dupCourseFn(prev, id)), [mutate]);

  // Modules
  const createModule = useCallback(
    (moduleData: Omit<Module, 'id' | 'items'>): string => {
      const id = generateId('module');
      const module: Module = { ...moduleData, id, items: [] };
      mutate((prev) => addModule(prev, module));
      return id;
    },
    [mutate],
  );
  const editModule = useCallback((m: Module) => mutate((prev) => updateModule(prev, m)), [mutate]);
  const removeModule = useCallback((id: string) => mutate((prev) => deleteModule(prev, id)), [mutate]);
  const duplicateModule = useCallback((id: string) => mutate((prev) => dupModuleFn(prev, id)), [mutate]);

  // Items
  const createItem = useCallback(
    (itemData: Omit<ContentItem, 'id'>): string => {
      const id = generateId('item');
      const item: ContentItem = { ...itemData, id };
      mutate((prev) => addItem(prev, item));
      return id;
    },
    [mutate],
  );
  const editItem = useCallback((it: ContentItem) => mutate((prev) => updateItem(prev, it)), [mutate]);
  const removeItem = useCallback((id: string) => mutate((prev) => deleteItem(prev, id)), [mutate]);
  const duplicateItem = useCallback((id: string) => mutate((prev) => dupItemFn(prev, id)), [mutate]);
  const moveItem = useCallback(
    (id: string, target: string) => mutate((prev) => moveItemFn(prev, id, target)),
    [mutate],
  );

  // Reorder
  const reorderModules = useCallback(
    (courseId: string, fromIndex: number, toIndex: number) =>
      mutate((prev) => reorderModulesInCourse(prev, courseId, fromIndex, toIndex)),
    [mutate],
  );
  const reorderItems = useCallback(
    (moduleId: string, fromIndex: number, toIndex: number) =>
      mutate((prev) => reorderItemsInModule(prev, moduleId, fromIndex, toIndex)),
    [mutate],
  );

  // Batches
  const createBatch = useCallback(
    (key: string, batch: Batch) => mutate((prev) => ({ ...prev, batches: { ...prev.batches, [key]: batch } })),
    [mutate],
  );
  const editBatch = useCallback(
    (key: string, batch: Batch) => mutate((prev) => ({ ...prev, batches: { ...prev.batches, [key]: batch } })),
    [mutate],
  );
  const removeBatch = useCallback(
    (key: string) =>
      mutate((prev) => {
        const next = { ...prev.batches };
        delete next[key];
        return { ...prev, batches: next };
      }),
    [mutate],
  );

  // Draft
  const saveChanges = useCallback(() => {
    if (content) {
      saveDraft(content);
      setLastSaved(new Date());
      setDraftSizeKB(getDraftSizeKB());
      setIsDirty(false);
    }
  }, [content]);

  const discardChanges = useCallback(() => {
    clearDraft();
    setIsDirty(false);
  }, []);

  const exportContent = useCallback(() => {
    if (content) exportDraftAsJson(content);
  }, [content]);

  const importContent = useCallback((data: ContentData) => mutate(() => data), [mutate]);

  const resetToProduction = useCallback(async () => {
    clearDraft();
    const prod = await loadContent();
    past.current = [];
    future.current = [];
    skipHistory.current = true;
    setContent(prod);
    setProductionContent(prod);
    setIsDirty(false);
    setLastSaved(null);
    setHistoryTick((t) => t + 1);
  }, []);

  const undo = useCallback(() => {
    if (past.current.length === 0) return;
    setContent((prev) => {
      if (!prev) return prev;
      const previous = past.current.pop()!;
      future.current.push(prev);
      skipHistory.current = true;
      setHistoryTick((t) => t + 1);
      return previous;
    });
    setIsDirty(true);
  }, []);

  const redo = useCallback(() => {
    if (future.current.length === 0) return;
    setContent((prev) => {
      if (!prev) return prev;
      const next = future.current.pop()!;
      past.current.push(prev);
      skipHistory.current = true;
      setHistoryTick((t) => t + 1);
      return next;
    });
    setIsDirty(true);
  }, []);

  const getSnapshots = useCallback(() => listSnapshots(), []);

  const restoreFromSnapshot = useCallback(
    (id: string) => {
      const snap = restoreSnapshot(id);
      if (snap) mutate(() => snap);
    },
    [mutate],
  );

  return (
    <EditorContext.Provider
      value={{
        content,
        productionContent,
        isLoading,
        isDirty,
        lastSaved,
        draftSizeKB,
        canUndo: past.current.length > 0,
        canRedo: future.current.length > 0,
        createCourse,
        editCourse,
        removeCourse,
        duplicateCourse,
        createModule,
        editModule,
        removeModule,
        duplicateModule,
        createItem,
        editItem,
        removeItem,
        duplicateItem,
        moveItem,
        reorderModules,
        reorderItems,
        createBatch,
        editBatch,
        removeBatch,
        saveChanges,
        discardChanges,
        exportContent,
        importContent,
        resetToProduction,
        undo,
        redo,
        getSnapshots,
        restoreFromSnapshot,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) throw new Error('useEditor must be used within an EditorProvider');
  return context;
}
