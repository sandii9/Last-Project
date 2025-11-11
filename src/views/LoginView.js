import { BaseView } from './BaseView.js';
export class LoginView extends BaseView {
  constructor(outlet, presenter){ super(outlet); this.presenter = presenter; }
  render(){
    const frag = this.html`
      <section class="card" aria-labelledby="loginTitle">
        <h1 id="loginTitle">Masuk</h1>
        <p class="muted">Gunakan akun Dicoding Story API Anda.</p>
        <form id="form" class="grid" novalidate>
          <div><label for="email">Email</label><input id="email" name="email" type="email" required autocomplete="email" /></div>
          <div><label for="password">Password</label><input id="password" name="password" type="password" required minlength="6" autocomplete="current-password" /></div>
          <div class="row two"><button class="btn primary" type="submit">Login</button><a class="btn" href="#/register">Daftar</a></div>
        </form>
        <div id="error" role="alert" aria-live="assertive" class="muted"></div>
      </section>`;
    this.mountDom(frag);
    const form = this.outlet.querySelector('#form');
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const email = form.email.value.trim();
      const password = form.password.value;
      if(!email || !password){ this.showError('Email dan password wajib diisi.'); return; }
      this.presenter.onSubmit({email, password});
    });
  }
  showError(msg){ const el = this.outlet.querySelector('#error'); el.textContent = msg; el.style.color='var(--danger)'; }
}