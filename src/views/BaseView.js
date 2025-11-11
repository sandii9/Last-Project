export class BaseView {
  constructor(outlet){ this.outlet = outlet; }
  html(strings, ...values){
    const res = String.raw({raw: strings}, ...values);
    const tpl = document.createElement('template'); tpl.innerHTML = res.trim(); return tpl.content;
  }
  mountDom(fragment){ this.outlet.innerHTML=''; this.outlet.appendChild(fragment); }
  toast(msg, type='info'){
    const live = document.createElement('div');
    live.setAttribute('role','status'); live.setAttribute('aria-live','polite');
    live.style.position='fixed'; live.style.right='1rem'; live.style.bottom='1rem';
    live.style.background = type==='error' ? 'var(--danger)' : '#24306e';
    live.style.color = type==='error' ? '#111' : 'var(--text)';
    live.style.padding='.6rem .8rem'; live.style.borderRadius='10px';
    live.style.boxShadow='0 10px 30px rgba(0,0,0,.35)'; live.textContent = msg;
    document.body.appendChild(live); setTimeout(()=> live.remove(), 2500);
  }
}