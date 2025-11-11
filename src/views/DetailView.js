
export default class DetailView {
  constructor(outlet){ this.outlet = outlet; }
  renderLoading(){ this.outlet.innerHTML = '<p aria-live="polite">Memuat detail...</p>'; }
  renderError(msg){ this.outlet.innerHTML = `<p role="alert">${msg}</p>`; }
  render(item){
    this.outlet.innerHTML = `
      <article class="story-detail" data-id="${item.id}">
        <a href="#/home" aria-label="Kembali">← Kembali</a>
        <h1>${item.name || 'Cerita'}</h1>
        <img src="${item.photoUrl}" alt="Foto cerita" loading="lazy"/>
        <p>${item.description || ''}</p>
        <p><small>${new Date(item.createdAt).toLocaleString()}</small></p>
      </article>`;
  }
}
