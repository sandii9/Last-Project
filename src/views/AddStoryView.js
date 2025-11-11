import { BaseView } from './BaseView.js';
import L from 'leaflet';
export class AddStoryView extends BaseView {
  constructor(outlet, presenter){ super(outlet); this.presenter = presenter; this.stream = null; }
  render(){
    const frag = this.html`
      <section class="grid" aria-labelledby="addTitle">
        <div class="card">
          <h1 id="addTitle">Tambah Cerita</h1>
          <p class="muted">Pilih koordinat dengan klik pada peta, lalu unggah gambar atau gunakan kamera.</p>
          <form id="form" class="grid" novalidate>
            <div>
              <label for="description">Deskripsi</label>
              <textarea id="description" name="description" rows="3" required placeholder="Tuliskan deskripsi..."></textarea>
            </div>
            <div class="row two">
              <div>
                <label for="photo">Gambar (upload)</label>
                <input id="photo" name="photo" type="file" accept="image/*" />
              </div>
              <div>
                <label for="cameraBtn">Atau gunakan kamera</label><br/>
                <button class="btn" id="cameraBtn" type="button">Buka Kamera</button>
                <button class="btn danger" id="stopCamBtn" type="button" hidden>Matikan Kamera</button>
              </div>
            </div>
            <div class="grid cols-2">
              <div>
                <video id="video" width="100%" style="max-height:240px;border-radius:12px;" autoplay playsinline muted hidden></video>
                <canvas id="canvas" width="0" height="0" class="sr-only" aria-hidden="true"></canvas>
                <div class="row two">
                  <button class="btn" id="captureBtn" type="button" hidden>Ambil Foto</button>
                  <span id="captureInfo" class="muted"></span>
                </div>
              </div>
              <div>
                <label for="mapPick">Pilih lokasi pada peta</label>
                <div id="mapPick" class="map-embed" role="application" aria-label="Peta pemilih lokasi"></div>
                <div class="row two">
                  <div><label for="lat">Latitude</label><input id="lat" name="lat" type="text" readonly aria-readonly="true" /></div>
                  <div><label for="lon">Longitude</label><input id="lon" name="lon" type="text" readonly aria-readonly="true" /></div>
                </div>
              </div>
            </div>
            <div class="row two">
              <button class="btn primary" type="submit">Kirim</button>
              <a href="#/home" class="btn">Batal</a>
            </div>
            <div id="error" role="alert" aria-live="assertive" class="muted"></div>
          </form>
        </div>
      </section>`;
    this.mountDom(frag);

    const map = L.map('mapPick').setView([-2.5,118], 4.5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom:19, attribution:'&copy; OpenStreetMap' }).addTo(map);
    let pickMarker = null;
    map.on('click', (e)=>{
      const {lat, lng} = e.latlng;
      if(pickMarker) pickMarker.setLatLng([lat,lng]); else pickMarker = L.marker([lat,lng]).addTo(map);
      this.presenter.setLatLng(lat.toFixed(6), lng.toFixed(6));
    });

    const cameraBtn = this.outlet.querySelector('#cameraBtn');
    const stopCamBtn = this.outlet.querySelector('#stopCamBtn');
    const captureBtn = this.outlet.querySelector('#captureBtn');
    const video = this.outlet.querySelector('#video');
    const canvas = this.outlet.querySelector('#canvas');
    const captureInfo = this.outlet.querySelector('#captureInfo');

    const startCam = async ()=>{
      try{
        this.stream = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:'environment' }, audio:false });
        video.srcObject = this.stream; video.hidden = false; captureBtn.hidden = false; stopCamBtn.hidden = false; cameraBtn.hidden = true;
      } catch(err){ this.showError('Tidak dapat mengakses kamera: ' + err.message); }
    };
    const stopCam = ()=>{
      if(this.stream){ this.stream.getTracks().forEach(t=> t.stop()); this.stream = null; }
      video.hidden = true; captureBtn.hidden = true; stopCamBtn.hidden = true; cameraBtn.hidden = false; captureInfo.textContent = '';
    };
    const capture = ()=>{
      const w = video.videoWidth, h = video.videoHeight;
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d'); ctx.drawImage(video, 0, 0, w, h);
      canvas.toBlob((blob)=>{ if(blob){ this.presenter.setCapturedBlob(blob); captureInfo.textContent = 'Foto ditangkap dari kamera (siap dikirim).'; this.toast('Foto dari kamera tersimpan (sementara).'); }}, 'image/jpeg', .9);
    };

    cameraBtn.addEventListener('click', startCam);
    stopCamBtn.addEventListener('click', stopCam);
    captureBtn.addEventListener('click', capture);

    const form = this.outlet.querySelector('#form');
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const desc = form.description.value.trim();
      if(!desc){ this.showError('Deskripsi wajib diisi.'); return; }
      if(!this.presenter.lat || !this.presenter.lon){ this.showError('Silakan pilih lokasi di peta dengan klik.'); return; }
      this.presenter.onSubmit({description: desc, fileInput: form.photo});
      if(this.stream){ stopCam(); }
    });
    window.addEventListener('hashchange', ()=>{ if(this.stream){ stopCam(); } }, { once: true });
  }
  syncLatLng(lat, lon){ this.outlet.querySelector('#lat').value = lat; this.outlet.querySelector('#lon').value = lon; }
  showError(msg){ const el = this.outlet.querySelector('#error'); el.textContent = msg; el.style.color='var(--danger)'; }
}