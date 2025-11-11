import { HomeView } from '../views/HomeView.js';
export class HomePresenter {
  constructor(outlet, storyModel){ this.view = new HomeView(outlet, this); this.storyModel = storyModel; this.state = { page:1, size:10, items:[] }; }
  mount(){ this.view.render(); this.load(); }
  async load(){
    try{ const data = await this.storyModel.list({page:this.state.page, size:this.state.size}); this.state.items = data.listStory || []; this.view.updateList(this.state.items); }
    catch(err){ this.view.showError(err.message); }
  }
  onNextPage(){ this.state.page += 1; this.load(); }
}