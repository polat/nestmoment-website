// Nest Moment — Doktor Paneli UI. Yalnızca DataLayer arayüzünü tüketir.
(function(){
  'use strict';
  var app=document.getElementById('app');
  var view={name:'list'};          // doktor/admin içi gezinme durumu
  var authMode='login';            // 'login' | 'apply'

  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
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

  // ---- doktor/admin kabukları (Task 6+ doldurur) ----
  function renderDoctorShell(me){ app.innerHTML='<div class="content">Doktor paneli — Task 6</div>'; window._me=me; }
  function renderAdminShell(me){ app.innerHTML='<div class="content">Admin paneli — Task 9</div>'; window._me=me; }

  // dışarıya aç (sonraki task'lar genişletir)
  window.PanelUI={render:render,esc:esc,statusMeta:statusMeta,
    setView:function(v){view=v;render();},getView:function(){return view;}};
  render();
})();
