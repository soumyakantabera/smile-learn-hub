/**
 * Embed URL normalisation for every resource type the LMS supports.
 *
 * Authors paste whatever link they have (a YouTube watch link, a Drive "share"
 * link, a Docs edit link). These helpers turn that into a URL that actually
 * renders inside an <iframe>, so embedding "just works" in both editor previews
 * and the learner viewer.
 */

import type { ItemType } from '@/types/content';

export type EmbedProvider =
  | 'youtube'
  | 'vimeo'
  | 'google-drive'
  | 'google-doc'
  | 'google-sheet'
  | 'google-slide'
  | 'gview'
  | 'direct'
  | 'unknown';

/** Attributes every embed iframe should carry (security + performance). */
export interface EmbedIframeAttrs {
  sandbox: string;
  referrerPolicy: 'strict-origin-when-cross-origin';
  loading: 'lazy';
  allow: string;
  allowFullScreen: boolean;
}

const VIDEO_ALLOW =
  'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen';
const DOC_ALLOW = 'fullscreen';

/**
 * Shared sandbox allowlist. `allow-same-origin` is required for Google's viewers
 * and YouTube to run at all; popups are allowed so "open in new tab" links
 * inside an embed escape the frame instead of dying silently. Notably absent:
 * `allow-top-navigation`, so an embed can never hijack the LMS page.
 */
const SANDBOX =
  'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms allow-presentation allow-downloads';

export function iframeAttrs(isVideo: boolean): EmbedIframeAttrs {
  return {
    sandbox: SANDBOX,
    referrerPolicy: 'strict-origin-when-cross-origin',
    loading: 'lazy',
    allow: isVideo ? VIDEO_ALLOW : DOC_ALLOW,
    allowFullScreen: true,
  };
}

export interface EmbedInfo {
  /** URL safe to put in an iframe src, or null when the link can't be embedded. */
  url: string | null;
  provider: EmbedProvider;
  /** True when the frame should keep a 16:9 ratio (video). */
  isVideo: boolean;
  /** Best link to open in a new tab. */
  openUrl: string | null;
  /** Human hint shown under the field in the editor. */
  note?: string;
  /** False when the link must be opened in a new tab instead of framed. */
  embeddable: boolean;
  /** Attributes to spread onto the iframe element. */
  iframe: EmbedIframeAttrs;
}

const clean = (raw?: string | null) => (raw || '').trim();

/** Fills in the security attributes + embeddable flag for a partial result. */
function embed(info: Omit<EmbedInfo, 'embeddable' | 'iframe'>): EmbedInfo {
  return {
    ...info,
    embeddable: Boolean(info.url) && info.provider !== 'unknown',
    iframe: iframeAttrs(info.isVideo),
  };
}


/* ------------------------------------------------------------------ YouTube */

export function getYouTubeId(raw?: string | null): string | null {
  const url = clean(raw);
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com|youtube-nocookie\.com)\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/|live\/)([\w-]{11})/i,
    /youtu\.be\/([\w-]{11})/i,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  // A bare 11-char id pasted on its own
  if (/^[\w-]{11}$/.test(url)) return url;
  return null;
}

export function getVimeoId(raw?: string | null): string | null {
  const url = clean(raw);
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  return m ? m[1] : null;
}

function youTubeStart(raw: string): number | null {
  const m = raw.match(/[?&](?:t|start)=(\d+)/);
  if (m) return Number(m[1]);
  const hms = raw.match(/[?&]t=(?:(\d+)m)?(\d+)s/);
  if (hms) return Number(hms[1] || 0) * 60 + Number(hms[2]);
  return null;
}

/* ------------------------------------------------------------- Google Drive */

