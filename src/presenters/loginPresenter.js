import { LoginView } from '../views/LoginView.js';
export class LoginPresenter {
  constructor(outlet, authModel){ this.view = new LoginView(outlet, this); this.auth = authModel; }
  mount(){ this.view.render(); }
  async onSubmit({email, password}){
    try{ await this.auth.login({email,password}); location.hash = '#/home'; }
    catch(err){ this.view.showError(err.message); }
  }
}