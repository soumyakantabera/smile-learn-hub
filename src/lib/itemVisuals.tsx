import React from 'react';
import {
  PictureAsPdfRounded,
  OndemandVideoRounded,
  SmartDisplayRounded,
  HeadphonesRounded,
  ArticleRounded,
  SlideshowRounded,
  TableChartRounded,
  OpenInNewRounded,
  AssignmentTurnedInRounded,
  QuizRounded,
  RecordVoiceOverRounded,
} from '@mui/icons-material';
import type { ItemType } from '@/types/content';

/**
 * Single source of truth for item iconography.
 *
 * Every surface (viewer, course/module lists, outline drawer, editor, dashboard)
 * imports from here so an item looks identical everywhere — same rounded icon,
 * same LWS accent, same label.
 */

export interface ItemVisual {
  icon: React.ReactNode;
  /** Solid accent (LWS palette) */
  color: string;
  /** Soft background tint for icon tiles */
  tint: string;
  label: string;
  /** Short label for dense chips */
  short: string;
}

// LWS palette — forest, deep mint, mint, amber, coral, plum accent
const FOREST = '#0F3D2E';
const MINT_DEEP = '#3E8E5A';
const MINT = '#5BAE7C';
const AMBER = '#F5B921';
const AMBER_DEEP = '#D99A0B';
const CORAL = '#F26B5E';
const CORAL_DEEP = '#D8503F';

const tint = (hex: string, a = 0.12) => {
  const n = hex.replace('#', '');
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

export const ITEM_VISUALS: Record<ItemType, ItemVisual> = {
  pdf: { icon: <PictureAsPdfRounded />, color: CORAL_DEEP, tint: tint(CORAL_DEEP), label: 'PDF Document', short: 'PDF' },
  video: { icon: <OndemandVideoRounded />, color: AMBER_DEEP, tint: tint(AMBER_DEEP), label: 'Video', short: 'Video' },
  youtube: { icon: <SmartDisplayRounded />, color: CORAL, tint: tint(CORAL), label: 'Video Lesson', short: 'Video' },
  audio: { icon: <HeadphonesRounded />, color: MINT_DEEP, tint: tint(MINT_DEEP), label: 'Audio Recording', short: 'Audio' },
  doc: { icon: <ArticleRounded />, color: FOREST, tint: tint(FOREST), label: 'Word Document', short: 'Doc' },
  ppt: { icon: <SlideshowRounded />, color: AMBER, tint: tint(AMBER), label: 'Presentation', short: 'Slides' },
  spreadsheet: { icon: <TableChartRounded />, color: MINT, tint: tint(MINT), label: 'Spreadsheet', short: 'Sheet' },
  link: { icon: <OpenInNewRounded />, color: MINT_DEEP, tint: tint(MINT_DEEP), label: 'External Link', short: 'Link' },
  homework: { icon: <AssignmentTurnedInRounded />, color: AMBER_DEEP, tint: tint(AMBER_DEEP), label: 'Homework', short: 'Task' },
  quiz: { icon: <QuizRounded />, color: FOREST, tint: tint(FOREST), label: 'Interactive Quiz', short: 'Quiz' },
  conversation: { icon: <RecordVoiceOverRounded />, color: MINT_DEEP, tint: tint(MINT_DEEP), label: 'Conversation Practice', short: 'Speak' },
};

const FALLBACK: ItemVisual = {
  icon: <ArticleRounded />,
  color: FOREST,
  tint: tint(FOREST),
  label: 'Resource',
  short: 'Item',
};

export const getItemVisual = (type?: string): ItemVisual =>
  (type && ITEM_VISUALS[type as ItemType]) || FALLBACK;

export const itemIcons: Record<ItemType, React.ReactNode> = Object.fromEntries(
  Object.entries(ITEM_VISUALS).map(([k, v]) => [k, v.icon]),
) as Record<ItemType, React.ReactNode>;

export const itemColors: Record<ItemType, string> = Object.fromEntries(
  Object.entries(ITEM_VISUALS).map(([k, v]) => [k, v.color]),
) as Record<ItemType, string>;

export const itemLabels: Record<ItemType, string> = Object.fromEntries(
  Object.entries(ITEM_VISUALS).map(([k, v]) => [k, v.label]),
) as Record<ItemType, string>;

/** Rounded icon tile used across lists, headers and cards. */
export const ItemIconTile: React.FC<{
  type?: string;
  size?: number;
  radius?: number;
}> = ({ type, size = 40, radius = 12 }) => {
  const v = getItemVisual(type);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: v.tint,
        color: v.color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: `1px solid ${v.color}22`,
        flexShrink: 0,
      }}
      aria-hidden
    >
      <span style={{ display: 'flex', fontSize: size * 0.5 }}>{v.icon}</span>
    </div>
  );
};
