// ============================================================
// Nest Moment — Doktor Paneli VERİ KATMANI (backend-agnostic)
// TEK swap noktası. Şu an mock(localStorage). Backend gelince
// AYNI arayüzün gerçek implementasyonu yazılır; app.js DEĞİŞMEZ.
// Tüm veri işlemleri Promise döner; currentUser() senkrondur.
// ============================================================
(function (global) {
  'use strict';

  var K_USERS='nm_panel_users', K_ORDERS='nm_panel_orders', K_SESSION='nm_panel_session';

  var STATUSES=[
    {key:'new',           label:'Yeni',       color:'var(--st-new)'},
    {key:'reviewing',     label:'İnceleniyor',color:'var(--st-rev)'},
    {key:'in_production', label:'Üretimde',   color:'var(--st-prod)'},
    {key:'completed',     label:'Tamamlandı', color:'var(--st-done)'},
    {key:'cancelled',     label:'İptal',      color:'var(--st-cancel)'}
  ];

  // küçük SVG placeholder (seed görselleri) — gerçek yüklemede data URL fotoğraf olur
  var PH='data:image/svg+xml;utf8,'+encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">'+
    '<rect width="200" height="200" fill="#241c17"/>'+
    '<text x="100" y="108" font-size="48" text-anchor="middle" fill="#d8b486">🍼</text></svg>');

  function read(k){ try{return JSON.parse(localStorage.getItem(k))||null;}catch(e){return null;} }
  function write(k,v){ localStorage.setItem(k, JSON.stringify(v)); }
  function uid(p){ return p+'_'+Math.random().toString(36).slice(2,9); }
  function delay(v){ return new Promise(function(res){ setTimeout(function(){res(v);}, 60); }); }

  function seedUsers(){
    return [
      {id:'u_admin', name:'Nest Moment', email:'admin@nestmoment.com', phone:'', role:'admin',
       status:'active', password:'admin123', createdAt:'2026-05-01T09:00:00.000Z'},
      {id:'u_ayse', name:'Dr. Ayşe Yılmaz', email:'ayse@ornek.com', phone:'05551112233', role:'doctor',
       status:'active', password:'doktor123', createdAt:'2026-05-10T09:00:00.000Z'},
      {id:'u_mehmet', name:'Dr. Mehmet Can', email:'mehmet@ornek.com', phone:'05554445566', role:'doctor',
       status:'active', password:'doktor123', createdAt:'2026-05-12T09:00:00.000Z'},
      {id:'u_zeynep', name:'Dr. Zeynep Ak', email:'zeynep@ornek.com', phone:'05557778899', role:'doctor',
       status:'pending', password:'doktor123', createdAt:'2026-06-04T09:00:00.000Z'}
    ];
  }
  function seedOrders(){
    return [
      {id:'o_1', doctorId:'u_ayse', doctorName:'Dr. Ayşe Yılmaz', anneAdi:'Elif Demir',
       gebelikHaftasi:28, status:'new', createdAt:'2026-06-04T14:00:00.000Z',
       images:[{id:'i1',name:'us1.png',dataUrl:PH},{id:'i2',name:'us2.png',dataUrl:PH},{id:'i3',name:'us3.png',dataUrl:PH}]},
      {id:'o_2', doctorId:'u_mehmet', doctorName:'Dr. Mehmet Can', anneAdi:'Zeynep Kaya',
       gebelikHaftasi:31, status:'in_production', createdAt:'2026-06-02T11:00:00.000Z',
       images:[{id:'i4',name:'us1.png',dataUrl:PH},{id:'i5',name:'us2.png',dataUrl:PH}]},
      {id:'o_3', doctorId:'u_ayse', doctorName:'Dr. Ayşe Yılmaz', anneAdi:'Merve Şahin',
       gebelikHaftasi:26, status:'completed', createdAt:'2026-05-29T16:00:00.000Z',
       images:[{id:'i6',name:'us1.png',dataUrl:PH},{id:'i7',name:'us2.png',dataUrl:PH},{id:'i8',name:'us3.png',dataUrl:PH},{id:'i9',name:'us4.png',dataUrl:PH}]}
    ];
  }
  function ensureSeed(){
    if(!read(K_USERS)) write(K_USERS, seedUsers());
    if(!read(K_ORDERS)) write(K_ORDERS, seedOrders());
  }
  function reseed(){ write(K_USERS, seedUsers()); write(K_ORDERS, seedOrders());
    localStorage.removeItem(K_SESSION); }

  ensureSeed();

  function sortNewest(arr){ return arr.slice().sort(function(a,b){
    return a.createdAt<b.createdAt?1:(a.createdAt>b.createdAt?-1:0); }); }

  function fileToScaledDataUrl(file, maxPx, quality){
    maxPx=maxPx||1000; quality=quality||0.82;
    return new Promise(function(resolve,reject){
      var reader=new FileReader();
      reader.onload=function(){
        var img=new Image();
        img.onload=function(){
          var w=img.width,h=img.height,s=Math.min(1,maxPx/Math.max(w,h));
          var cw=Math.round(w*s),ch=Math.round(h*s);
          var c=document.createElement('canvas'); c.width=cw; c.height=ch;
          c.getContext('2d').drawImage(img,0,0,cw,ch);
          try{ resolve(c.toDataURL('image/jpeg',quality)); }
          catch(e){ resolve(reader.result); } // tainted ise orijinali kullan
        };
        img.onerror=function(){ resolve(reader.result); };
        img.src=reader.result;
      };
      reader.onerror=function(){ reject(new Error('Görsel okunamadı.')); };
      reader.readAsDataURL(file);
    });
  }

  var DataLayer={
    STATUSES:STATUSES,
    PLACEHOLDER:PH,
    _reseed:reseed,

    currentUser:function(){
      var s=read(K_SESSION); if(!s) return null;
      var u=(read(K_USERS)||[]).filter(function(x){return x.id===s.userId;})[0];
      return u||null;
    },
    listDoctors:function(){
      return delay((read(K_USERS)||[]).filter(function(u){return u.role==='doctor';}));
    },
    listOrders:function(f){
      f=f||{}; var list=read(K_ORDERS)||[];
      if(f.doctorId) list=list.filter(function(o){return o.doctorId===f.doctorId;});
      if(f.status)   list=list.filter(function(o){return o.status===f.status;});
      return delay(sortNewest(list));
    },
    getOrder:function(id){
      return delay((read(K_ORDERS)||[]).filter(function(o){return o.id===id;})[0]||null);
    },
    signIn:function(email,password){
      var users=read(K_USERS)||[];
      var u=users.filter(function(x){return x.email===email && x.password===password;})[0];
      if(!u) return Promise.reject(new Error('E-posta veya şifre hatalı.'));
      if(u.status==='pending')  return Promise.reject(new Error('Hesabınız onay bekliyor.'));
      if(u.status==='disabled') return Promise.reject(new Error('Hesabınız pasif durumda.'));
      write(K_SESSION,{userId:u.id});
      return delay(u);
    },
    signOut:function(){ localStorage.removeItem(K_SESSION); return delay(); },
    applyAsDoctor:function(d){
      var users=read(K_USERS)||[];
      if(users.some(function(x){return x.email===d.email;}))
        return Promise.reject(new Error('Bu e-posta zaten kayıtlı.'));
      var doc={id:uid('u'),name:d.name,email:d.email,phone:d.phone||'',role:'doctor',
        status:'pending',password:d.password,createdAt:new Date().toISOString()};
      users.push(doc); write(K_USERS,users); return delay(doc);
    },
    setDoctorStatus:function(id,status){
      var users=read(K_USERS)||[];
      users.forEach(function(u){ if(u.id===id) u.status=status; });
      write(K_USERS,users); return delay();
    },
    createOrder:function(data,files){
      var me=DataLayer.currentUser();
      if(!me) return Promise.reject(new Error('Oturum bulunamadı.'));
      if(!files || !files.length) return Promise.reject(new Error('En az bir görsel gerekli.'));
      return Promise.all(Array.prototype.map.call(files, fileToScaledDataUrl)).then(function(urls){
        var order={id:uid('o'),doctorId:me.id,doctorName:me.name,
          anneAdi:data.anneAdi,gebelikHaftasi:Number(data.gebelikHaftasi),
          status:'new',createdAt:new Date().toISOString(),
          images:urls.map(function(d,i){return {id:uid('i'),name:files[i].name,dataUrl:d};})};
        var list=read(K_ORDERS)||[]; list.push(order); write(K_ORDERS,list);
        return order;
      });
    },
    updateOrderStatus:function(id,status){
      var list=read(K_ORDERS)||[];
      list.forEach(function(o){ if(o.id===id) o.status=status; });
      write(K_ORDERS,list); return delay();
    },
  };

  // dahili erişim (sonraki task'lar bunları kullanır)
  DataLayer._read=read; DataLayer._write=write; DataLayer._uid=uid;
  DataLayer._delay=delay; DataLayer._K={USERS:K_USERS,ORDERS:K_ORDERS,SESSION:K_SESSION};

  global.DataLayer=DataLayer;
})(window);
