import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, LinearProgress, Stack, Typography, alpha } from '@mui/material';
import {
  OpenInNewRounded as OpenInNewIcon,
  RefreshRounded as RefreshIcon,
  ReportGmailerrorredRounded as WarningIcon,
  ContentCopyRounded as CopyIcon,
  ExpandMoreRounded as ExpandIcon,
} from '@mui/icons-material';
import { Chip, Collapse, Divider, IconButton, Tooltip } from '@mui/material';
import { embedProviderLabel, type EmbedInfo } from '@/lib/embed';

/** How long we wait for the frame's load event before showing the fallback. */
const LOAD_TIMEOUT_MS = 9000;

interface EmbedFallbackProps {
  accent: string;
  icon?: React.ReactNode;
  /** Short human explanation of what went wrong. */
  message: string;
  /** Extra hint (e.g. Drive sharing note). */
  hint?: string;
  /** Original resource link, opened in a new tab. */
  openUrl?: string | null;
  onRetry?: () => void;
  /** Embed diagnostics: what we detected and what we actually tried to frame. */
  diagnostics?: {
    provider: EmbedInfo['provider'];
    embedUrl?: string | null;
    reason?: string;
    elapsedMs?: number;
  };
}

function DiagRow({
  label,
  value,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  onCopy?: () => void;
  copied?: boolean;
}) {
  return (
    <Stack direction="row" alignItems="flex-start" spacing={1}>
      <Typography variant="caption" sx={{ minWidth: 88, color: 'text.secondary', fontWeight: 700 }}>
        {label}
      </Typography>
      <Typography variant="caption" sx={{ flex: 1, wordBreak: 'break-all', color: 'text.primary' }}>
        {value}
      </Typography>
      {onCopy && (
        <Tooltip title={copied ? 'Copied' : 'Copy'}>
          <IconButton size="small" onClick={onCopy} aria-label={`Copy ${label.toLowerCase()}`}>
            <CopyIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  );
}

/** Graceful, on-brand state shown whenever an embed can't be displayed. */
export function EmbedFallback({
  accent,
  icon,
  message,
  hint,
  openUrl,
  onRetry,
  diagnostics,
}: EmbedFallbackProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — the URL is visible on screen anyway */
    }
  };

  return (
    <Stack
      alignItems="center"
      spacing={1.5}
      sx={{
        py: { xs: 4, sm: 5 },
        px: 2,
        textAlign: 'center',
        borderRadius: 2,
        border: '1px dashed',
        borderColor: alpha(accent, 0.35),
        bgcolor: alpha(accent, 0.04),
      }}
    >
      <Box
        sx={{
          width: 60,
          height: 60,
          borderRadius: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: alpha(accent, 0.12),
          color: accent,
          '& svg': { fontSize: 30 },
        }}
      >
        {icon || <WarningIcon />}
      </Box>
      <Typography sx={{ fontFamily: '"Sora", "Manrope", sans-serif', fontWeight: 700, fontSize: '1rem' }}>
        {message}
      </Typography>
      {hint && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 460 }}>
          {hint}
        </Typography>
      )}
      {openUrl && (
        <Typography
          variant="caption"
          sx={{
            maxWidth: '100%',
            px: 1.25,
            py: 0.5,
            borderRadius: 999,
            bgcolor: 'action.hover',
            color: 'text.secondary',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontFamily: 'ui-monospace, monospace',
          }}
        >
          {openUrl}
        </Typography>
      )}
      {diagnostics && (
        <Stack spacing={1} sx={{ width: '100%', maxWidth: 520 }}>
          <Stack direction="row" spacing={0.75} justifyContent="center" flexWrap="wrap" sx={{ rowGap: 0.75 }}>
            <Chip
              size="small"
              label={`Detected: ${embedProviderLabel(diagnostics.provider)}`}
              sx={{ bgcolor: alpha(accent, 0.12), color: accent, fontWeight: 600 }}
            />
            {diagnostics.reason && (
              <Chip size="small" variant="outlined" label={diagnostics.reason} sx={{ borderColor: alpha(accent, 0.4) }} />
            )}
            <Button
              size="small"
              endIcon={<ExpandIcon sx={{ transform: showDetails ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />}
              onClick={() => setShowDetails((v) => !v)}
              sx={{ color: 'text.secondary', textTransform: 'none' }}
            >
              {showDetails ? 'Hide details' : 'Technical details'}
            </Button>
          </Stack>
          <Collapse in={showDetails} unmountOnExit>
            <Stack
              spacing={0.75}
              sx={{
                textAlign: 'left',
                p: 1.25,
                borderRadius: 2,
                bgcolor: 'action.hover',
                fontFamily: 'ui-monospace, monospace',
              }}
            >
              <DiagRow label="Provider" value={embedProviderLabel(diagnostics.provider)} />
              <Divider />
              <DiagRow
                label="Embed URL"
                value={diagnostics.embedUrl || '— none resolved —'}
                onCopy={diagnostics.embedUrl ? () => copy(diagnostics.embedUrl!) : undefined}
                copied={copied}
              />
              {openUrl && (
                <>
                  <Divider />
                  <DiagRow label="Original link" value={openUrl} onCopy={() => copy(openUrl)} copied={copied} />
                </>
              )}
              {typeof diagnostics.elapsedMs === 'number' && (
                <>
                  <Divider />
                  <DiagRow label="Waited" value={`${(diagnostics.elapsedMs / 1000).toFixed(1)}s before giving up`} />
                </>
              )}
            </Stack>
          </Collapse>
        </Stack>
      )}
      <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center" sx={{ rowGap: 1 }}>
        {openUrl && (
          <Button
            variant="contained"
            size="small"
            startIcon={<OpenInNewIcon />}
            href={openUrl}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ bgcolor: accent, '&:hover': { bgcolor: accent, filter: 'brightness(0.92)' } }}
          >
            Open resource
          </Button>
        )}
        {onRetry && (
          <Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={onRetry}>
            Retry preview
          </Button>
        )}
      </Stack>
    </Stack>
  );
}

