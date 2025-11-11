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

router.register('/login', (outlet)=> new LoginPresenter(outlet, authModel).mount());
router.register('/register', (outlet)=> new RegisterPresenter(outlet, authModel).mount());
router.register('/home', (outlet)=> new HomePresenter(outlet, storyModel).mount());
router.register('/map', (outlet)=> new MapPresenter(outlet, storyModel).mount());
router.register('/saved', (outlet)=> import('./views/SavedView.js').then(m=> new m.SavedView(outlet).mount()));

router.register('/add', (outlet)=> new AddPresenter(outlet, storyModel).mount());

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

import { ensureSWRegistered, subscribePush, unsubscribePush } from './utils/push';
import { fixLeafletIcons } from './utils/leafletIcons';

ensureSWRegistered();
fixLeafletIcons();

const __bindPushToggle = () => {
  const btn = document.querySelector('#toggle-push');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await unsubscribePush();
        alert('Langganan notifikasi dimatikan');
      } else {
        const s = await subscribePush(import.meta?.env?.VITE_VAPID_PUBLIC_KEY || null);
        // TODO: kirim 's' ke server API kamu
        alert('Langganan notifikasi diaktifkan');
      }
    } catch (e) {
      alert('Gagal mengatur notifikasi: ' + e.message);
    }
  });
};
window.addEventListener('load', __bindPushToggle);
