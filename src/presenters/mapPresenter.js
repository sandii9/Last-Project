import { MapView } from '../views/MapView.js';
export class MapPresenter {
  constructor(outlet, storyModel){ this.view = new MapView(outlet, this); this.storyModel = storyModel; this.items = []; }
  mount(){ this.view.render(); this.load(); }
  async load(){
    try{ const data = await this.storyModel.list({page:1, size:30, withLocation:true}); this.items = (data.listStory || []).filter(s=> s.lat!=null && s.lon!=null); this.view.drawMap(this.items); }
    catch(err){ this.view.showError(err.message); }
  }
  filterByText(q){ const filtered = this.items.filter(s=> (s.name||'').toLowerCase().includes(q.toLowerCase()) || (s.description||'').toLowerCase().includes(q.toLowerCase())); this.view.drawMap(filtered); }
}