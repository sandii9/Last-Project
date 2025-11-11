
import DetailView from '../views/DetailView';
export default class DetailPresenter {
  constructor(outlet, model){ this.view = new DetailView(outlet); this.model = model; }
  async show(params){
    const id = params?.id;
    if(!id){ this.view.renderError('ID tidak ditemukan'); return; }
    this.view.renderLoading();
    try {
      const data = await this.model.getDetail(id);
      if(!data) throw new Error('notfound');
      this.view.render(data);
    } catch(_) {
      this.view.renderError('Gagal memuat detail');
    }
  }
}
