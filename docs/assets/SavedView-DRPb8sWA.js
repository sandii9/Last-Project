import{B as n,r as l,u as c,g as p}from"./index-DoZk3hUd.js";class g extends n{mount(){const d=this.html`
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
    `;this.mountDom(d);const r=this.outlet.querySelector("#list"),s=async()=>{const e=await p();r.innerHTML="",e.sort((a,t)=>t.savedAt-a.savedAt).forEach(a=>{const t=document.createElement("article");t.className="card",t.innerHTML=`
          <img src="${a.photoUrl}" alt="Foto ${a.name||""}" />
          <div>
            <strong>${a.name||"(Tanpa nama)"}</strong>
            <p>${a.description||""}</p>
            <label class="muted">Catatan (opsional)</label>
            <textarea data-note="${a.storyId}" placeholder="Tulis catatan...">${a.note||""}</textarea>
            <div class="actions">
              <button class="btn alt" data-save-note="${a.storyId}">Simpan Catatan</button>
              <button class="btn alt" data-remove="${a.storyId}">Hapus dari tersimpan</button>
            </div>
          </div>
        `,r.appendChild(t)})};s(),this.outlet.addEventListener("click",async e=>{const a=e.target.closest("[data-remove]"),t=e.target.closest("[data-save-note]");if(a)await l(a.dataset.remove),this.toast("Dihapus dari tersimpan"),s();else if(t){const o=t.dataset.saveNote,i=this.outlet.querySelector(`textarea[data-note="${o}"]`);await c(o,{note:i.value}),this.toast("Catatan disimpan")}})}}export{g as SavedView};
