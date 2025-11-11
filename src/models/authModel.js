export class AuthModel {
  constructor(baseUrl){ this.baseUrl = baseUrl; this.key = 'dicoding_token'; }
  async register({name, email, password}){
    const res = await fetch(`${this.baseUrl}/register`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({name,email,password}) });
    const data = await res.json(); if(!res.ok) throw new Error(data.message || 'Gagal register'); return data;
  }
  async login({email, password}){
    const res = await fetch(`${this.baseUrl}/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email,password}) });
    const data = await res.json(); if(!res.ok) throw new Error(data.message || 'Gagal login');
    const token = data.loginResult?.token; if(!token) throw new Error('Token tidak ditemukan'); localStorage.setItem(this.key, token); return token;
  }
  getToken(){ return localStorage.getItem(this.key); }
  isLoggedIn(){ return !!this.getToken(); }
  logout(){ localStorage.removeItem(this.key); }
}