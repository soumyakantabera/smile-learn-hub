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
  | 'google-form'
  | 'office-online'
  | 'gview'
  | 'direct'
  | 'unknown';

/** Human-friendly provider names, used in previews and failure diagnostics. */
export const EMBED_PROVIDER_LABELS: Record<EmbedProvider, string> = {
  youtube: 'YouTube',
  vimeo: 'Vimeo',
  'google-drive': 'Google Drive',
  'google-doc': 'Google Docs',
  'google-sheet': 'Google Sheets',
  'google-slide': 'Google Slides',
  'google-form': 'Google Forms',
  'office-online': 'Office Online',
  gview: 'Google Viewer',
  direct: 'Direct link',
  unknown: 'Unrecognised source',
};

export function embedProviderLabel(provider: EmbedProvider): string {
  return EMBED_PROVIDER_LABELS[provider] ?? 'Unknown source';
}

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
  if (/docs\.google\.com\/forms/i.test(url)) return 'google-form';
  if (/docs\.google\.com\/document/i.test(url)) return 'google-doc';
  if (/docs\.google\.com\/spreadsheets/i.test(url)) return 'google-sheet';
  if (/docs\.google\.com\/presentation/i.test(url)) return 'google-slide';
  if (/drive\.google\.com/i.test(url)) return 'google-drive';
  return null;
}

/** True for Google Forms links (both /d/e/<id>/viewform and short forms.gle). */
export function isGoogleFormUrl(raw?: string | null): boolean {
  const url = clean(raw);
  return /docs\.google\.com\/forms\//i.test(url) || /forms\.gle\//i.test(url);
}

/**
 * True for OneDrive / SharePoint / Office Online share links, which Office
 * renders inside an iframe when `action=embedview` is present.
 */
export function isOfficeOnlineUrl(raw?: string | null): boolean {
  const url = clean(raw);
  return (
    /(?:onedrive\.live\.com|1drv\.ms)\//i.test(url) ||
    /[\w-]+\.sharepoint\.com\//i.test(url) ||
    /(?:office\.com|officeapps\.live\.com)\//i.test(url)
  );
}

/** Normalises a Google Forms link into its embeddable viewform URL. */
export function resolveGoogleFormEmbed(raw?: string | null): EmbedInfo {
  const url = clean(raw);
  if (!url) return embed({ url: null, provider: 'unknown', isVideo: false, openUrl: null });

  // forms.gle short links can't be rewritten reliably — frame them as-is.
  let src = url.split('#')[0];
  src = src.replace(/\/(?:edit|viewform|formResponse)(?:\?.*)?$/i, '/viewform');
  if (/docs\.google\.com\/forms\//i.test(src) && !/\/viewform/i.test(src)) {
    src = `${src.replace(/\/$/, '')}/viewform`;
  }
  const embedded = src.includes('?') ? `${src}&embedded=true` : `${src}?embedded=true`;
  return embed({
    url: embedded,
    provider: 'google-form',
    isVideo: false,
    openUrl: src,
    note: 'Google Form detected — responses are accepted directly inside the lesson.',
  });
}

/** Normalises a OneDrive / SharePoint / Office Online link for framing. */
export function resolveOfficeOnlineEmbed(raw?: string | null): EmbedInfo {
  const url = clean(raw);
  if (!url) return embed({ url: null, provider: 'unknown', isVideo: false, openUrl: null });

  let src = url;
  if (/officeapps\.live\.com/i.test(src)) {
    // Already an Office viewer link — make sure it uses the embed endpoint.
    src = src.replace(/\/op\/view\.aspx/i, '/op/embed.aspx');
  } else if (/action=embedview/i.test(src)) {
    // leave as-is
  } else {
    src = src.replace(/([?&])action=(?:default|view|edit)/i, '$1action=embedview');
    if (!/action=embedview/i.test(src)) {
      src = `${src}${src.includes('?') ? '&' : '?'}action=embedview`;
    }
  }
  return embed({
    url: src,
    provider: 'office-online',
    isVideo: false,
    openUrl: url,
    note: 'Office Online file detected. Share it with “Anyone with the link” so learners can open it.',
  });
}

const GVIEW = 'https://docs.google.com/gview?url=';
const OFFICE = 'https://view.officeapps.live.com/op/embed.aspx?src=';

/* ---------------------------------------------------------------- Resolvers */

