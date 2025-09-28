import React from "react";

export const LIVE_STORE = (code) => `qh_live_${code}`;

// Ako si dodavao sobni heder (preporuka: X-Live-Room), ovo ga postavlja
export function setLiveHeader(code) {
  if (window.axios) {
    window.axios.defaults.headers.common['X-Live-Room'] = code;
  }
  // (opciono) cache-uj i u storage, čisto informativno
  try { localStorage.setItem(LIVE_STORE(code), JSON.stringify({ active: true })); } catch {}
}

export function clearLiveHeader(code) {
  if (window.axios) {
    delete window.axios.defaults.headers.common['X-Live-Room'];
  }
  try { localStorage.removeItem(LIVE_STORE(code)); } catch {}
}

// Ako si nekada stavljao live polja u auth objekt (npr. auth.quiz ili auth.roomToken)
export function stripLiveFromAuth() {
  try {
    const raw = localStorage.getItem('auth');
    if (!raw) return;
    const a = JSON.parse(raw);
    delete a.quiz;        // npr. { quiz: ... }
    delete a.roomToken;   // npr. { roomToken: ... }
    localStorage.setItem('auth', JSON.stringify(a));
  } catch {}
}