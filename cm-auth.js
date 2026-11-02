/* cm-auth.js — dipakai bersama oleh Wawa.html dan Gallery.html.
   Memakai sesi login dari AbsensiKu (disimpan di localStorage "absensiku_sb_session").
   SYARAT: AbsensiKu, Wawa, dan Gallery harus berada di domain yang sama (satu website). */
(function () {
  const URL = 'https://iumyrilzfxdgopfbygog.supabase.co';
  const KEY = 'sb_publishable_LaYIcx2yN9sM4-esZ_46yw_tggCMS07';
  const SESSION_KEY = 'absensiku_sb_session';
  const MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  window.cmEsc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => MAP[c]);

  const client = window.supabase.createClient(URL, KEY, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  window.CM_AUTH_CLIENT = client;

  async function fresh() {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch (e) { }
    if (!s || !s.access_token || !s.refresh_token) return null;
    if (Date.now() >= s.expires_at) {
      try {
        const r = await fetch(URL + '/auth/v1/token?grant_type=refresh_token', { method: 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: s.refresh_token }) });
        if (!r.ok) { localStorage.removeItem(SESSION_KEY); return null; }
        const d = await r.json();
        s = { access_token: d.access_token, refresh_token: d.refresh_token, expires_at: Date.now() + Math.max(60, (d.expires_in || 3600) - 30) * 1000, user_id: (d.user && d.user.id) || s.user_id };
        localStorage.setItem(SESSION_KEY, JSON.stringify(s));
      } catch (e) { return null; }
    }
    return s;
  }

  // Halaman publik menunggu ini sebelum membaca sesi. Pengunjung tanpa login tetap jadi pengunjung biasa.
  window.CM_AUTH_READY = (async () => {
    try { const s = await fresh(); if (s) await client.auth.setSession({ access_token: s.access_token, refresh_token: s.refresh_token }); }
    catch (e) { console.warn('Sesi AbsensiKu tidak dapat dipakai:', e && e.message); }
  })();
})();
