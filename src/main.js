import { Router } from './router.js';
import { AuthModel } from './models/authModel.js';
import { StoryModel } from './models/storyModel.js';
import { LoginPresenter } from './presenters/loginPresenter.js';
import { RegisterPresenter } from './presenters/registerPresenter.js';
import { HomePresenter } from './presenters/homePresenter.js';
import { MapPresenter } from './presenters/mapPresenter.js';
import { AddPresenter } from './presenters/addPresenter.js';
import { withViewTransition } from './utils/viewTransition.js';
import 'leaflet/dist/leaflet.css';

const apiBase = 'https://story-api.dicoding.dev/v1';
const authModel = new AuthModel(apiBase);
const storyModel = new StoryModel(apiBase, () => authModel.getToken());

const main = document.getElementById('main');
const router = new Router(main);

function guardAuth(to) {
  const needAuth = ['/home','/map','/add'];
  if (needAuth.includes(to) && !authModel.isLoggedIn()) return '/login';
  if (['/login','/register'].includes(to) && authModel.isLoggedIn()) return '/home';
  return null;
}
router.beforeEach = (to)=> guardAuth(to);

router.register('/login',   (outlet)=> new LoginPresenter(outlet, authModel).mount());
router.register('/register',(outlet)=> new RegisterPresenter(outlet, authModel).mount());
router.register('/home',    (outlet)=> new HomePresenter(outlet, storyModel).mount());
router.register('/map',     (outlet)=> new MapPresenter(outlet, storyModel).mount());
router.register('/saved',   (outlet)=> import('./views/SavedView.js').then(m=> new m.SavedView(outlet).mount()));
router.register('/add',     (outlet)=> new AddPresenter(outlet, storyModel).mount());

const logoutBtn = document.getElementById('logoutBtn');
function syncNav(){
  document.querySelectorAll('[data-link]').forEach(a=>{
    if (location.hash.replace('#','') === a.getAttribute('href').replace('#','')) a.setAttribute('aria-current','page');
    else a.removeAttribute('aria-current');
  });
  if(authModel.isLoggedIn()){
    logoutBtn.hidden = false;
    document.querySelector('a[href="#/login"]').hidden = true;
  } else {
    logoutBtn.hidden = true;
    document.querySelector('a[href="#/login"]').hidden = false;
  }
}
logoutBtn.addEventListener('click', ()=>{ authModel.logout(); location.hash = '#/login'; });
window.addEventListener('hashchange', syncNav);
window.addEventListener('load', syncNav);

withViewTransition(()=>{
  router.init();
  if (!location.hash) location.hash = '#/login';
})();

import { ensureSWRegistered, getExistingSubscription, subscribePush, unsubscribePush } from './utils/push';
import { fixLeafletIcons } from './utils/leafletIcons';

ensureSWRegistered();
fixLeafletIcons();

/**
 * Toggle Push:
 * - Inisialisasi label sesuai status subscription
 * - Saat subscribe, wajib POST ke /notifications/subscribe dengan Bearer token
 */
const __bindPushToggle = () => {
  const btn = document.querySelector('#toggle-push');
  if (!btn) return;

  // Set label awal (Aktifkan/Matikan) sesuai subscription yang ada
  (async () => {
    try {
      const sub = await getExistingSubscription();
      btn.dataset.active = sub ? '1' : '0';
      btn.textContent = sub ? 'Matikan Notifikasi' : 'Aktifkan Notifikasi';
    } catch {
      btn.dataset.active = '0';
      btn.textContent = 'Aktifkan Notifikasi';
    }
  })();

  btn.addEventListener('click', async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();

      if (sub) {
        // Unsubscribe
        await unsubscribePush();
        btn.dataset.active = '0';
        btn.textContent = 'Aktifkan Notifikasi';
        alert('Langganan notifikasi dimatikan');
        return;
      }

      // Subscribe baru -> butuh token login untuk dikirim ke server
      const token = authModel.getToken();
      if (!token) {
        alert('Silakan login terlebih dahulu untuk mengaktifkan notifikasi');
        return;
      }

      // ⬇️ PENTING: panggil subscribePush dengan OBJECT { apiBase, authToken }
      await subscribePush({
        apiBase,               // 'https://story-api.dicoding.dev/v1'
        authToken: token,      // Bearer <token>
      });

      btn.dataset.active = '1';
      btn.textContent = 'Matikan Notifikasi';
      alert('Langganan notifikasi diaktifkan');
    } catch (e) {
      alert('Gagal mengatur notifikasi: ' + e.message);
    }
  });
};
window.addEventListener('load', __bindPushToggle);

// ====== A2HS (Install PWA) ======
let __deferredInstall;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  __deferredInstall = e;
  const ib = document.getElementById('installBtn');
  if (ib) ib.style.display = 'inline-flex';
});
function __bindInstallBtn(){
  const ib = document.getElementById('installBtn');
  if (!ib) return;
  ib.addEventListener('click', async () => {
    if (!__deferredInstall) return;
    __deferredInstall.prompt();
    await __deferredInstall.userChoice;
    __deferredInstall = null;
    ib.style.display = 'none';
  });
}
window.addEventListener('load', __bindInstallBtn);