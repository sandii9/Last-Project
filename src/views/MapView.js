import { BaseView } from './BaseView.js';
import L from 'leaflet';
export class MapView extends BaseView {
  constructor(outlet, presenter){ super(outlet); this.presenter = presenter; this.map = null; this.layerGroup = null; }
  render(){
    const frag = this.html`
      <section class="grid" aria-labelledby="mapTitle">
        <div class="card">
          <h1 id="mapTitle">Peta Cerita</h1>
          <p class="muted">Menampilkan marker dari API. Ada filter teks & layer control.</p>
          <div class="row two">
            <label for="filter">Filter teks</label>
            <input id="filter" type="text" placeholder="Cari di nama/desk..." aria-describedby="filterHelp" />
          </div>
          <p id="filterHelp" class="sr-only">Ketik untuk memfilter daftar marker pada peta berdasarkan nama atau deskripsi.</p>
          <div id="map" class="map-embed" role="application" aria-label="Peta interaktif"></div>
          <div id="error" role="alert" aria-live="assertive" class="muted"></div>
        </div>
      </section>`;
    this.mountDom(frag);
    this.outlet.querySelector('#filter').addEventListener('input', (e)=> this.presenter.filterByText(e.target.value));
  }
  drawMap(items){
    if(!this.map){
      this.map = L.map('map', { zoomControl: true, scrollWheelZoom: true }).setView([-2.5, 118], 4.2);
      const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom:19, attribution:'&copy; OpenStreetMap contributors' }).addTo(this.map);
      const toner = L.tileLayer('https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png', { maxZoom:20, attribution:'Tiles by Stamen, Data &copy; OpenStreetMap' });
      const carto = L.tileLayer('https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', { maxZoom:20, attribution:'&copy; Carto, OpenStreetMap' });
      const baseLayers = { 'OpenStreetMap': osm, 'Stamen Toner': toner, 'Carto Light': carto };
      this.layerGroup = L.layerGroup().addTo(this.map);
      L.control.layers(baseLayers, {'Cerita': this.layerGroup}).addTo(this.map);
    }
    this.layerGroup.clearLayers();
    if(!items.length) return;
    const markers = [];
    items.forEach(s=>{
      if(s.lat==null || s.lon==null) return;
      const marker = L.marker([s.lat, s.lon]);
      const safeDesc = (s.description||'').replace(/</g,'&lt;');
      marker.bindPopup(`<strong>${s.name || ''}</strong><br/><em>${safeDesc}</em><br/><img src="${s.photoUrl}" alt="Foto" style="width:160px;height:120px;object-fit:cover;border-radius:8px;margin-top:.5rem;"/>`);
      marker.on('click', ()=> marker.openPopup());
      this.layerGroup.addLayer(marker); markers.push(marker);
    });
    const group = L.featureGroup(markers); this.map.fitBounds(group.getBounds().pad(0.3));
  }
  showError(msg){ const el = this.outlet.querySelector('#error'); el.textContent = msg; el.style.color='var(--danger)'; }
}