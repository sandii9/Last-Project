import { BaseView } from './BaseView.js';
import { getSavedStories, removeSaved, updateSaved } from '../utils/idb.js';

export class SavedView extends BaseView {
  mount() {
    const frag = this.html`
      <section class="panel" aria-labelledby="title">
        <h1 id="title">Cerita tersimpan</h1>
        <p class="muted">Cerita yang kamu simpan dari beranda (disimpan di <code>IndexedDB</code>).</p>
        <div id="list" class="list" role="list"></div>
      </section>
      <style>
        .panel{max-width:980px;margin:2rem auto;padding:1rem 1.25rem;border:1px solid #223;border-radius:16px;background:linear-gradient(180deg,#0d1327,#0b1020)}
        .list{display:grid;gap:.75rem;margin-top:1rem}
        .card{border:1px solid #223;border-radius:12px;padding:.75rem;background:#0e1430;display:grid;grid-template-columns:92px 1fr;gap:12px}
        .actions{display:flex;gap:.5rem;margin-top:.5rem}
        .btn{background:#0ea5e9;border:1px solid #0ea5e9;color:#fff;border-radius:10px;padding:.4rem .6rem;cursor:pointer}
        .btn.alt{background:transparent;border-color:#2a3b7a;color:var(--text)}
        img{width:92px;height:92px;object-fit:cover;border-radius:12px}
        textarea{width:100%;min-height:64px;padding:.5rem;border-radius:8px;border:1px solid #26314f;background:#0e1430;color:var(--text)}
      </style>
    `;
    this.mountDom(frag);
    const list = this.outlet.querySelector('#list');

    const render = async () => {
      const items = await getSavedStories();
      list.innerHTML = '';
      items.sort((a,b) => b.savedAt - a.savedAt).forEach(item => {
        const card = document.createElement('article');
        card.className = 'card';
        card.innerHTML = `
          <img src="${item.photoUrl}" alt="Foto ${item.name || ''}" />
          <div>
            <strong>${item.name || '(Tanpa nama)'}</strong>
            <p>${item.description || ''}</p>
            <label class="muted">Catatan (opsional)</label>
            <textarea data-note="${item.storyId}" placeholder="Tulis catatan...">${item.note || ''}</textarea>
            <div class="actions">
              <button class="btn alt" data-save-note="${item.storyId}">Simpan Catatan</button>
              <button class="btn alt" data-remove="${item.storyId}">Hapus dari tersimpan</button>
            </div>
          </div>
        `;
        list.appendChild(card);
      });
    };
    render();

    this.outlet.addEventListener('click', async (e) => {
      const rm = e.target.closest('[data-remove]');
      const sn = e.target.closest('[data-save-note]');
      if (rm) {
        await removeSaved(rm.dataset.remove);
        this.toast('Dihapus dari tersimpan');
        render();
      } else if (sn) {
        const id = sn.dataset.saveNote;
        const ta = this.outlet.querySelector(`textarea[data-note="${id}"]`);
        await updateSaved(id, { note: ta.value });
        this.toast('Catatan disimpan');
      }
    });
  }
}
