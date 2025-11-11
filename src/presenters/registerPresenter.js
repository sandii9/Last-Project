import { RegisterView } from '../views/RegisterView.js';
export class RegisterPresenter {
  constructor(outlet, authModel){ this.view = new RegisterView(outlet, this); this.auth = authModel; }
  mount(){ this.view.render(); }
  async onSubmit({name, email, password}){
    try{ await this.auth.register({name,email,password}); this.view.toast('Registrasi berhasil, silakan login.'); location.hash = '#/login'; }
    catch(err){ this.view.showError(err.message); }
  }
}