interface EmbedFrameProps {
  embed: EmbedInfo;
  title: string;
  accent: string;
  icon?: React.ReactNode;
  /** Height for document-style frames. Ignored when the embed is a 16:9 video. */
  height?: string | number;
  /** Overrides the "nothing to show" message when no URL could be resolved. */
  emptyMessage?: string;
  /** Original author-supplied link, used as a last-resort open target. */
  fallbackUrl?: string | null;
}

/**
 * Renders a hardened embed iframe (sandboxed, no top-navigation, lazy) with a
 * loading shimmer and a graceful fallback whenever the resource can't resolve,
 * refuses to be framed, or never fires a load event.
 */
export function EmbedFrame({
  embed,
  title,
  accent,
  icon,
  height = 'min(78vh, 720px)',
  emptyMessage = 'This resource can’t be previewed here.',
  fallbackUrl,
}: EmbedFrameProps) {
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [reason, setReason] = useState<string>();
  const timer = useRef<number>();
  const startedAt = useRef<number>(Date.now());
  const [elapsedMs, setElapsedMs] = useState<number>();

  const src = embed.embeddable ? embed.url : null;
  const openUrl = embed.openUrl || fallbackUrl || null;

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
    setReason(undefined);
    setElapsedMs(undefined);
    startedAt.current = Date.now();
    if (!src) return;
    timer.current = window.setTimeout(() => {
      setElapsedMs(Date.now() - startedAt.current);
      setReason('Load timed out');
      setFailed(true);
    }, LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(timer.current);
  }, [src, attempt]);

  const handleLoaded = () => {
    window.clearTimeout(timer.current);
    setLoaded(true);
    setFailed(false);
  };

  const retry = () => setAttempt((a) => a + 1);

  if (!src) {
    return (
      <EmbedFallback
        accent={accent}
        icon={icon}
        message={emptyMessage}
        hint={embed.note}
        openUrl={openUrl}
        diagnostics={{
          provider: embed.provider,
          embedUrl: embed.url,
          reason: embed.embeddable ? 'No embed URL resolved' : 'Source not embeddable',
        }}
      />
    );
  }

  if (failed && !loaded) {
    return (
      <EmbedFallback
        accent={accent}
        icon={icon}
        message="Preview didn’t load"
        hint={
          embed.note ||
          'The provider may block embedding, or the link may need “Anyone with the link” sharing. You can still open it directly.'
        }
        openUrl={openUrl}
        onRetry={retry}
        diagnostics={{
          provider: embed.provider,
          embedUrl: src,
          reason: reason || 'Frame error',
          elapsedMs,
        }}
      />
    );
  }

  const frame = (
    <iframe
      key={attempt}
      src={src}
      title={title}
      onLoad={handleLoaded}
      onError={() => {
        window.clearTimeout(timer.current);
        setElapsedMs(Date.now() - startedAt.current);
        setReason('Frame reported an error');
        setFailed(true);
      }}
      sandbox={embed.iframe.sandbox}
      referrerPolicy={embed.iframe.referrerPolicy}
      loading={embed.iframe.loading}
      allow={embed.iframe.allow}
      allowFullScreen={embed.iframe.allowFullScreen}
      style={
        embed.isVideo
          ? { position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }
          : { width: '100%', height: '100%', border: 'none', display: 'block' }
      }
    />
  );

  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'var(--hairline)',
        boxShadow: 'var(--shadow-md)',
        bgcolor: embed.isVideo ? 'black' : 'background.paper',
        ...(embed.isVideo ? { paddingTop: '56.25%' } : { height }),
      }}
    >
      {!loaded && (
        <LinearProgress
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 2,
            height: 3,
            '& .MuiLinearProgress-bar': { bgcolor: accent },
          }}
        />
      )}
      {frame}
    </Box>
  );
}
