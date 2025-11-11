import { BaseView } from './BaseView.js';
export class RegisterView extends BaseView {
  constructor(outlet, presenter){ super(outlet); this.presenter = presenter; }
  render(){
    const frag = this.html`
      <section class="card" aria-labelledby="regTitle">
        <h1 id="regTitle">Daftar Akun</h1>
        <form id="form" class="grid" novalidate>
          <div><label for="name">Nama</label><input id="name" name="name" type="text" required autocomplete="name" /></div>
          <div><label for="email">Email</label><input id="email" name="email" type="email" required autocomplete="email" /></div>
          <div><label for="password">Password</label><input id="password" name="password" type="password" required minlength="6" autocomplete="new-password" /></div>
          <div><button class="btn primary" type="submit">Daftar</button><a class="btn" href="#/login">Sudah punya akun</a></div>
        </form>
        <div id="error" role="alert" aria-live="assertive" class="muted"></div>
      </section>`;
    this.mountDom(frag);
    const form = this.outlet.querySelector('#form');
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const password = form.password.value;
      if(!name || !email || !password){ this.showError('Semua kolom wajib diisi.'); return; }
      this.presenter.onSubmit({name, email, password});
    });
  }
  showError(msg){ const el = this.outlet.querySelector('#error'); el.textContent = msg; el.style.color='var(--danger)'; }
}