/** Normalises any video link (YouTube / Vimeo / direct file). */
export function resolveVideoEmbed(raw?: string | null): EmbedInfo {
  const url = clean(raw);
  if (!url) return embed({ url: null, provider: 'unknown', isVideo: true, openUrl: null });

  const yt = getYouTubeId(url);
  if (yt) {
    const start = youTubeStart(url);
    const params = new URLSearchParams({ rel: '0', modestbranding: '1', playsinline: '1' });
    if (start) params.set('start', String(start));
    return embed({
      url: `https://www.youtube-nocookie.com/embed/${yt}?${params.toString()}`,
      provider: 'youtube',
      isVideo: true,
      openUrl: `https://www.youtube.com/watch?v=${yt}`,
      note: 'YouTube video detected — embed link generated automatically.',
    });
  }

  const vimeo = getVimeoId(url);
  if (vimeo) {
    return embed({
      url: `https://player.vimeo.com/video/${vimeo}`,
      provider: 'vimeo',
      isVideo: true,
      openUrl: `https://vimeo.com/${vimeo}`,
      note: 'Vimeo video detected — embed link generated automatically.',
    });
  }

  // Google Drive hosted video files preview fine in an iframe.
  const driveId = getGoogleFileId(url);
  if (driveId && /drive\.google\.com/i.test(url)) {
    return embed({
      url: `https://drive.google.com/file/d/${driveId}/preview`,
      provider: 'google-drive',
      isVideo: true,
      openUrl: `https://drive.google.com/file/d/${driveId}/view`,
      note: 'Google Drive video detected. Set sharing to “Anyone with the link”.',
    });
  }

  if (/^https?:\/\//i.test(url)) {
    return embed({ url, provider: 'direct', isVideo: true, openUrl: url });
  }
  return embed({ url: null, provider: 'unknown', isVideo: true, openUrl: null, note: 'Not a recognised video link.' });
}

/** Normalises any document link (Drive, Docs/Sheets/Slides, raw PDF/Office file). */
export function resolveDocumentEmbed(raw?: string | null, type?: ItemType): EmbedInfo {
  const url = clean(raw);
  if (!url) return embed({ url: null, provider: 'unknown', isVideo: false, openUrl: null });

  if (isGoogleFormUrl(url)) return resolveGoogleFormEmbed(url);
  if (isOfficeOnlineUrl(url)) return resolveOfficeOnlineEmbed(url);

  const kind = googleKind(url);
  const id = getGoogleFileId(url);

  if (kind && id) {
    if (kind === 'google-drive') {
      return embed({
        url: `https://drive.google.com/file/d/${id}/preview`,
        provider: 'google-drive',
        isVideo: false,
        openUrl: `https://drive.google.com/file/d/${id}/view`,
        note: 'Google Drive file detected. Set sharing to “Anyone with the link” so learners can view it.',
      });
    }
    const base =
      kind === 'google-doc'
        ? `https://docs.google.com/document/d/${id}`
        : kind === 'google-sheet'
          ? `https://docs.google.com/spreadsheets/d/${id}`
          : `https://docs.google.com/presentation/d/${id}`;
    return embed({
      url: kind === 'google-slide' ? `${base}/embed?start=false&loop=false` : `${base}/preview`,
      provider: kind,
      isVideo: false,
      openUrl: `${base}/view`,
      note: 'Google Workspace file detected — preview link generated automatically.',
    });
  }

  if (/^https?:\/\//i.test(url)) {
    const isOffice = /\.(docx?|xlsx?|pptx?)($|\?)/i.test(url);
    if (isOffice || type === 'doc' || type === 'ppt' || type === 'spreadsheet') {
      return embed({
        url: `${isOffice ? OFFICE : GVIEW}${encodeURIComponent(url)}${isOffice ? '' : '&embedded=true'}`,
        provider: 'gview',
        isVideo: false,
        openUrl: url,
      });
    }
    // PDFs and everything else: Google's viewer handles it, and browsers can
    // render a same-origin PDF natively.
    return embed({
      url: `${GVIEW}${encodeURIComponent(url)}&embedded=true`,
      provider: 'gview',
      isVideo: false,
      openUrl: url,
    });
  }

  return embed({ url: null, provider: 'unknown', isVideo: false, openUrl: null, note: 'Not a recognised document link.' });
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
  // Google Forms and Office Online links are framed even when saved as a plain
  // link item — they render fine under the same hardened iframe attributes.
  if (isGoogleFormUrl(preferred)) return resolveGoogleFormEmbed(preferred);
  if (isOfficeOnlineUrl(preferred)) return resolveOfficeOnlineEmbed(preferred);
  // Other plain links are never framed — they open in a new tab.
  return {
    ...embed({
      url: preferred || null,
      provider: preferred ? 'direct' : 'unknown',
      isVideo: false,
      openUrl: preferred || null,
    }),
    embeddable: false,
  };
}

