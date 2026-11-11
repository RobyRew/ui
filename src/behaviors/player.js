/* GlassPlayer transport.
 *
 * With data-media="<selector>" pointing at an <audio> or <video>, the player
 * drives it: play/pause, scrubbing, a restart on Previous after the first 3
 * seconds, and elapsed/remaining time. It also publishes the track to the
 * Media Session API, so the lock screen, Control Center, headphones and the
 * Now Playing view on a paired watch show the title and answer the buttons.
 *
 * Without a media element the controls are presentational: they flip the
 * visual state and dispatch events for the page to act on —
 * `rw:play`, `rw:pause`, `rw:prev`, `rw:next` and `rw:seek` (detail: { value },
 * 0–100) on the player element.
 */
import { enablePressStates, registry } from './core.js';

const claim = registry();

const fmt = (s) => {
  if (!Number.isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, '0')}`;
};

function bindPlayer(el) {
  if (!claim(el)) return;
  const play = el.querySelector('[data-rw-cmd="toggle"]');
  const prev = el.querySelector('[data-rw-cmd="prev"]');
  const next = el.querySelector('[data-rw-cmd="next"]');
  const seek = el.querySelector('input.rw-player__seek');
  const bar = el.querySelector('.rw-player__bar');
  const fill = bar?.querySelector('i');
  const elapsed = el.querySelector('[data-rw-elapsed]');
  const remaining = el.querySelector('[data-rw-remaining]');
  const sel = el.getAttribute('data-media');
  const media = sel ? document.querySelector(sel) : null;
  const labels = {
    play: play?.getAttribute('data-label-play') ?? 'Play',
    pause: play?.getAttribute('data-label-pause') ?? 'Pause',
  };
  const emit = (name, detail) => el.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));

  const setPlaying = (on) => {
    el.classList.toggle('is-playing', on);
    if (play) {
      play.textContent = on ? '⏸' : '⏵';
      play.setAttribute('aria-label', on ? labels.pause : labels.play);
    }
  };
  const setProgress = (pct) => {
    const p = Math.min(100, Math.max(0, pct || 0));
    if (fill instanceof HTMLElement) fill.style.setProperty('--rw-pct', `${p}%`);
    bar?.setAttribute('aria-valuenow', String(Math.round(p)));
    if (seek instanceof HTMLInputElement && document.activeElement !== seek) {
      seek.value = String(p);
      seek.style.setProperty('--rw-pct', `${p}%`);
    }
  };

  if (media instanceof HTMLMediaElement) {
    const time = () => {
      const d = media.duration;
      setProgress(d ? (media.currentTime / d) * 100 : 0);
      if (elapsed) elapsed.textContent = fmt(media.currentTime);
      if (remaining) remaining.textContent = Number.isFinite(d) ? `-${fmt(d - media.currentTime)}` : '';
    };
    media.addEventListener('play', () => { setPlaying(true); publish(); });
    media.addEventListener('pause', () => setPlaying(false));
    media.addEventListener('ended', () => setPlaying(false));
    media.addEventListener('timeupdate', time);
    media.addEventListener('loadedmetadata', time);
    media.addEventListener('durationchange', time);
    play?.addEventListener('click', () => { if (media.paused) media.play().catch(() => {}); else media.pause(); });
    prev?.addEventListener('click', () => { if (media.currentTime > 3) media.currentTime = 0; else emit('rw:prev'); });
    next?.addEventListener('click', () => emit('rw:next'));
    seek?.addEventListener('input', () => {
      const v = Number(/** @type {HTMLInputElement} */ (seek).value);
      /** @type {HTMLInputElement} */ (seek).style.setProperty('--rw-pct', `${v}%`);
      if (media.duration) media.currentTime = (v / 100) * media.duration;
    });
    setPlaying(!media.paused);
    time();

    function publish() {
      if (!('mediaSession' in navigator) || typeof MediaMetadata === 'undefined') return;
      const img = el.querySelector('.rw-player__art img');
      navigator.mediaSession.metadata = new MediaMetadata({
        title: el.querySelector('.rw-player__title')?.textContent ?? '',
        artist: el.querySelector('.rw-player__sub')?.textContent ?? '',
        artwork: img instanceof HTMLImageElement && img.currentSrc ? [{ src: img.currentSrc }] : [],
      });
      const handlers = {
        play: () => media.play().catch(() => {}),
        pause: () => media.pause(),
        previoustrack: () => prev?.click(),
        nexttrack: () => next?.click(),
        seekto: (d) => { if (d.seekTime != null) media.currentTime = d.seekTime; },
      };
      for (const [action, fn] of Object.entries(handlers)) {
        try { navigator.mediaSession.setActionHandler(/** @type {MediaSessionAction} */ (action), fn); } catch { /* action not supported here */ }
      }
    }
  } else {
    play?.addEventListener('click', () => {
      const on = !el.classList.contains('is-playing');
      setPlaying(on);
      emit(on ? 'rw:play' : 'rw:pause');
    });
    prev?.addEventListener('click', () => emit('rw:prev'));
    next?.addEventListener('click', () => emit('rw:next'));
    seek?.addEventListener('input', () => {
      const v = Number(/** @type {HTMLInputElement} */ (seek).value);
      /** @type {HTMLInputElement} */ (seek).style.setProperty('--rw-pct', `${v}%`);
      emit('rw:seek', { value: v });
    });
  }
}

export function initPlayers(root = document) {
  enablePressStates();
  for (const el of root.querySelectorAll('[data-rw-player]')) bindPlayer(el);
}