/** Extracts the file/document id from any Drive, Docs, Sheets or Slides link. */
export function getGoogleFileId(raw?: string | null): string | null {
  const url = clean(raw);
  if (!url) return null;
  const patterns = [
    /\/(?:file|document|spreadsheets|presentation)\/d\/([\w-]{10,})/i, // /file/d/ID/view
    /\/(?:folders)\/([\w-]{10,})/i,
    /[?&]id=([\w-]{10,})/i, // open?id=ID  or  uc?id=ID
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

function googleKind(url: string): EmbedProvider | null {
  if (/docs\.google\.com\/document/i.test(url)) return 'google-doc';
  if (/docs\.google\.com\/spreadsheets/i.test(url)) return 'google-sheet';
  if (/docs\.google\.com\/presentation/i.test(url)) return 'google-slide';
  if (/drive\.google\.com/i.test(url)) return 'google-drive';
  return null;
}

const GVIEW = 'https://docs.google.com/gview?url=';
const OFFICE = 'https://view.officeapps.live.com/op/embed.aspx?src=';

/* ---------------------------------------------------------------- Resolvers */

/** Normalises any video link (YouTube / Vimeo / direct file). */
export function resolveVideoEmbed(raw?: string | null): EmbedInfo {
  const url = clean(raw);
  if (!url) return { url: null, provider: 'unknown', isVideo: true, openUrl: null };

  const yt = getYouTubeId(url);
  if (yt) {
    const start = youTubeStart(url);
    const params = new URLSearchParams({ rel: '0', modestbranding: '1', playsinline: '1' });
    if (start) params.set('start', String(start));
    return {
      url: `https://www.youtube-nocookie.com/embed/${yt}?${params.toString()}`,
      provider: 'youtube',
      isVideo: true,
      openUrl: `https://www.youtube.com/watch?v=${yt}`,
      note: 'YouTube video detected — embed link generated automatically.',
    };
  }

  const vimeo = getVimeoId(url);
  if (vimeo) {
    return {
      url: `https://player.vimeo.com/video/${vimeo}`,
      provider: 'vimeo',
      isVideo: true,
      openUrl: `https://vimeo.com/${vimeo}`,
      note: 'Vimeo video detected — embed link generated automatically.',
    };
  }

  // Google Drive hosted video files preview fine in an iframe.
  const driveId = getGoogleFileId(url);
  if (driveId && /drive\.google\.com/i.test(url)) {
    return {
      url: `https://drive.google.com/file/d/${driveId}/preview`,
      provider: 'google-drive',
      isVideo: true,
      openUrl: `https://drive.google.com/file/d/${driveId}/view`,
      note: 'Google Drive video detected. Set sharing to “Anyone with the link”.',
    };
  }

  if (/^https?:\/\//i.test(url)) {
    return { url, provider: 'direct', isVideo: true, openUrl: url };
  }
  return { url: null, provider: 'unknown', isVideo: true, openUrl: null, note: 'Not a recognised video link.' };
}

/** Normalises any document link (Drive, Docs/Sheets/Slides, raw PDF/Office file). */
export function resolveDocumentEmbed(raw?: string | null, type?: ItemType): EmbedInfo {
  const url = clean(raw);
  if (!url) return { url: null, provider: 'unknown', isVideo: false, openUrl: null };

  const kind = googleKind(url);
  const id = getGoogleFileId(url);

  if (kind && id) {
    if (kind === 'google-drive') {
      return {
        url: `https://drive.google.com/file/d/${id}/preview`,
        provider: 'google-drive',
        isVideo: false,
        openUrl: `https://drive.google.com/file/d/${id}/view`,
        note: 'Google Drive file detected. Set sharing to “Anyone with the link” so learners can view it.',
      };
    }
    const base =
      kind === 'google-doc'
        ? `https://docs.google.com/document/d/${id}`
        : kind === 'google-sheet'
          ? `https://docs.google.com/spreadsheets/d/${id}`
          : `https://docs.google.com/presentation/d/${id}`;
    return {
      url: kind === 'google-slide' ? `${base}/embed?start=false&loop=false` : `${base}/preview`,
      provider: kind,
      isVideo: false,
      openUrl: `${base}/view`,
      note: 'Google Workspace file detected — preview link generated automatically.',
    };
  }

  if (/^https?:\/\//i.test(url)) {
    const isOffice = /\.(docx?|xlsx?|pptx?)($|\?)/i.test(url);
    if (isOffice || type === 'doc' || type === 'ppt' || type === 'spreadsheet') {
      return {
        url: `${isOffice ? OFFICE : GVIEW}${encodeURIComponent(url)}${isOffice ? '' : '&embedded=true'}`,
        provider: 'gview',
        isVideo: false,
        openUrl: url,
      };
    }
    // PDFs and everything else: Google's viewer handles it, and browsers can
    // render a same-origin PDF natively.
    return {
      url: `${GVIEW}${encodeURIComponent(url)}&embedded=true`,
      provider: 'gview',
      isVideo: false,
      openUrl: url,
    };
  }

  return { url: null, provider: 'unknown', isVideo: false, openUrl: null, note: 'Not a recognised document link.' };
}

/**
 * One entry point used by the viewer and the editor preview.
 * `embedUrl` (if the author typed one) wins, but is still normalised.
 */
export function resolveEmbed(
  type: ItemType,
  url?: string | null,
  embedUrl?: string | null,
): EmbedInfo {
  const preferred = clean(embedUrl) || clean(url);
  if (type === 'youtube' || type === 'video') return resolveVideoEmbed(preferred);
  if (type === 'pdf' || type === 'doc' || type === 'ppt' || type === 'spreadsheet') {
    return resolveDocumentEmbed(preferred, type);
  }
  return {
    url: preferred || null,
    provider: preferred ? 'direct' : 'unknown',
    isVideo: false,
    openUrl: preferred || null,
  };
}
