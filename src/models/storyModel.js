export class StoryModel {
  constructor(baseUrl, getToken){ this.baseUrl = baseUrl; this.getToken = getToken; }
  async list({page=1, size=10, withLocation=false}={}){
    const res = await fetch(`${this.baseUrl}/stories?page=${page}&size=${size}${withLocation?'&location=1':''}`, { headers:{ 'Authorization':'Bearer '+this.getToken() } });
    const data = await res.json(); if(!res.ok) throw new Error(data.message || 'Gagal memuat data'); return data;
  }
  async add({description, photoBlob, lat, lon}){
    const fd = new FormData(); fd.append('description', description); fd.append('photo', photoBlob, 'photo.jpg');
    if(lat!=null && lon!=null){ fd.append('lat', lat); fd.append('lon', lon); }
    const res = await fetch(`${this.baseUrl}/stories`, { method:'POST', headers:{ 'Authorization':'Bearer '+this.getToken() }, body: fd });
    const data = await res.json(); if(!res.ok) throw new Error(data.message || 'Gagal menambahkan story'); return data;
  }
}