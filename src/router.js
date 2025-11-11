import { withViewTransition } from './utils/viewTransition.js';
export class Router {
  constructor(outlet){ this.outlet = outlet; this.routes = new Map(); this.beforeEach = null; }
  register(path, handler){ this.routes.set(path, handler); }
  init(){ window.addEventListener('hashchange', ()=> this.resolve()); this.resolve(); }
  resolve(){
    const path = location.hash.slice(1) || '/login';
    const redirect = this.beforeEach ? this.beforeEach(path) : null;
    const finalPath = redirect || path;
    const handler = this.routes.get(finalPath);
    if (!handler){ location.hash = '#/login'; return; }
    withViewTransition(()=>{
      this.outlet.innerHTML = '';
      this.outlet.classList.add('vt-enter');
      handler(this.outlet);
      queueMicrotask(()=> this.outlet.focus());
      setTimeout(()=> this.outlet.classList.remove('vt-enter'), 400);
    })();
  }
}