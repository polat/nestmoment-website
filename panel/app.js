// Nest Moment — Doktor Paneli UI. Yalnızca DataLayer arayüzünü tüketir.
(function(){
  'use strict';
  var app=document.getElementById('app');
  var view={name:'list'};          // doktor/admin içi gezinme durumu
  var authMode='login';            // 'login' | 'apply'

  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function statusMeta(k){return DataLayer.STATUSES.filter(function(s){return s.key===k;})[0]||{label:k};}

  // ---- ana yönlendirici ----
  function render(){
    var me=DataLayer.currentUser();
    if(!me){ return authMode==='apply'?renderApply():renderLogin(); }
    if(me.role==='admin'){ return renderAdminShell(me); }
    return renderDoctorShell(me);
  }

  // ---- giriş ----
  function renderLogin(){
    app.innerHTML=
    '<div class="auth-wrap"><div class="auth-card">'+
      '<div class="auth-logo">🍼</div><div class="auth-brand">Nest Moment</div>'+
      '<div class="auth-sub">Doktor Paneli</div>'+
      '<div class="field"><label>E-posta</label><input id="email" type="email" autocomplete="username"></div>'+
      '<div class="field"><label>Şifre</label><input id="pass" type="password" autocomplete="current-password"></div>'+
      '<div class="err" id="err"></div>'+
      '<button class="btn" id="go" style="width:100%">Giriş Yap</button>'+
      '<div class="auth-links"><a id="forgot">Şifremi unuttum</a>'+
        '<div class="auth-divider">Henüz hesabınız yok mu? <a id="toApply">Başvuru yapın</a></div></div>'+
    '</div></div>';
    document.getElementById('go').onclick=doLogin;
    document.getElementById('pass').onkeydown=function(e){if(e.key==='Enter')doLogin();};
    document.getElementById('toApply').onclick=function(){authMode='apply';render();};
    document.getElementById('forgot').onclick=function(){
      document.getElementById('err').textContent='Demo: şifrenizi Nest Moment ile iletişime geçerek sıfırlayın.';};
  }
  function doLogin(){
    var err=document.getElementById('err'); err.textContent='';
    var email=document.getElementById('email').value.trim();
    var pass=document.getElementById('pass').value;
    DataLayer.signIn(email,pass).then(function(){ view={name:'list'}; render(); })
      .catch(function(e){ err.textContent=e.message; });
  }

  // ---- başvuru (kayıt → pending) ----
  function renderApply(){
    app.innerHTML=
    '<div class="auth-wrap"><div class="auth-card">'+
      '<div class="auth-logo">🍼</div><div class="auth-brand">Nest Moment</div>'+
      '<div class="auth-sub">Doktor Başvurusu</div>'+
      '<div class="field"><label>Ad Soyad</label><input id="a_name"></div>'+
      '<div class="field"><label>E-posta</label><input id="a_email" type="email"></div>'+
      '<div class="field"><label>Telefon</label><input id="a_phone"></div>'+
      '<div class="field"><label>Şifre</label><input id="a_pass" type="password"></div>'+
      '<div class="err" id="err"></div>'+
      '<button class="btn" id="go" style="width:100%">Başvuruyu Gönder</button>'+
      '<div class="auth-links"><a id="toLogin">← Girişe dön</a></div>'+
    '</div></div>';
    document.getElementById('toLogin').onclick=function(){authMode='login';render();};
    document.getElementById('go').onclick=function(){
      var err=document.getElementById('err'); err.textContent='';
      var d={name:document.getElementById('a_name').value.trim(),
             email:document.getElementById('a_email').value.trim(),
             phone:document.getElementById('a_phone').value.trim(),
             password:document.getElementById('a_pass').value};
      if(!d.name||!d.email||!d.password){ err.textContent='Ad, e-posta ve şifre zorunlu.'; return; }
      DataLayer.applyAsDoctor(d).then(function(){
        app.innerHTML='<div class="auth-wrap"><div class="auth-card">'+
          '<div class="auth-logo">✅</div><div class="auth-brand">Başvurunuz alındı</div>'+
          '<div class="auth-sub">Nest Moment onayından sonra giriş yapabilirsiniz.</div>'+
          '<button class="btn" id="back" style="width:100%">Girişe dön</button></div></div>';
        document.getElementById('back').onclick=function(){authMode='login';render();};
      }).catch(function(e){ err.textContent=e.message; });
    };
  }

  // ---- doktor/admin kabukları ----
  function statusTag(k){ var m=statusMeta(k);
    return '<span class="status" data-s="'+esc(k)+'">'+esc(m.label)+'</span>'; }

  function orderRow(o){
    var thumb=(o.images&&o.images[0])?o.images[0].dataUrl:DataLayer.PLACEHOLDER;
    return '<div class="row" data-id="'+o.id+'">'+
      '<img class="thumb" src="'+thumb+'" alt="">'+
      '<div class="meta"><div class="name">'+esc(o.anneAdi)+'</div>'+
        '<div class="sub">'+esc(o.gebelikHaftasi)+'. hafta · '+(o.images?o.images.length:0)+
        ' görsel · '+fmtDate(o.createdAt)+'</div></div>'+
      statusTag(o.status)+'</div>';
  }
  function fmtDate(iso){ var d=new Date(iso);
    return d.toLocaleDateString('tr-TR',{day:'numeric',month:'short'}); }

  function sidebar(me,active,opts){
    opts=opts||{};
    function item(key,label,count){
      return '<button class="nav-item'+(active===key?' active':'')+'" data-nav="'+key+'">'+
        esc(label)+(count?'<span class="nav-count">'+count+'</span>':'')+'</button>';
    }
    var isAdmin=me.role==='admin';
    return '<div class="sidebar">'+
      '<div class="brand">🍼 Nest Moment'+(isAdmin?' <span class="badge-admin">ADMIN</span>':'')+'</div>'+
      (isAdmin
        ? item('orders','Tüm Siparişler')+item('doctors','Doktorlar',opts.pending)
        : item('list','Hastalarım')+item('new','+ Yeni Sipariş')+item('profile','Profil'))+
      '<div class="nav-foot">'+esc(me.name)+' · <a id="logout" style="color:var(--gold);cursor:pointer">Çıkış</a></div>'+
    '</div>';
  }
  function wireSidebar(me){
    Array.prototype.forEach.call(document.querySelectorAll('[data-nav]'),function(b){
      b.onclick=function(){ PanelUI.setView({name:b.getAttribute('data-nav')}); };
    });
    var lo=document.getElementById('logout');
    if(lo) lo.onclick=function(){ DataLayer.signOut().then(function(){ authMode='login'; render(); }); };
  }

  function renderDoctorShell(me){
    var v=view.name;
    if(v==='new')    return renderOrderForm(me);
    if(v==='detail') return renderOrderDetail(me, view.id);
    if(v==='profile')return renderProfile(me);
    // varsayılan: liste
    app.innerHTML='<div class="shell">'+sidebar(me,'list')+
      '<div class="content"><div class="page-head"><h1>Hastalarım</h1>'+
        '<button class="btn" id="newBtn">+ Yeni Sipariş</button></div>'+
      '<input class="search" id="q" placeholder="🔍 Anne adına göre ara…">'+
      '<div id="rows"><div class="empty">Yükleniyor…</div></div></div></div>';
    wireSidebar(me);
    document.getElementById('newBtn').onclick=function(){ PanelUI.setView({name:'new'}); };
    var rowsEl=document.getElementById('rows');
    DataLayer.listOrders({doctorId:me.id}).then(function(list){
      function paint(items){
        rowsEl.innerHTML = items.length
          ? items.map(orderRow).join('')
          : '<div class="empty">Henüz sipariş yok. "+ Yeni Sipariş" ile başlayın.</div>';
        Array.prototype.forEach.call(rowsEl.querySelectorAll('.row'),function(r){
          r.onclick=function(){ PanelUI.setView({name:'detail',id:r.getAttribute('data-id')}); };
        });
      }
      paint(list);
      document.getElementById('q').oninput=function(e){
        var t=e.target.value.toLocaleLowerCase('tr');
        paint(list.filter(function(o){return o.anneAdi.toLocaleLowerCase('tr').indexOf(t)>=0;}));
      };
    });
  }

  // ---- yeni sipariş formu ----
  function renderOrderForm(me){
    var picked=[]; // {file, url}
    app.innerHTML='<div class="shell">'+sidebar(me,'new')+
      '<div class="content"><div class="page-head"><h1>Yeni Sipariş</h1></div>'+
      '<div style="max-width:460px">'+
        '<div class="field"><label>Anne adı soyadı</label><input id="f_name"></div>'+
        '<div class="field"><label>Gebelik haftası</label><input id="f_week" type="number" min="1" max="42" style="max-width:140px"></div>'+
        '<div class="field"><label>Ultrason görselleri <span class="muted">(birden çok seçebilirsiniz)</span></label>'+
          '<div class="uploader" id="drop">⬆ Görselleri sürükleyin veya seçin'+
            '<input id="f_files" type="file" accept="image/*" multiple hidden>'+
            '<div class="previews" id="pv"></div></div></div>'+
        '<label class="checkbox"><input type="checkbox" id="f_consent">'+
          '<span>Hastadan görüntünün işlenmesi için açık rıza alındı (KVKK).</span></label>'+
        '<div class="err" id="err"></div>'+
        '<button class="btn" id="submit">Siparişi Gönder</button>'+
      '</div></div></div>';
    wireSidebar(me);

    var fileInput=document.getElementById('f_files'), drop=document.getElementById('drop'),
        pv=document.getElementById('pv');
    drop.onclick=function(e){ if(e.target.tagName!=='BUTTON') fileInput.click(); };
    fileInput.onchange=function(){ addFiles(fileInput.files); fileInput.value=''; };
    drop.ondragover=function(e){ e.preventDefault(); drop.classList.add('drag'); };
    drop.ondragleave=function(){ drop.classList.remove('drag'); };
    drop.ondrop=function(e){ e.preventDefault(); drop.classList.remove('drag');
      addFiles(e.dataTransfer.files); };

    function addFiles(files){
      Array.prototype.forEach.call(files,function(f){
        if(f.type.indexOf('image/')!==0) return;
        var url=URL.createObjectURL(f); picked.push({file:f,url:url});
      });
      paintPreviews();
    }
    function paintPreviews(){
      pv.innerHTML=picked.map(function(p,i){
        return '<div class="pv"><img src="'+p.url+'" alt=""><button data-i="'+i+'">×</button></div>';
      }).join('');
      Array.prototype.forEach.call(pv.querySelectorAll('button'),function(b){
        b.onclick=function(e){ e.stopPropagation();
          var i=+b.getAttribute('data-i'); URL.revokeObjectURL(picked[i].url);
          picked.splice(i,1); paintPreviews(); };
      });
    }

    document.getElementById('submit').onclick=function(){
      var err=document.getElementById('err'); err.textContent='';
      var name=document.getElementById('f_name').value.trim();
      var week=document.getElementById('f_week').value;
      if(!name){ err.textContent='Anne adı zorunlu.'; return; }
      if(!week){ err.textContent='Gebelik haftası zorunlu.'; return; }
      if(!picked.length){ err.textContent='En az bir ultrason görseli yükleyin.'; return; }
      if(!document.getElementById('f_consent').checked){ err.textContent='KVKK açık rıza onayı gerekli.'; return; }
      var btn=this; btn.disabled=true; btn.textContent='Gönderiliyor…';
      DataLayer.createOrder({anneAdi:name,gebelikHaftasi:week},
                            picked.map(function(p){return p.file;}))
        .then(function(){ PanelUI.setView({name:'list'}); })
        .catch(function(e){ err.textContent=e.message; btn.disabled=false; btn.textContent='Siparişi Gönder'; });
    };
  }
  function renderOrderDetail(me,id){ app.innerHTML='<div class="shell">'+sidebar(me,'list')+'<div class="content">Detay — Task 8</div></div>'; wireSidebar(me); }
  function renderProfile(me){ app.innerHTML='<div class="shell">'+sidebar(me,'profile')+
    '<div class="content"><div class="page-head"><h1>Profil</h1></div>'+
    '<div class="kv"><span class="k">Ad Soyad</span>'+esc(me.name)+'</div>'+
    '<div class="kv"><span class="k">E-posta</span>'+esc(me.email)+'</div>'+
    '<div class="kv"><span class="k">Telefon</span>'+esc(me.phone||'—')+'</div></div></div>'; wireSidebar(me); }

  function renderAdminShell(me){ app.innerHTML='<div class="content">Admin paneli — Task 9</div>'; }

  // dışarıya aç (sonraki task'lar genişletir)
  window.PanelUI={render:render,esc:esc,statusMeta:statusMeta,
    setView:function(v){view=v;render();},getView:function(){return view;}};
  render();
})();
