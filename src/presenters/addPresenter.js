import { AddStoryView } from '../views/AddStoryView.js';
export class AddPresenter {
  constructor(outlet, storyModel){ this.view = new AddStoryView(outlet, this); this.storyModel = storyModel; this.lat = null; this.lon = null; this.capturedBlob = null; }
  mount(){ this.view.render(); }
  setLatLng(lat, lon){ this.lat = lat; this.lon = lon; this.view.syncLatLng(lat, lon); }
  setCapturedBlob(blob){ this.capturedBlob = blob; }
  async onSubmit({description, fileInput}){
    try {
      let photoBlob = this.capturedBlob;
      if (!photoBlob){ if (!fileInput.files[0]) throw new Error('Pilih gambar atau gunakan kamera.'); photoBlob = fileInput.files[0]; }
      await this.storyModel.add({description, photoBlob, lat:this.lat, lon:this.lon});
      this.view.toast('Berhasil menambahkan story.'); location.hash = '#/home';
    } catch(err){ this.view.showError(err.message); }
  }
}