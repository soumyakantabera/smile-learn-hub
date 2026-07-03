import { useEffect, useState, useCallback, useRef } from 'react';

/**
 * Wrapper around the browser SpeechSynthesis API.
 * Voice list loads asynchronously in Chrome via the `voiceschanged` event.
 */
export function useTTS() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const queueRef = useRef<SpeechSynthesisUtterance[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    setSupported(true);
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.addEventListener('voiceschanged', load);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load);
  }, []);

  const speak = useCallback(
    (
      text: string,
      opts?: { voiceURI?: string; lang?: string; rate?: number; pitch?: number; onEnd?: () => void },
    ) => {
      if (!supported || !text.trim()) {
        opts?.onEnd?.();
        return;
      }
      const u = new SpeechSynthesisUtterance(text);
      if (opts?.voiceURI) {
        const v = voices.find((v) => v.voiceURI === opts.voiceURI);
        if (v) u.voice = v;
      }
      if (opts?.lang) u.lang = opts.lang;
      else if (u.voice) u.lang = u.voice.lang;
      if (opts?.rate) u.rate = Math.max(0.5, Math.min(2, opts.rate));
      if (opts?.pitch) u.pitch = Math.max(0.5, Math.min(2, opts.pitch));
      u.onstart = () => setSpeaking(true);
      u.onend = () => {
        setSpeaking(false);
        opts?.onEnd?.();
      };
      u.onerror = () => {
        setSpeaking(false);
        opts?.onEnd?.();
      };
      window.speechSynthesis.speak(u);
    },
    [supported, voices],
  );

  const cancel = useCallback(() => {
    if (!supported) return;
    queueRef.current = [];
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  return { supported, voices, speaking, speak, cancel };
}
