import { BaseView } from './BaseView.js';
import { saveStory, isSaved } from '../utils/idb.js';

export class HomeView extends BaseView {
  constructor(outlet, presenter) {
    super(outlet);
    this.presenter = presenter;
  }

  render() {
    const frag = this.html`
      <section class="grid" aria-labelledby="homeTitle">
        <div class="card">
          <h1 id="homeTitle">Beranda</h1>
          <p class="muted">Daftar cerita dari API.</p>
          <div id="list" class="stories" role="list"></div>
          <button class="btn" id="nextBtn">Muat lebih banyak</button>
          <div id="error" role="alert" aria-live="assertive" class="muted"></div>
        </div>
      </section>`;
    this.mountDom(frag);

    const next = this.outlet.querySelector('#nextBtn');
    if (next) next.addEventListener('click', () => this.presenter.onNextPage());
  }

  async updateList(items) {
    const list = this.outlet.querySelector('#list');
    if (!list) return;               // guard kalau render belum selesai
    if (!Array.isArray(items)) return;

    // Reset list agar tidak dobel saat refresh
    list.innerHTML = '';

    for (const s of items) {
      const el = document.createElement('article');
      el.className = 'story';
      el.setAttribute('role', 'listitem');

      const date = new Date(s.createdAt).toLocaleString('id-ID');

      el.innerHTML = `
        <img src="${s.photoUrl}" alt="Foto dari ${s.name || 'pengguna'}" loading="lazy" />
        <div>
          <h3 style="margin:.25rem 0;">${s.name || '—'}</h3>
          <p>${s.description || ''}</p>
          <p class="muted" aria-label="Waktu dibuat">${date}</p>
          <div class="actions">
            <button class="btn alt" data-save="${s.id}">Simpan</button>
          </div>
        </div>
      `;
      list.appendChild(el);

      // Logika simpan / disable kalau sudah tersimpan
      const btn = el.querySelector('[data-save]');
      if (btn) {
        try {
          const exists = await isSaved(String(s.id));
          if (exists) {
            btn.textContent = 'Tersimpan ✓';
            btn.disabled = true;
          }

          btn.addEventListener('click', async () => {
            try {
              await saveStory({
                storyId: String(s.id),
                name: s.name,
                description: s.description,
                photoUrl: s.photoUrl,
                createdAt: s.createdAt,
              });
              btn.textContent = 'Tersimpan ✓';
              btn.disabled = true;
              this.toast('Disimpan ke "Cerita tersimpan"');
            } catch (e) {
              console.error(e);
              this.toast('Gagal menyimpan (IndexedDB)', 'error');
            }
          });
        } catch (err) {
          console.error('IndexedDB error:', err);
        }
      }
    }
  }

  showError(msg) {
    const el = this.outlet.querySelector('#error');
    if (!el) return;
    el.textContent = msg;
    el.style.color = 'var(--danger)';
  }
}