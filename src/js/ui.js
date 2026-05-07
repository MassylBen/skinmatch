/**
 * SkinMatch — Logique UI et navigation
 * Agent Frontend — src/js/ui.js
 *
 * Gère: navigation entre écrans, rendu des composants, events UI
 * Dépend de: data-legacy.js, algorithm.js, i18n.js
 */

'use strict';

function gB(b){return b==="mix"?"mid":b;}

function getWhy(key,skin,concern,age){
  var p=DB[key];
  var l=T[LANG]||T.fr;
  var sL=l.skin_labels;
  var cL=l.concern_labels;
  var benFr=p.ben?p.ben.split('.')[0]:'';
  var benText=benFr;
  if(LANG==='en'&&p.ben_en){benText=p.ben_en;}
  return l.why_prefix+' '+(sL[skin]||'')+' ('+(age||'')+'), '+l.why_against+' '+(cL[concern]||concern)+'. '+benText+'.';
}

function getCompat(key,skin,concern,age,allergies){
  let s=70;
  const p=DB[key];
  if(p.clean&&allergies.length>0)s+=10;
  if(skin==="sensible"&&p.yuka>=75)s+=8;
  if(age==="46+"&&(p.ak||[]).some(a=>a.includes("ride")||a.includes("Proxylane")))s+=7;
  return Math.min(99,Math.max(72,s+Math.floor(Math.random()*8)));
}

function getRegionProducts() {
  var available = [];
  for (var key in DB) {
    var p = DB[key];
    if (!p.region) { available.push(key); continue; }
    if (p.region.indexOf(REGION) !== -1) { available.push(key); }
  }
  return available;
}

function build(){
  const b=gB(ST.budget),sk=ST.skinType||"normale",steps=[];
  const c=ST.concerns.length>0?ST.concerns:["deshydratation"];
  const usedKeys=new Set();
  const mk=(key,etape,moment)=>({etape,moment,key,...DB[key],img:IMGS[key],pourquoi:getWhy(key,sk,c[0],ST.ageGroup),compat:getCompat(key,sk,c[0],ST.ageGroup,ST.allergies)});
  const addStep=(key,etape,moment)=>{
    if(!key||!DB[key])return;
    if(usedKeys.has(key)){
      const alts={"cv-gel":"https://m.media-amazon.com/images/I/61S6p8gFMeL._AC_SL1500_.jpg","lrp-effgel":"https://www.laroche-posay.fr/dw/image/v2/AANG_PRD/on/demandware.static/-/Sites-lrp-master-catalog/default/dw1c8e6f9b/2023/LRP_Effaclar_Gel_Purifiant_400ml_3337875520731.jpg","cv-crem":"https://m.media-amazon.com/images/I/61FvCqKqkKL._AC_SL1500_.jpg","lrp-tol":"https://www.laroche-posay.fr/dw/image/v2/AANG_PRD/on/demandware.static/-/Sites-lrp-master-catalog/default/dw8c5b2a1f/2023/LRP_Toleriane_Dermallergo_40ml.jpg","lrp-effduo":"https://www.laroche-posay.fr/dw/image/v2/AANG_PRD/on/demandware.static/-/Sites-lrp-master-catalog/default/dwe5c2c8d2/2022/LRP_Effaclar_DuoPlus_M_40ml_3337875596704.jpg","cv-mou":"https://m.media-amazon.com/images/I/61hFpfpS0ZL._AC_SL1500_.jpg"};
      key=alts[key]||key;
      if(usedKeys.has(key))return;
    }
    usedKeys.add(key);
    steps.push(mk(key,etape,moment));
  };
  const nk=ROUTE.net[sk]?.[b]||"cv-mou";
  const hk=ROUTE.hyd[sk]?.[b]||"cv-crem";
  const sk2=ROUTE.spf[b]||ROUTE.spf.mid;
  if(ST.routine==="simple"){addStep(nk,"Nettoyant","AM+PM");addStep(hk,"Hydratant","AM+PM");addStep(sk2,"Protection solaire","AM");}
  if(ST.routine==="specifique"){
    const srk=ROUTE.ser[c[0]]?.[b]||"cv-vitc";
    const prod=DB[srk];
    addStep(srk,"Soin ciblé",prod?prod.moment:"AM+PM");
  }
  if(ST.routine==="complete"){
    addStep(nk,"Nettoyant","AM+PM");
    c.slice(0,2).forEach((cc,i)=>{const srk=ROUTE.ser[cc]?.[b];addStep(srk,i===0?"Sérum principal":"Sérum soir",i===0?"AM+PM":"PM");});
    addStep(hk,"Hydratant","AM+PM");addStep(sk2,"Protection solaire","AM");
  }
  // Trier TOUS les produits par note Yuka décroissante (SPF toujours en dernier)
  const fixedZ=steps.filter(s=>s.etape==="Protection solaire");
  const nonSpf=steps.filter(s=>s.etape!=="Protection solaire");
  nonSpf.sort((a,b)=>(b.yuka||0)-(a.yuka||0));
  steps.length=0;
  nonSpf.forEach(s=>steps.push(s));
  fixedZ.forEach(s=>steps.push(s));
  const l=T[LANG]||T.fr;
  const CONS=l.conseils||T.fr.conseils;
  const skinL=l.intro_skin||T.fr.intro_skin;
  const tpl=l.intro_tpl||T.fr.intro_tpl;
  const introStr=tpl.replace('{skin}',skinL[ST.skinType]||'').replace('{age}',ST.ageGroup?' ('+ST.ageGroup+')':'');
  const totalPrix=steps.reduce((a,s)=>{const n=parseFloat((s.prix||"0").replace("€","").replace("~",""));return isNaN(n)?a:a+n;},0);
  return{intro:introStr,steps,conseil:CONS[c[0]]||"Une routine simple appliquée chaque jour surpasse une routine complexe abandonnée.",totalPrix};
}

function t(key){ return (T[LANG]&&T[LANG][key]!==undefined)?T[LANG][key]:(T.fr[key]||key); }
var selectedRegionValue = '';

var REGIONS = [
  {group:'🌍 Europe', items:[
    {val:'fr',flag:'🇫🇷',name:'France'},
    {val:'fr',flag:'🇧🇪',name:'Belgique'},
    {val:'fr',flag:'🇨🇭',name:'Suisse'},
    {val:'de',flag:'🇩🇪',name:'Allemagne'},
    {val:'es',flag:'🇪🇸',name:'Espagne'},
    {val:'gb',flag:'🇬🇧',name:'Royaume-Uni'},
    {val:'gb',flag:'🇮🇹',name:'Italie'},
    {val:'gb',flag:'🇳🇱',name:'Pays-Bas'},
  ]},
  {group:'🌍 Maghreb', items:[
    {val:'dz',flag:'🇩🇿',name:'Algérie'},
    {val:'ma',flag:'🇲🇦',name:'Maroc'},
    {val:'ma',flag:'🇹🇳',name:'Tunisie'},
    {val:'ma',flag:'🇱🇾',name:'Libye'},
  ]},
  {group:'🌍 Moyen-Orient', items:[
    {val:'gb',flag:'🇸🇦',name:'Arabie Saoudite'},
    {val:'gb',flag:'🇦🇪',name:'Émirats Arabes Unis'},
    {val:'gb',flag:'🇶🇦',name:'Qatar'},
    {val:'gb',flag:'🇱🇧',name:'Liban'},
    {val:'gb',flag:'🇪🇬',name:'Égypte'},
  ]},
  {group:'🌍 Amériques', items:[
    {val:'gb',flag:'🇺🇸',name:'États-Unis'},
    {val:'gb',flag:'🇨🇦',name:'Canada'},
    {val:'es',flag:'🇲🇽',name:'Mexique'},
    {val:'es',flag:'🇧🇷',name:'Brésil'},
  ]},
  {group:'🌍 Afrique', items:[
    {val:'gb',flag:'🇸🇳',name:'Sénégal'},
    {val:'gb',flag:'🇨🇮',name:"Côte d'Ivoire"},
    {val:'gb',flag:'🇨🇲',name:'Cameroun'},
  ]},
  {group:'🌍 Asie & Océanie', items:[
    {val:'gb',flag:'🇯🇵',name:'Japon'},
    {val:'gb',flag:'🇰🇷',name:'Corée du Sud'},
    {val:'gb',flag:'🇦🇺',name:'Australie'},
  ]},
];

function buildRegionList() {
  var container = document.getElementById('region-list');
  if (!container) return;
  container.innerHTML = '';
  REGIONS.forEach(function(group) {
    var groupLabel = document.createElement('div');
    groupLabel.style.cssText = 'font-size:10px;font-weight:700;color:#B0958F;text-transform:uppercase;letter-spacing:.5px;padding:4px 0 2px';
    groupLabel.textContent = group.group;
    container.appendChild(groupLabel);
    group.items.forEach(function(item) {
      var btn = document.createElement('button');
      btn.style.cssText = 'width:100%;padding:12px 16px;border-radius:12px;border:2px solid ' + (selectedRegionValue === item.val + '_' + item.name ? '#C4726A' : '#EDD9D4') + ';background:' + (selectedRegionValue === item.val + '_' + item.name ? '#FDF0E6' : '#fff') + ';cursor:pointer;display:flex;align-items:center;gap:10px;font-family:inherit;text-align:left';
      btn.innerHTML = '<span style="font-size:22px">' + item.flag + '</span><span style="font-size:14px;font-weight:600;color:#3D2B1F">' + item.name + '</span>';
      btn.onclick = (function(v, n) {
        return function() {
          selectedRegionValue = v + '_' + n;
          document.querySelectorAll('#region-list button').forEach(function(b) {
            b.style.borderColor = '#EDD9D4';
            b.style.background = '#fff';
          });
          btn.style.borderColor = '#C4726A';
          btn.style.background = '#FDF0E6';
          // Stocker juste la valeur région
          selectedRegionValue = v;
        };
      })(item.val, item.name);
      container.appendChild(btn);
    });
  });
}

function confirmRegion() {
  if (!selectedRegionValue) return;
  setRegion(selectedRegionValue);
}

function setRegion(r) {
  REGION = r;
  var flags = {fr:'🇫🇷',dz:'🇩🇿',ma:'🇲🇦',gb:'🇬🇧',es:'🇪🇸',de:'🇩🇪',other:'🌍'};
  var badge = document.getElementById('region-badge');
  if (badge) badge.textContent = (flags[r] || '🌍');
  go('welcome');
}

function getRegionProducts() {
  // Retourne les clés de produits disponibles pour la région courante
  var available = [];
  for (var key in DB) {
    var p = DB[key];
    // Si pas de champ region = disponible partout
    if (!p.region) { available.push(key); continue; }
    // Si le produit a une région, vérifier si la région courante est dedans
    if (p.region.indexOf(REGION) !== -1) { available.push(key); }
  }
  return available;
}

const SCREENS=["lang","welcome","register","login","scan","q1","diag","q2","q3","q4","q5","result","compare","suivi","dashboard"];

const ST={
  screen:'lang',user:null,
  skinType:null,ageGroup:null,
  concerns:[],allergies:[],
  budget:null,routine:null,
  result:null,showShare:false,
};

let PRODUCTS_CATALOG = null;
fetch('/data/products.json')
  .then(function(r){ return r.json(); })
  .then(function(data){ PRODUCTS_CATALOG = data; })
  .catch(function(){});

function go(screen){
  SCREENS.forEach(s=>{const el=document.getElementById("sc-"+s);if(el)el.classList.toggle("hidden",s!==screen);});
  ST.screen=screen;
  window.scrollTo(0,0);
  if(screen==='welcome') setTimeout(applyWelcomeLang,10);
}

function setLang(l){
  LANG = l;
  initQuestions();
  go('welcome');
  setTimeout(applyWelcomeLang, 50);
  // Afficher la modale région après 300ms
  setTimeout(function(){ showRegionModal(); }, 300);
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
function applyWelcomeLang(){
  const l = T[LANG]||T.fr;
  // Welcome
  const heroT = document.getElementById('welcome-headline');
  if(heroT) heroT.innerHTML = LANG==='en'?'Analyze your skin<br>in 60 seconds':'Analyse ta peau<br>en 60 secondes';
  const heroD = document.getElementById('welcome-tagline');
  if(heroD) heroD.textContent = LANG==='en'?'Discover your perfect routine, personalized for your skin type, age and budget.':'Découvre ta routine parfaite, personnalisée selon ton type de peau, ton âge et ton budget.';
  const badge = document.getElementById('welcome-badge');
  if(badge) badge.textContent = 'Skincare Intelligence';
  const btnStart = document.getElementById('btn-start-text');
  if(btnStart) btnStart.textContent = LANG==='en'?'Start my diagnosis':'Commencer mon diagnostic';
  const stat1 = document.getElementById('stat1-label');
  if(stat1) stat1.textContent = LANG==='en'?'products analyzed':'produits analysés';
  const stat2 = document.getElementById('stat2-label');
  if(stat2) stat2.textContent = LANG==='en'?'for your routine':'pour ta routine';
  const stat3 = document.getElementById('stat3-label');
  if(stat3) stat3.textContent = LANG==='en'?'personalized':'personnalisé';
  const el1 = document.getElementById('btn-reg');
  if(el1) el1.textContent = l.btn_register;
  const el2 = document.getElementById('btn-log');
  if(el2) el2.textContent = l.btn_login;
  const el3 = document.getElementById('btn-guest');
  if(el3) el3.textContent = l.btn_guest;
  const el4 = document.getElementById('btn-legal');
  if(el4) el4.textContent = l.legal;
  const orEl = document.querySelector('#sc-welcome .divider span');
  if(orEl) orEl.textContent = l.or;
  // Questions titles
  const q1t = document.getElementById('q1-title');
  if(q1t) q1t.textContent = l.q1_title||'Type de peau';
  const q1s = document.getElementById('q1-sub');
  if(q1s) q1s.textContent = l.q1_sub||'Choisissez celui qui vous correspond.';
  const q2t = document.getElementById('q2-title');
  if(q2t) q2t.textContent = l.q2_title||'Votre tranche d\'âge';
  const q2s = document.getElementById('q2-sub');
  if(q2s) q2s.textContent = l.q2_sub||'';
  // Boutons continuer
  const q1n = document.getElementById('q1-next');
  if(q1n) q1n.textContent = l.btn_continue||'Continuer';
  const q2n = document.getElementById('q2-next');
  if(q2n) q2n.textContent = l.btn_continue||'Continuer';
  const q3n = document.getElementById('q3-next');
  if(q3n) q3n.textContent = l.btn_continue||'Continuer';
  const q4n = document.getElementById('q4-next');
  if(q4n) q4n.textContent = l.btn_continue||'Continuer';
  const q5n = document.getElementById('q5-next');
  if(q5n) q5n.textContent = l.btn_generate||'Générer ma routine';
  // Q3 labels
  const q3t = document.querySelector('#sc-q3 h2');
  if(q3t) q3t.textContent = l.q3_title||'Vos problèmes de peau';
  const q3s = document.querySelector('#sc-q3 .sub');
  if(q3s) q3s.textContent = l.q3_sub||'';
  const q3al = document.querySelector('#sc-q3 .step-lbl:last-of-type');
  // Q4
  const q4t = document.querySelector('#sc-q4 h2');
  if(q4t) q4t.textContent = l.q4_title||'Votre budget';
  const q4s = document.querySelector('#sc-q4 .sub');
  if(q4s) q4s.textContent = l.q4_sub||'';
  // Q5
  const q5t = document.querySelector('#sc-q5 h2');
  if(q5t) q5t.textContent = l.q5_title||'Type de routine';
  const q5s = document.querySelector('#sc-q5 .sub');
  if(q5s) q5s.textContent = l.q5_sub||'';
  // Step labels
  for(let i=1;i<=5;i++){
    const slbl = document.getElementById('step-lbl-'+i);
    if(slbl) slbl.textContent = (LANG==='en'?'Step ':'Étape ') + i + ' / 5';
  }
  // Q2
  const q2title2 = document.getElementById('q2-title');
  if(q2title2) q2title2.textContent = l.q2_title||"Votre tranche d'âge";
  const q2sub2 = document.getElementById('q2-sub');
  if(q2sub2) q2sub2.textContent = l.q2_sub||'';
  // Q3
  const q3title = document.getElementById('q3-title');
  if(q3title) q3title.textContent = l.q3_title||'Vos problèmes de peau';
  const q3sub = document.getElementById('q3-sub');
  if(q3sub) q3sub.textContent = l.q3_sub||'';
  // Q4
  const q4title = document.getElementById('q4-title');
  if(q4title) q4title.textContent = l.q4_title||'Votre budget';
  const q4sub = document.getElementById('q4-sub');
  if(q4sub) q4sub.textContent = l.q4_sub||'';
  // Q5
  const q5title = document.getElementById('q5-title');
  if(q5title) q5title.textContent = l.q5_title||'Type de routine';
  const q5sub = document.getElementById('q5-sub');
  if(q5sub) q5sub.textContent = l.q5_sub||'';
  // Boutons continuer de toutes les étapes
  ['q1-next','q2-next','q3-next','q4-next'].forEach(id => {
    const btn = document.getElementById(id);
    if(btn) btn.textContent = l.btn_continue||'Continuer';
  });
  const q5btn = document.getElementById('q5-next');
  if(q5btn) q5btn.textContent = l.btn_generate||'Générer ma routine';
  // Boutons retour
  document.querySelectorAll('.btn-back').forEach(b => {
    if(b.textContent.includes('Retour') || b.textContent.includes('Back'))
      b.textContent = LANG==='en' ? '← Back' : '← Retour';
  });
  // Bouton scan
  const compareTop = document.getElementById('btn-compare-top');
  if(compareTop) compareTop.innerHTML = '⚖️ ' + (LANG==='en' ? 'Compare' : 'Comparer');
  const scanBtn = document.getElementById('btn-scan-text');
  if(scanBtn) scanBtn.textContent = LANG==='en' ? 'Scan my skin with AI' : 'Scanner ma peau avec l\'IA';
  // Écran scan
  const scanEy = document.getElementById('scan-eyebrow');
  if(scanEy) scanEy.textContent = LANG==='en' ? 'AI Analysis · Beta' : 'Analyse IA · Bêta';
  const scanT = document.getElementById('scan-title');
  if(scanT) scanT.textContent = LANG==='en' ? 'Skin scan' : 'Scan de votre peau';
  const scanS = document.getElementById('scan-sub');
  if(scanS) scanS.textContent = LANG==='en' ? 'Take a photo or upload one. Our AI analyzes your skin in seconds.' : 'Prenez une photo de votre visage ou importez-en une. Notre IA analyse votre peau en quelques secondes.';
  const scanUploadTxt = document.getElementById('scan-upload-text');
  if(scanUploadTxt) scanUploadTxt.textContent = LANG==='en' ? 'Tap to take or import a photo' : 'Appuyez pour prendre ou importer une photo';
  const scanApply = document.getElementById('scan-apply-btn');
  if(scanApply) scanApply.textContent = LANG==='en' ? 'Use these results for my routine' : 'Utiliser ces résultats pour ma routine';
  const scanRetry = document.getElementById('scan-retry-btn');
  if(scanRetry) scanRetry.textContent = LANG==='en' ? 'Retake a photo' : 'Reprendre une photo';
  const scanBtnTxt = document.getElementById('scan-btn-text');
  if(scanBtnTxt && !scanBtnTxt.textContent.includes("...")) scanBtnTxt.textContent = LANG==="en" ? "Analyze my skin" : "Analyser ma peau";
  // Bouton diagnostic
  const diagBtn = document.querySelector('#q1-opts .sr');
  if(diagBtn){
    const rl = diagBtn.querySelector('.rl');
    const rs = diagBtn.querySelector('.rs');
    if(rl) rl.textContent = LANG==='en' ? 'Determine my skin type' : 'Déterminer mon type de peau';
    if(rs) rs.textContent = LANG==='en' ? 'Answer 5 questions to find out' : 'Répondez à 5 questions pour le découvrir';
  }
  // Boutons retour (← Retour / ← Back)
  document.querySelectorAll('.btn-back').forEach(b=>{
    b.textContent = (LANG==='en' ? '← Back' : '← Retour');
  });
  // Lang button
  document.querySelectorAll('[onclick="go(\'lang\')"]').forEach(b=>{
    // keep as is
  });
}

function doRegister(){
  const n=document.getElementById("inp-name").value.trim();
  const e=document.getElementById("inp-email-r").value.trim();
  const p=document.getElementById("inp-pw-r").value;
  const err=document.getElementById("err-r");
  if(!n){err.textContent="Veuillez entrer votre prénom.";err.classList.remove("hidden");return;}
  if(!e.includes("@")){err.textContent="Email invalide.";err.classList.remove("hidden");return;}
  if(p.length<6){err.textContent="Mot de passe : 6 caractères minimum.";err.classList.remove("hidden");return;}
  err.classList.add("hidden");
  ST.user={name:n,email:e};
  initQuestions();go("q1");
}
function doLogin(){
  const e=document.getElementById("inp-email-l").value.trim();
  const p=document.getElementById("inp-pw-l").value;
  const err=document.getElementById("err-l");
  if(!e.includes("@")){err.textContent="Email invalide.";err.classList.remove("hidden");return;}
  if(!p){err.textContent="Mot de passe requis.";err.classList.remove("hidden");return;}
  err.classList.add("hidden");
  ST.user={name:e.split("@")[0],email:e};
  initQuestions();go("q1");
}

// ─── QUESTIONS INIT ───────────────────────────────────────────────────────────
function initQuestions(){
  const l = T[LANG]||T.fr;
  // Q1 - type de peau avec illustrations SVG
  const skinIcons = {

    seche: `<div style="width:64px;height:64px;border-radius:16px;background:#EEF6FB;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;flex-shrink:0">
      <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
        <ellipse cx="19" cy="21" rx="11" ry="13" fill="#B8D8E8" stroke="#8ABCD4" stroke-width="1.2"/>
        <ellipse cx="15" cy="19" rx="1.5" ry="1.8" fill="#5A9AB5"/>
        <ellipse cx="23" cy="19" rx="1.5" ry="1.8" fill="#5A9AB5"/>
        <path d="M16 26 Q19 24 22 26" stroke="#5A9AB5" stroke-width="1.3" fill="none" stroke-linecap="round"/>
        <!-- Tiraillements partout : front, joues gauche, joues droite, menton -->
        <path d="M14 9 L13 7 M19 8.5 L19 6.5 M24 9 L25 7" stroke="#8ABCD4" stroke-width="1.2" stroke-linecap="round"/>
        <path d="M8 16 L6 15.5 M8 20 L6 20 M8 24 L6 24.5" stroke="#8ABCD4" stroke-width="1.2" stroke-linecap="round"/>
        <path d="M30 16 L32 15.5 M30 20 L32 20 M30 24 L32 24.5" stroke="#8ABCD4" stroke-width="1.2" stroke-linecap="round"/>
        <path d="M14 33 L13 35 M19 33.5 L19 35.5 M24 33 L25 35" stroke="#8ABCD4" stroke-width="1.2" stroke-linecap="round"/>
      </svg>
      <div style="font-size:9px;font-weight:700;color:#5A9AB5;letter-spacing:.3px">${LANG==="en"?"DRY":"SÈCHE"}</div>
    </div>`,

    grasse: `<div style="width:64px;height:64px;border-radius:16px;background:#FFFBE8;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;flex-shrink:0">
      <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
        <ellipse cx="19" cy="21" rx="11" ry="13" fill="#F5E090" stroke="#C8A830" stroke-width="1.2"/>
        <ellipse cx="15" cy="19" rx="1.5" ry="1.8" fill="#A08020"/>
        <ellipse cx="23" cy="19" rx="1.5" ry="1.8" fill="#A08020"/>
        <path d="M16 26 Q19 28 22 26" stroke="#A08020" stroke-width="1.3" fill="none" stroke-linecap="round"/>
        <ellipse cx="10" cy="20" rx="3.5" ry="2" fill="#FFD840" opacity=".6"/>
        <ellipse cx="28" cy="20" rx="3.5" ry="2" fill="#FFD840" opacity=".6"/>
        <circle cx="19" cy="10" r="2" fill="#FFD840" opacity=".5"/>
        <circle cx="13" cy="13" r="1.2" fill="#FFD840" opacity=".4"/>
        <circle cx="25" cy="13" r="1.2" fill="#FFD840" opacity=".4"/>
      </svg>
      <div style="font-size:9px;font-weight:700;color:#A08020;letter-spacing:.3px">${LANG==="en"?"OILY":"GRASSE"}</div>
    </div>`,

    mixte: `<div style="width:64px;height:64px;border-radius:16px;background:#F0F8F0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;flex-shrink:0">
      <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
        <ellipse cx="19" cy="21" rx="11" ry="13" fill="#C8E8C8" stroke="#70B870" stroke-width="1.2"/>
        <ellipse cx="15" cy="19" rx="1.5" ry="1.8" fill="#3A8050"/>
        <ellipse cx="23" cy="19" rx="1.5" ry="1.8" fill="#3A8050"/>
        <path d="M16 26 Q19 27 22 26" stroke="#3A8050" stroke-width="1.3" fill="none" stroke-linecap="round"/>
        <!-- Zone T grasse au milieu -->
        <ellipse cx="19" cy="14" rx="3" ry="4" fill="#70B870" opacity=".4"/>
        <!-- Ligne de séparation -->
        <line x1="19" y1="9" x2="19" y2="33" stroke="#70B870" stroke-width="1" stroke-dasharray="2,2" opacity=".5"/>
      </svg>
      <div style="font-size:9px;font-weight:700;color:#3A8050;letter-spacing:.3px">${LANG==="en"?"COMBO":"MIXTE"}</div>
    </div>`,

    normale: `<div style="width:64px;height:64px;border-radius:16px;background:#F4F0FF;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;flex-shrink:0">
      <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
        <ellipse cx="19" cy="21" rx="11" ry="13" fill="#D8D0F0" stroke="#9080C0" stroke-width="1.2"/>
        <ellipse cx="15" cy="19" rx="1.5" ry="1.8" fill="#6050A0"/>
        <ellipse cx="23" cy="19" rx="1.5" ry="1.8" fill="#6050A0"/>
        <path d="M16 26 Q19 28 22 26" stroke="#6050A0" stroke-width="1.3" fill="none" stroke-linecap="round"/>
        <path d="M13 16 Q15 14.5 17 16" stroke="#9080C0" stroke-width="1" fill="none" stroke-linecap="round"/>
        <path d="M21 16 Q23 14.5 25 16" stroke="#9080C0" stroke-width="1" fill="none" stroke-linecap="round"/>
      </svg>
      <div style="font-size:9px;font-weight:700;color:#6050A0;letter-spacing:.3px">${LANG==="en"?"NORMAL":"NORMALE"}</div>
    </div>`,

    sensible: `<div style="width:64px;height:64px;border-radius:16px;background:#FFF0F0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;flex-shrink:0">
      <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
        <ellipse cx="19" cy="21" rx="11" ry="13" fill="#F5CFC8" stroke="#E0A89E" stroke-width="1.2"/>
        <!-- Grosses rougeurs très visibles sur les joues -->
        <ellipse cx="10" cy="23" rx="5.5" ry="3.5" fill="#E84040" opacity=".5"/>
        <ellipse cx="28" cy="23" rx="5.5" ry="3.5" fill="#E84040" opacity=".5"/>
        <!-- Yeux -->
        <ellipse cx="15" cy="19" rx="1.5" ry="1.8" fill="#6B3F35"/>
        <ellipse cx="23" cy="19" rx="1.5" ry="1.8" fill="#6B3F35"/>
        <!-- Sourcils légèrement froncés -->
        <path d="M13 16.5 Q15 15.5 17 16.5" stroke="#6B3F35" stroke-width="1.2" fill="none" stroke-linecap="round"/>
        <path d="M21 16.5 Q23 15.5 25 16.5" stroke="#6B3F35" stroke-width="1.2" fill="none" stroke-linecap="round"/>
        <!-- Bouche légèrement triste -->
        <path d="M16 27 Q19 25 22 27" stroke="#6B3F35" stroke-width="1.3" fill="none" stroke-linecap="round"/>
        <!-- Petits points rougeur sur le front -->
        <circle cx="16" cy="12" r="1.2" fill="#E84040" opacity=".5"/>
        <circle cx="19" cy="11" r="1" fill="#E84040" opacity=".4"/>
        <circle cx="22" cy="12" r="1.2" fill="#E84040" opacity=".5"/>
      </svg>
      <div style="font-size:9px;font-weight:700;color:#D04444;letter-spacing:.3px">${LANG==="en"?"SENSITIVE":"SENSIBLE"}</div>
    </div>`,

  };
  const skinTypes=[
    {id:"seche",    label:l.skin_seche||"Sèche",       sub:l.skin_seche_sub||"Tiraillements"},
    {id:"grasse",   label:l.skin_grasse||"Grasse",      sub:l.skin_grasse_sub||"Brillance"},
    {id:"mixte",    label:l.skin_mixte||"Mixte",        sub:l.skin_mixte_sub||"Zone T"},
    {id:"normale",  label:l.skin_normale||"Normale",    sub:l.skin_normale_sub||"Équilibrée"},
    {id:"sensible", label:l.skin_sensible||"Sensible",  sub:l.skin_sensible_sub||"Réactive"},
  ];
  // Bouton "Déterminer mon type de peau" en premier
  const diagBtn = `<button class="sr" onclick="startDiag()" style="align-items:center;gap:14px;padding:12px 14px;border-color:#C4726A;background:var(--blush)">
    <div style="flex-shrink:0;width:52px;height:52px;border-radius:16px;background:#C4726A;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>
      <div style="font-size:8px;font-weight:700;color:white;letter-spacing:.3px">TEST</div>
    </div>
    <div style="flex:1;text-align:left">
      <div class="rl" style="font-size:14px;color:#C4726A">Déterminer mon type de peau</div>
      <div class="rs">Répondez à 5 questions pour le découvrir</div>
    </div>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#C4726A"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>
  </button>
  <div style="display:flex;align-items:center;gap:10px;margin:6px 0 10px"><hr style="flex:1;border:none;border-top:1px solid var(--bdr)"><span style="font-size:11px;color:var(--mut)">${LANG==='en'?'or choose directly':'ou choisir directement'}</span><hr style="flex:1;border:none;border-top:1px solid var(--bdr)"></div>`;

  document.getElementById("q1-opts").innerHTML = diagBtn + skinTypes.map(t=>`
    <button class="sr" onclick="pickSkin('${t.id}',this)" style="align-items:center;gap:14px;padding:12px 14px">
      <div style="flex-shrink:0;width:52px;height:52px">${skinIcons[t.id]}</div>
      <div style="flex:1;text-align:left">
        <div class="rl" style="font-size:14px">${t.label}</div>
        <div class="rs">${t.sub}</div>
      </div>
      <svg class="ck" viewBox="0 0 24 24" fill="#C4887F"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
    </button>`).join("");
  // Q2 - age
  const ageData=l.ages||[{id:"18-25",label:"18-25 ans",sub:""},{id:"26-35",label:"26-35 ans",sub:""},{id:"36-45",label:"36-45 ans",sub:""},{id:"46+",label:"46+ ans",sub:""}];
  const ages=ageData;
  document.getElementById("q2-opts").innerHTML=ages.map(a=>`<button class="sr" onclick="pickAge('${a.id}',this)"><div><div class="rl">${a.label}</div><div class="rs">${a.sub}</div></div><svg class="ck" viewBox="0 0 24 24" fill="#2C2C2C"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></button>`).join("");
  // Q3 - concerns
  const cIds=["acne","taches","rides","pores","rougeurs","cernes","eclat","deshydratation","imperfections","sensibilite"];
  const concernsRaw=l.concerns||[];
  const concerns=cIds.map((id,i)=>{
    const raw=concernsRaw[i];
    return {id, label: typeof raw==='object'?raw.label:raw||id};
  });
  document.getElementById("q3-concerns").innerHTML=concerns.map(c=>`<button class="chip" onclick="togConcern('${c.id}',this)">${c.label}</button>`).join("");
  const allergies=l.allergies;
  document.getElementById("q3-allergies").innerHTML=allergies.map(a=>`<button class="chip" onclick="togAllergy(this)">${a}</button>`).join("");
  // Q4 - budget
  const budgetsRaw=l.budgets||[];
  const budgets=budgetsRaw.length?budgetsRaw:[
    {id:"low",label:"Économique",sub:"< 15€",phrase:"Les meilleures formules ne coûtent pas forcément cher 💛"},
    {id:"mid",label:"Modéré",sub:"15-50€",phrase:"Le bon équilibre entre efficacité et budget "},
    {id:"high",label:"Premium",sub:"> 50€",phrase:"La haute cosmétique au service de votre peau "},
    {id:"mix",label:"Flexible",sub:"Pas de limite",phrase:"On mixe le meilleur pour vous"},
  ];
  document.getElementById("q4-opts").innerHTML=budgets.map(b=>`
    <button class="sr" onclick="pickBudget('${b.id}',this)" style="flex-direction:column;align-items:flex-start;gap:4px;padding:14px 16px">
      <div style="display:flex;justify-content:space-between;align-items:center;width:100%">
        <div>
          <div class="rl">${b.label}</div>
          <div class="rs">${b.sub}</div>
        </div>
        <svg class="ck" viewBox="0 0 24 24" fill="#C4726A"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
      </div>
      <div class="budget-phrase" style="font-size:11px;color:#C4726A;font-style:italic;display:none">${b.phrase||''}</div>
    </button>`).join("");
  // Q5 - routine
  const routinesRaw=l.routines||[];
  const routines=routinesRaw.length?routinesRaw:[
    {id:"simple",label:"Essentielle",sub:"3 étapes"},
    {id:"complete",label:"Complète",sub:"Matin + soir"},
    {id:"specifique",label:"Ciblée",sub:"Un seul soin"},
  ];
  document.getElementById("q5-opts").innerHTML=routines.map(r=>`<button class="sr" onclick="pickRoutine('${r.id}',this)"><div><div class="rl">${r.label}</div><div class="rs">${r.sub}</div></div><svg class="ck" viewBox="0 0 24 24" fill="#2C2C2C"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></button>`).join("");
}

// ─── SCAN DE PEAU IA ─────────────────────────────────────────────────────────
var scanBase64 = null;
var scanResult = null;

function handleScanFile(input) {
    var file = input.files[0];
    if (!file) return;
    loadScanImage(file);
}

function handleScanDrop(e) {
    e.preventDefault();
    var file = e.dataTransfer.files[0];
    if (file && file.type.indexOf("image") === 0) loadScanImage(file);
}

function loadScanImage(file) {
    var reader = new FileReader();
    reader.onload = function(e) {
        var dataUrl = e.target.result;
        scanBase64 = dataUrl.split(",")[1];
        document.getElementById("scan-img").src = dataUrl;
        document.getElementById("scan-upload-zone").style.display = "none";
        document.getElementById("scan-preview").style.display = "block";
        document.getElementById("scan-btn").disabled = false;
    };
    reader.readAsDataURL(file);
}

function resetScan() {
    scanBase64 = null;
    scanResult = null;
    document.getElementById("scan-upload-zone").style.display = "block";
    document.getElementById("scan-preview").style.display = "none";
    document.getElementById("scan-result").style.display = "none";
    document.getElementById("scan-btn").disabled = true;
    document.getElementById("scan-file-input").value = "";
}

function analyzeSkin() {
    if (!scanBase64) return;
    var isEN = LANG === "en";
    document.getElementById("scan-result").style.display = "block";
    document.getElementById("scan-loading").style.display = "block";
    document.getElementById("scan-analysis").style.display = "none";
    document.getElementById("scan-btn").disabled = true;
    document.getElementById("scan-btn-text").textContent = isEN ? "Analyzing..." : "Analyse en cours...";

    var promptEN = "You are a professional dermatologist. Analyze this face photo and respond ONLY with a valid JSON object, no markdown, no explanation:\n{\"skinType\":\"dry|oily|combination|normal|sensitive\",\"skinTypeLabel\":\"string\",\"confidence\":\"High|Medium|Low\",\"description\":\"2-3 sentences about the skin\",\"concerns\":[\"concern1\"],\"advice\":\"one expert tip\",\"prefilledConcerns\":[\"acne|taches|rides|pores|rougeurs|cernes|eclat|deshydratation|imperfections|sensibilite\"]}";

    var promptFR = "Tu es un dermatologue professionnel. Analyse cette photo de visage et reponds UNIQUEMENT avec un objet JSON valide, sans markdown, sans explication:\n{\"skinType\":\"seche|grasse|mixte|normale|sensible\",\"skinTypeLabel\":\"string\",\"confidence\":\"Elevee|Moyenne|Faible\",\"description\":\"2-3 phrases sur la peau\",\"concerns\":[\"probleme1\"],\"advice\":\"un conseil expert\",\"prefilledConcerns\":[\"acne|taches|rides|pores|rougeurs|cernes|eclat|deshydratation|imperfections|sensibilite\"]}";

    var prompt = isEN ? promptEN : promptFR;

    fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "claude-sonnet-4-5-20251001",
            max_tokens: 1000,
            messages: [{
                role: "user",
                content: [
                    { type: "image", source: { type: "base64", media_type: "image/jpeg", data: scanBase64 } },
                    { type: "text", text: prompt }
                ]
            }]
        })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
        var rawText = data.content && data.content[0] ? data.content[0].text : "";
        var analysis;
        try {
            var clean = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
            analysis = JSON.parse(clean);
        } catch(e) {
            var match = rawText.match(/\{[\s\S]*\}/);
            if (match) {
                analysis = JSON.parse(match[0]);
            } else {
                throw new Error("Invalid JSON");
            }
        }
        scanResult = analysis;
        showScanResult(analysis);
    })
    .catch(function(err) {
        console.error("Scan error:", err);
        document.getElementById("scan-loading").style.display = "none";
        document.getElementById("scan-btn").disabled = false;
        document.getElementById("scan-btn-text").textContent = isEN ? "Retry" : "Reessayer";
        alert(isEN ? "Analysis failed. Please try again with a clearer photo." : "Analyse echouee. Reessayez avec une photo plus nette.");
    });
}

function showScanResult(a) {
    document.getElementById("scan-loading").style.display = "none";
    document.getElementById("scan-analysis").style.display = "block";
    document.getElementById("scan-btn-text").textContent = LANG === "en" ? "Analyze my skin" : "Analyser ma peau";

    var icons = { seche:"", dry:"", grasse:"", oily:"", mixte:"🌓", combination:"🌓", normale:"", normal:"", sensible:"🌸", sensitive:"🌸" };
    document.getElementById("scan-type-icon").textContent = icons[a.skinType] || "";
    document.getElementById("scan-type-label").textContent = a.skinTypeLabel || a.skinType;
    document.getElementById("scan-confidence").textContent = (LANG === "en" ? "Confidence: " : "Confiance : ") + a.confidence;
    document.getElementById("scan-description").textContent = a.description;
    document.getElementById("scan-advice").textContent = "💡 " + a.advice;

    if (a.concerns && a.concerns.length > 0) {
        document.getElementById("scan-concerns-wrap").style.display = "block";
        document.getElementById("scan-concerns-list").innerHTML = a.concerns.map(function(c) {
            return "<span style=\"background:#FDF0E6;color:#8B6F47;border-radius:20px;padding:4px 12px;font-size:11px;font-weight:600\">" + c + "</span>";
        }).join("");
    }
}

function applyScanResult() {
    if (!scanResult) return;
    var typeMap = { seche:"seche", dry:"seche", grasse:"grasse", oily:"grasse", mixte:"mixte", combination:"mixte", normale:"normale", normal:"normale", sensible:"sensible", sensitive:"sensible" };
    ST.skinType = typeMap[scanResult.skinType] || "normale";
    if (scanResult.prefilledConcerns && Array.isArray(scanResult.prefilledConcerns)) {
        var valid = ["acne","taches","rides","pores","rougeurs","cernes","eclat","deshydratation","imperfections","sensibilite"];
        ST.concerns = scanResult.prefilledConcerns.filter(function(c) { return valid.indexOf(c) !== -1; });
    }
    initQuestions();
    go("q2");
    setTimeout(function() {
        document.getElementById("q1-next").disabled = false;
    }, 100);
}

// ─── DIAGNOSTIC TYPE DE PEAU ──────────────────────────────────────────────────
function getDiagQuestions(){
  const isEN = LANG === 'en';
  return [
  {
    q: isEN ? "In the morning when you wake up, your skin is..." : "Le matin au réveil, votre peau est...",
    sub: isEN ? "Before any skincare" : "Avant tout soin",
    opts: [
      {label: isEN ? "Tight and uncomfortable" : "Tiraillée, inconfortable", scores:{seche:3,normale:0,mixte:0,grasse:0,sensible:1}},
      {label: isEN ? "Normal and comfortable" : "Normale, confortable",     scores:{seche:0,normale:3,mixte:1,grasse:0,sensible:0}},
      {label: isEN ? "Oily on forehead and nose" : "Grasse sur le front et le nez", scores:{seche:0,normale:0,mixte:3,grasse:1,sensible:0}},
      {label: isEN ? "Oily everywhere" : "Grasse partout",                  scores:{seche:0,normale:0,mixte:0,grasse:3,sensible:0}},
      {label: isEN ? "Irritated or red" : "Irritée ou rouge",               scores:{seche:1,normale:0,mixte:0,grasse:0,sensible:3}},
    ]
  },
  {
    q: isEN ? "Your pores are..." : "Vos pores sont...",
    sub: isEN ? "Look in a mirror in bright light" : "Regardez-vous dans un miroir en pleine lumière",
    opts: [
      {label: isEN ? "Invisible or very fine" : "Invisibles ou très fins",   scores:{seche:2,normale:2,mixte:0,grasse:0,sensible:1}},
      {label: isEN ? "Visible only on the nose" : "Visibles uniquement sur le nez", scores:{seche:0,normale:1,mixte:3,grasse:1,sensible:0}},
      {label: isEN ? "Enlarged all over the face" : "Dilatés sur tout le visage", scores:{seche:0,normale:0,mixte:1,grasse:3,sensible:0}},
      {label: isEN ? "Barely visible but reactive skin" : "Peu visibles mais peau réactive", scores:{seche:1,normale:0,mixte:0,grasse:0,sensible:3}},
    ]
  },
  {
    q: isEN ? "In the middle of the day without skincare..." : "En milieu de journée sans soin, votre peau...",
    sub: isEN ? "Around 2-3pm" : "Vers 14h-15h",
    opts: [
      {label: isEN ? "Feels tight and uncomfortable" : "Tire et est inconfortable", scores:{seche:3,normale:0,mixte:0,grasse:0,sensible:1}},
      {label: isEN ? "Looks normal, no shine" : "Est normale, pas de brillance", scores:{seche:0,normale:3,mixte:0,grasse:0,sensible:0}},
      {label: isEN ? "Shines only on the T-zone" : "Brille sur la zone T seulement", scores:{seche:0,normale:0,mixte:3,grasse:1,sensible:0}},
      {label: isEN ? "Shines all over" : "Brille sur tout le visage",       scores:{seche:0,normale:0,mixte:0,grasse:3,sensible:0}},
      {label: isEN ? "Gets red or reactive" : "Rougit ou réagit facilement", scores:{seche:0,normale:0,mixte:0,grasse:0,sensible:3}},
    ]
  },
  {
    q: isEN ? "When you try new products, your skin..." : "Votre peau réagit aux nouveaux produits...",
    sub: isEN ? "First use" : "Première utilisation",
    opts: [
      {label: isEN ? "Rarely reacts, tolerates well" : "Rarement, elle tolère bien",  scores:{seche:1,normale:2,mixte:2,grasse:1,sensible:0}},
      {label: isEN ? "Sometimes mild irritation" : "Parfois de légères irritations",   scores:{seche:1,normale:1,mixte:1,grasse:0,sensible:2}},
      {label: isEN ? "Often redness or tingling" : "Souvent rougeurs ou picotements", scores:{seche:0,normale:0,mixte:0,grasse:0,sensible:3}},
      {label: isEN ? "Breakouts or blemishes" : "Avec des boutons ou imperfections",  scores:{seche:0,normale:0,mixte:1,grasse:2,sensible:1}},
    ]
  },
  {
    q: isEN ? "After washing your face (no moisturizer)..." : "Après avoir lavé votre visage (sans crème)...",
    sub: isEN ? "In the 30 minutes after" : "Les 30 minutes qui suivent",
    opts: [
      {label: isEN ? "Very tight and uncomfortable" : "Peau très tirée, inconfortable", scores:{seche:3,normale:0,mixte:0,grasse:0,sensible:1}},
      {label: isEN ? "Slightly tight, it passes" : "Légèrement tiraillée, ça passe",   scores:{seche:1,normale:2,mixte:1,grasse:0,sensible:0}},
      {label: isEN ? "Normal but nose gets oily quickly" : "Normale mais le nez devient vite gras", scores:{seche:0,normale:0,mixte:3,grasse:1,sensible:0}},
      {label: isEN ? "Gets oily again quickly" : "Redevient grasse rapidement",         scores:{seche:0,normale:0,mixte:0,grasse:3,sensible:0}},
      {label: isEN ? "Red or irritated" : "Rouge ou irritée",                           scores:{seche:0,normale:0,mixte:0,grasse:0,sensible:3}},
    ]
  },
];}

const DIAG_QUESTIONS = [
  {
    q: "Le matin au réveil, votre peau est...",
    sub: "Avant tout soin",
    opts: [
      {label:"Tiraillée, inconfortable", scores:{seche:3,normale:0,mixte:0,grasse:0,sensible:1}},
      {label:"Normale, confortable",     scores:{seche:0,normale:3,mixte:1,grasse:0,sensible:0}},
      {label:"Grasse sur le front et le nez", scores:{seche:0,normale:0,mixte:3,grasse:1,sensible:0}},
      {label:"Grasse partout",           scores:{seche:0,normale:0,mixte:0,grasse:3,sensible:0}},
      {label:"Irritée ou rouge",         scores:{seche:1,normale:0,mixte:0,grasse:0,sensible:3}},
    ]
  },
  {
    q: "Vos pores sont...",
    sub: "Regardez-vous dans un miroir en pleine lumière",
    opts: [
      {label:"Invisibles ou très fins",  scores:{seche:2,normale:2,mixte:0,grasse:0,sensible:1}},
      {label:"Visibles uniquement sur le nez", scores:{seche:0,normale:1,mixte:3,grasse:1,sensible:0}},
      {label:"Dilatés sur tout le visage", scores:{seche:0,normale:0,mixte:1,grasse:3,sensible:0}},
      {label:"Peu visibles mais peau réactive", scores:{seche:1,normale:0,mixte:0,grasse:0,sensible:3}},
    ]
  },
  {
    q: "En milieu de journée sans soin, votre peau...",
    sub: "Vers 14h-15h",
    opts: [
      {label:"Tire et est inconfortable", scores:{seche:3,normale:0,mixte:0,grasse:0,sensible:1}},
      {label:"Est normale, pas de brillance", scores:{seche:0,normale:3,mixte:0,grasse:0,sensible:0}},
      {label:"Brille sur la zone T seulement", scores:{seche:0,normale:0,mixte:3,grasse:1,sensible:0}},
      {label:"Brille sur tout le visage", scores:{seche:0,normale:0,mixte:0,grasse:3,sensible:0}},
      {label:"Rougit ou réagit facilement", scores:{seche:0,normale:0,mixte:0,grasse:0,sensible:3}},
    ]
  },
  {
    q: "Votre peau réagit aux nouveaux produits...",
    sub: "Première utilisation",
    opts: [
      {label:"Rarement, elle tolère bien",  scores:{seche:1,normale:2,mixte:2,grasse:1,sensible:0}},
      {label:"Parfois de légères irritations", scores:{seche:1,normale:1,mixte:1,grasse:0,sensible:2}},
      {label:"Souvent rougeurs ou picotements", scores:{seche:0,normale:0,mixte:0,grasse:0,sensible:3}},
      {label:"Avec des boutons ou imperfections", scores:{seche:0,normale:0,mixte:1,grasse:2,sensible:1}},
    ]
  },
  {
    q: "Après avoir lavé votre visage (sans crème)...",
    sub: "Les 30 minutes qui suivent",
    opts: [
      {label:"Peau très tirée, inconfortable", scores:{seche:3,normale:0,mixte:0,grasse:0,sensible:1}},
      {label:"Légèrement tiraillée, ça passe", scores:{seche:1,normale:2,mixte:1,grasse:0,sensible:0}},
      {label:"Normale mais le nez devient vite gras", scores:{seche:0,normale:0,mixte:3,grasse:1,sensible:0}},
      {label:"Redevient grasse rapidement", scores:{seche:0,normale:0,mixte:0,grasse:3,sensible:0}},
      {label:"Rouge ou irritée",            scores:{seche:0,normale:0,mixte:0,grasse:0,sensible:3}},
    ]
  },
];

function getDiagResults(){
  const isEN = LANG === 'en';
  return {
    seche:    {label: isEN?"Dry Skin":"Peau Sèche",       id:"seche",    desc: isEN?"Your skin lacks lipids and moisture. It feels tight, may flake and is uncomfortable. It needs rich nourishing and hydrating care.":"Votre peau manque de lipides et d'hydratation. Elle tire, peut peler et est inconfortable. Elle a besoin de soins nourrissants et hydratants riches."},
    grasse:   {label: isEN?"Oily Skin":"Peau Grasse",     id:"grasse",   desc: isEN?"Your skin produces too much sebum. Shine, enlarged pores and blemishes are your main concerns. Purifying and sebum-regulating products are essential.":"Votre peau produit trop de sébum. Brillance, pores dilatés et imperfections sont vos préoccupations principales. Des soins purifiants et séboregulateurs sont essentiels."},
    mixte:    {label: isEN?"Combination Skin":"Peau Mixte",id:"mixte",   desc: isEN?"Your T-zone (forehead, nose, chin) is oily while your cheeks are normal or dry. You need balancing products.":"Votre zone T (front, nez, menton) est grasse tandis que vos joues sont normales ou sèches. Vous avez besoin de produits équilibrants."},
    normale:  {label: isEN?"Normal Skin":"Peau Normale",  id:"normale",  desc: isEN?"Your skin is well-balanced, neither too oily nor too dry. You have few imperfections. Maintain this balance with a simple routine.":"Votre peau est bien équilibrée, ni trop grasse ni trop sèche. Vous avez peu d'imperfections. Maintenez cet équilibre avec une routine simple."},
    sensible: {label: isEN?"Sensitive Skin":"Peau Sensible",id:"sensible",desc: isEN?"Your skin reacts easily to external aggressors. Redness, tingling and irritation are frequent. Gentle and soothing products are essential.":"Votre peau réagit facilement aux agressions extérieures. Rougeurs, picotements et irritations sont fréquents. Des produits doux et apaisants sont indispensables."}
  };
}

const DIAG_RESULTS = {
  seche:    {label:"Peau Sèche",    id:"seche",    desc:"Votre peau manque de lipides et d'hydratation. Elle tire, peut peler et est inconfortable. Elle a besoin de soins nourrissants et hydratants riches."},
  grasse:   {label:"Peau Grasse",   id:"grasse",   desc:"Votre peau produit trop de sébum. Brillance, pores dilatés et imperfections sont vos préoccupations principales. Des soins purifiants et séboregulateurs sont essentiels."},
  mixte:    {label:"Peau Mixte",    id:"mixte",    desc:"Votre zone T (front, nez, menton) est grasse tandis que vos joues sont normales ou sèches. Vous avez besoin de produits équilibrants."},
  normale:  {label:"Peau Normale",  id:"normale",  desc:"Votre peau est bien équilibrée, ni trop grasse ni trop sèche. Vous avez peu d'imperfections. Maintenez cet équilibre avec une routine simple."},
  sensible: {label:"Peau Sensible", id:"sensible", desc:"Votre peau réagit facilement aux agressions extérieures. Rougeurs, picotements et irritations sont fréquents. Des produits doux et apaisants sont indispensables."},

  // ── ALGÉRIE — Marques locales ─────────────────────────────────────────────
  "dz-biophar-creme": {nom:"Crème Hydratante BioPharm",marque:"BioPharm Algérie",prix:"850 DA",link:"https://www.biopharmalger.com",yuka:78,yl:"Bon",usage:"Crème hydratante quotidienne",texture:"Crème légère",ak:["Glycérine","Aloe vera","Vitamine E"],comp:["Glycerin","Aloe Vera","Tocopherol"],clean:false,vegan:false,pq:"Peaux normales à sèches.",ben:"Hydrate et nourrit la peau au quotidien.",app:"Matin et soir.",moment:"AM+PM",ben_en:"Hydrates and nourishes skin daily.",region:["dz"]},
  "dz-biophar-gel": {nom:"Gel Nettoyant Purifiant BioPharm",marque:"BioPharm Algérie",prix:"650 DA",link:"https://www.biopharmalger.com",yuka:74,yl:"Bon",usage:"Gel nettoyant peaux mixtes à grasses",texture:"Gel moussant",ak:["Acide salicylique","Zinc","Aloe vera"],comp:["Salicylic Acid","Zinc","Aloe Vera"],clean:false,vegan:false,pq:"Peaux grasses et mixtes.",ben:"Nettoie et régule le sébum.",app:"Matin et soir.",moment:"AM+PM",ben_en:"Cleanses and regulates sebum.",region:["dz"]},
  "dz-saidal-huile": {nom:"Huile d'Argan Pure Saidal",marque:"Saidal",prix:"1200 DA",link:"https://www.saidal.dz",yuka:88,yl:"Excellent",usage:"Huile nourrissante visage et corps",texture:"Huile",ak:["Huile d'argan","Vitamine E","Oméga 9"],comp:["Argan Oil","Tocopherol","Oleic Acid"],clean:true,vegan:true,pq:"Peaux sèches à très sèches.",ben:"Nourrit et répare la barrière cutanée.",app:"Soir sur peau propre.",moment:"PM",ben_en:"Nourishes and repairs the skin barrier.",region:["dz"]},
  "dz-saidal-creme": {nom:"Crème Solaire SPF50 Saidal",marque:"Saidal",prix:"900 DA",link:"https://www.saidal.dz",yuka:70,yl:"Bon",usage:"Protection solaire SPF50",texture:"Crème fluide",ak:["Filtres UV","Glycérine","Aloe vera"],comp:["UV Filters","Glycerin","Aloe Vera"],clean:false,vegan:false,pq:"Tous types de peau.",ben:"Protège contre les UV en climat chaud.",app:"Le matin avant exposition.",moment:"AM",ben_en:"Protects against UV in hot climates.",region:["dz"]},
  "dz-atlas-rose": {nom:"Eau de Rose Pure Atlas",marque:"Atlas Cosmetics",prix:"500 DA",link:"https://atlascosmetics.dz",yuka:90,yl:"Excellent",usage:"Lotion tonique hydratante",texture:"Lotion",ak:["Eau de rose","Glycérine"],comp:["Rose Water","Glycerin"],clean:true,vegan:true,pq:"Tous types de peau, peaux sensibles.",ben:"Tonifie et hydrate après le nettoyage.",app:"Matin et soir après nettoyage.",moment:"AM+PM",ben_en:"Tones and hydrates after cleansing.",region:["dz"]},
  "dz-atlas-huile-nigelle": {nom:"Huile de Nigelle Noire Atlas",marque:"Atlas Cosmetics",prix:"700 DA",link:"https://atlascosmetics.dz",yuka:92,yl:"Excellent",usage:"Huile multi-usage anti-imperfections",texture:"Huile",ak:["Huile de nigelle","Thymoquinone","Oméga 6"],comp:["Black Seed Oil","Thymoquinone","Omega 6"],clean:true,vegan:true,pq:"Peaux avec imperfections, acné.",ben:"Réduit l'acné et les taches grâce à la thymoquinone.",app:"2-3 gouttes soir sur zones ciblées.",moment:"PM",ben_en:"Reduces acne and dark spots with thymoquinone.",region:["dz"]},
  "dz-diepharmex-creme": {nom:"Crème Réparatrice Diepharmex",marque:"Diepharmex",prix:"780 DA",link:"https://diepharmex.dz",yuka:76,yl:"Bon",usage:"Crème cicatrisante et réparatrice",texture:"Crème",ak:["Dexpanthenol","Allantoïne","Vitamine E"],comp:["Dexpanthenol","Allantoin","Tocopherol"],clean:false,vegan:false,pq:"Peaux sèches, irritées, cicatrices.",ben:"Répare et apaise les peaux abîmées.",app:"Matin et soir sur zones à traiter.",moment:"AM+PM",ben_en:"Repairs and soothes damaged skin.",region:["dz"]},
  "dz-henna-masque": {nom:"Masque Henné & Argile Ghassoul",marque:"Terrafine Algérie",prix:"450 DA",link:"https://terrafine.dz",yuka:85,yl:"Excellent",usage:"Masque purifiant argile & henné",texture:"Masque",ak:["Argile ghassoul","Henné","Huile d'olive"],comp:["Ghassoul Clay","Henna","Olive Oil"],clean:true,vegan:true,pq:"Peaux grasses à mixtes.",ben:"Purifie et matifie en profondeur.",app:"1-2x/semaine, laisser 10 min.",moment:"PM",ben_en:"Deep purifies and mattifies skin.",region:["dz"]},
  "dz-naturalia-serum": {nom:"Sérum Vitamine C Naturalia DZ",marque:"Naturalia DZ",prix:"1500 DA",link:"https://naturalia.dz",yuka:80,yl:"Excellent",usage:"Sérum éclat anti-taches",texture:"Sérum",ak:["Vitamine C","Niacinamide","Acide hyaluronique"],comp:["Ascorbic Acid","Niacinamide","Hyaluronic Acid"],clean:false,vegan:true,pq:"Peaux avec taches, teint terne.",ben:"Illumine et unifie le teint.",app:"Matin sur peau propre.",moment:"AM",ben_en:"Brightens and evens skin tone.",region:["dz"]},
  "dz-flair-spf": {nom:"Fluide SPF50+ Flair Pharma",marque:"Flair Pharma DZ",prix:"1100 DA",link:"https://flairpharma.dz",yuka:72,yl:"Bon",usage:"Protection solaire légère SPF50+",texture:"Fluide",ak:["Filtres UV","Vitamine E","Aloe vera"],comp:["UV Filters","Vitamin E","Aloe Vera"],clean:false,vegan:false,pq:"Tous types de peau.",ben:"Protection haute sans effet blanc.",app:"Le matin en dernière étape.",moment:"AM",ben_en:"High protection without white cast.",region:["dz"]},

  // ── MAROC ─────────────────────────────────────────────────────────────────
  "ma-nectarome-argan": {nom:"Huile d'Argan Bio Nectarome",marque:"Nectarome Maroc",prix:"180 MAD",link:"https://www.nectarome.com",yuka:92,yl:"Excellent",usage:"Huile d'argan bio pure",texture:"Huile",ak:["Huile d'argan","Vitamine E"],comp:["Argan Oil","Tocopherol"],clean:true,vegan:true,pq:"Tous types de peau, peaux sèches.",ben:"Nourrit et régénère intensément.",app:"Soir quelques gouttes.",moment:"PM",ben_en:"Intensely nourishes and regenerates.",region:["ma","dz","tn"]},
  "ma-zineglob-rose": {nom:"Eau de Rose Bio Zineglob",marque:"Zineglob",prix:"60 MAD",link:"https://zineglob.ma",yuka:88,yl:"Excellent",usage:"Eau de rose tonique pure",texture:"Lotion",ak:["Eau de rose pure","Glycérine"],comp:["Pure Rose Water","Glycerin"],clean:true,vegan:true,pq:"Tous types de peau.",ben:"Tonifie et hydrate après nettoyage.",app:"Matin et soir.",moment:"AM+PM",ben_en:"Tones and hydrates after cleansing.",region:["ma","dz","tn"]},
  "ma-sothys-argan": {nom:"Crème Argan & Beurre de Karité",marque:"Sothys Maroc",prix:"220 MAD",link:"https://www.sothys.ma",yuka:80,yl:"Excellent",usage:"Crème nourrissante peaux sèches",texture:"Crème riche",ak:["Argan","Karité","Vitamine E"],comp:["Argan Oil","Shea Butter","Tocopherol"],clean:false,vegan:false,pq:"Peaux sèches.",ben:"Nourrit et protège les peaux sèches.",app:"Matin et soir.",moment:"AM+PM",ben_en:"Nourishes and protects dry skin.",region:["ma"]},

  // ── INTERNATIONAL (UK / US / EU) ──────────────────────────────────────────
  "int-the-ordinary-ha": {nom:"Hyaluronic Acid 2% + B5",marque:"The Ordinary",prix:"8€ / £7",link:"https://theordinary.com",yuka:86,yl:"Excellent",usage:"Sérum hydratant acide hyaluronique",texture:"Sérum gel",ak:["Acide hyaluronique 2%","Vitamine B5"],comp:["Sodium Hyaluronate","Panthenol"],clean:false,vegan:true,pq:"Tous types de peau.",ben:"Hydratation intense en profondeur.",app:"Matin et soir avant la crème.",moment:"AM+PM",ben_en:"Intense deep hydration.",region:["gb","de","es","other"]},
  "int-the-ordinary-niac": {nom:"Niacinamide 10% + Zinc 1%",marque:"The Ordinary",prix:"6€ / £5",link:"https://theordinary.com",yuka:84,yl:"Excellent",usage:"Sérum anti-imperfections et pores",texture:"Sérum",ak:["Niacinamide 10%","Zinc 1%"],comp:["Niacinamide","Zinc PCA"],clean:false,vegan:true,pq:"Peaux grasses, pores dilatés, imperfections.",ben:"Réduit les pores et régule le sébum.",app:"Matin et soir.",moment:"AM+PM",ben_en:"Reduces pores and regulates sebum.",region:["gb","de","es","other"]},
  "int-the-ordinary-retinol": {nom:"Retinol 0.5% in Squalane",marque:"The Ordinary",prix:"8€ / £7",link:"https://theordinary.com",yuka:82,yl:"Excellent",usage:"Sérum anti-âge au rétinol",texture:"Sérum huile",ak:["Rétinol 0.5%","Squalane"],comp:["Retinol","Squalane"],clean:false,vegan:true,pq:"Peaux matures, rides.",ben:"Réduit rides et améliore texture.",app:"Soir uniquement.",moment:"PM",ben_en:"Reduces wrinkles and improves texture.",region:["gb","de","es","other"]},
  "int-paula-choice-bha": {nom:"Skin Perfecting 2% BHA",marque:"Paula's Choice",prix:"35€ / £30",link:"https://www.paulaschoice.co.uk",yuka:80,yl:"Excellent",usage:"Exfoliant liquide BHA anti-pores",texture:"Lotion",ak:["Acide salicylique 2%","Niacinamide"],comp:["Salicylic Acid 2%","Niacinamide"],clean:false,vegan:true,pq:"Peaux grasses, acnéiques, pores bouchés.",ben:"Exfolie et débouche les pores en profondeur.",app:"Soir sur peau sèche.",moment:"PM",ben_en:"Exfoliates and unclogs pores deeply.",region:["gb","de","es","other"]},
  "int-cerave-moisturiser": {nom:"Moisturising Cream",marque:"CeraVe",prix:"14€ / £12",link:"https://www.cerave.co.uk",yuka:82,yl:"Excellent",usage:"Crème hydratante quotidienne",texture:"Crème",ak:["Céramides","Acide hyaluronique","Niacinamide"],comp:["Ceramides","Hyaluronic Acid","Niacinamide"],clean:false,vegan:false,pq:"Peaux normales à sèches.",ben:"Hydratation 24h et restauration de la barrière.",app:"Matin et soir.",moment:"AM+PM",ben_en:"24h hydration and barrier restoration.",region:["gb","de","es","other","fr","dz","ma"]},
  "int-la-roche-spf": {nom:"Anthelios Invisible SPF50+",marque:"La Roche-Posay",prix:"22€ / £20",link:"https://www.laroche-posay.co.uk",yuka:65,yl:"Bon",usage:"Protection solaire SPF50+ invisible",texture:"Fluide",ak:["Mexoryl SX","Mexoryl XL","Eau thermale"],comp:["Mexoryl SX","Mexoryl XL"],clean:false,vegan:false,pq:"Tous types de peau.",ben:"Protection maximale texture invisible.",app:"Le matin.",moment:"AM",ben_en:"Maximum protection invisible texture.",region:["gb","de","es","other","fr","dz","ma"]},

  // ── ESPAGNE ───────────────────────────────────────────────────────────────
  "es-isdin-spf": {nom:"Eryfotona Actinica SPF100+",marque:"ISDIN",prix:"28€",link:"https://www.isdin.com",yuka:72,yl:"Bon",usage:"Protection solaire SPF100+ très haute",texture:"Fluide",ak:["Photolyase","Filtres UV","ADN repair"],comp:["Photolyase","UV Filters","DNA Repair"],clean:false,vegan:false,pq:"Peaux exposées au soleil, kératoses.",ben:"Répare et protège les dommages UV.",app:"Le matin généreusement.",moment:"AM",ben_en:"Repairs and protects UV damage.",region:["es"]},
  "es-miaderm-serum": {nom:"Sérum Rosehip Miaderm",marque:"Miaderm",prix:"18€",link:"https://miaderm.com",yuka:86,yl:"Excellent",usage:"Sérum huile de rose musquée",texture:"Huile-sérum",ak:["Huile rose musquée","Vitamine C","Rétinol naturel"],comp:["Rosehip Oil","Vitamin C","Natural Retinol"],clean:true,vegan:true,pq:"Peaux matures, taches, cicatrices.",ben:"Régénère et illumine le teint.",app:"Soir sur peau propre.",moment:"PM",ben_en:"Regenerates and brightens complexion.",region:["es"]},

  // ── ALLEMAGNE ─────────────────────────────────────────────────────────────
  "de-eucerin-aqua": {nom:"Aquaphor Healing Ointment",marque:"Eucerin",prix:"8€",link:"https://www.eucerin.de",yuka:88,yl:"Excellent",usage:"Baume réparateur multi-usage",texture:"Baume",ak:["Panthenol","Bisabolol","Glycérine"],comp:["Petrolatum","Panthenol","Bisabolol"],clean:false,vegan:false,pq:"Peaux sèches, lèvres, zones abîmées.",ben:"Répare et protège les peaux très sèches.",app:"Au besoin sur zones sèches.",moment:"AM+PM",ben_en:"Repairs and protects very dry skin.",region:["de"]},
  "de-nivea-creme": {nom:"NIVEA Crème Universelle",marque:"NIVEA",prix:"4€",link:"https://www.nivea.de",yuka:74,yl:"Bon",usage:"Crème universelle visage et corps",texture:"Crème riche",ak:["Eucerit","Glycérine","Panthenol"],comp:["Eucerit","Glycerin","Panthenol"],clean:false,vegan:false,pq:"Tous types de peau.",ben:"Hydrate durablement visage et corps.",app:"Matin et soir.",moment:"AM+PM",ben_en:"Durably hydrates face and body.",region:["de","other"]}

};

let diagScores = {seche:0,grasse:0,mixte:0,normale:0,sensible:0};
let diagStep = 0;
let diagResult = null;

function startDiag(){
  diagScores = {seche:0,grasse:0,mixte:0,normale:0,sensible:0};
  diagStep = 0;
  diagResult = null;
  document.getElementById("diag-result").classList.add("hidden");
  renderDiagQuestion();
  go("diag");
}

function renderDiagQuestion(){
  const q = getDiagQuestions()[diagStep];
  document.getElementById("diag-step-lbl").textContent = "Question " + (diagStep+1) + " / " + getDiagQuestions().length;
  document.getElementById("diag-question").textContent = q.q;
  document.getElementById("diag-sub").textContent = q.sub;
  document.getElementById("diag-opts").innerHTML = q.opts.map((opt,i) => `
    <button class="sr" onclick="answerDiag(${i})" style="margin-bottom:8px;padding:13px 16px">
      <div class="rl" style="font-size:13px">${opt.label}</div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="#C4887F"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>
    </button>`).join("");
}

function answerDiag(optIdx){
  const scores = DIAG_QUESTIONS[diagStep].opts[optIdx].scores;
  Object.keys(scores).forEach(k => { diagScores[k] += scores[k]; });
  diagStep++;
  if(diagStep < getDiagQuestions().length){
    renderDiagQuestion();
  } else {
    showDiagResult();
  }
}

function showDiagResult(){
  // Trouver le type avec le score le plus élevé
  const winner = Object.keys(diagScores).reduce((a,b) => diagScores[a] > diagScores[b] ? a : b);
  diagResult = winner;
  const res = getDiagResults()[winner];
  document.getElementById("diag-opts").innerHTML = "";
  document.getElementById("diag-question").textContent = "Résultat de votre diagnostic";
  document.getElementById("diag-sub").textContent = "";
  document.getElementById("diag-step-lbl").textContent = "Diagnostic terminé ✓";
  document.getElementById("diag-result-type").textContent = res.label;
  document.getElementById("diag-result-desc").textContent = res.desc;
  document.getElementById("diag-result").classList.remove("hidden");
}

function confirmDiagResult(){
  if(diagResult){
    ST.skinType = diagResult;
    // Cocher visuellement le bon bouton dans q1
    go("q1");
    setTimeout(()=>{
      document.querySelectorAll("#q1-opts .sr").forEach(b=>b.classList.remove("on"));
      document.getElementById("q1-next").disabled = false;
      // Afficher un badge de confirmation
      const badge = document.createElement("div");
      badge.style.cssText = "background:var(--blush);border:1px solid var(--rose);border-radius:12px;padding:12px 16px;margin-bottom:12px;display:flex;align-items:center;gap:10px;font-size:13px;color:var(--acc2)";
      const diagRes = getDiagResults()[diagResult]; const detectedLabel = LANG==="en"?"Detected type:":"Type détecté :"; const autoLabel = LANG==="en"?"Selected automatically":"Sélectionné automatiquement";
      badge.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="#C4726A"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg><div><strong>${detectedLabel} ${diagRes.label}</strong><br><span style="font-size:11px;opacity:.8">${autoLabel}</span></div>`;
      const optsEl = document.getElementById("q1-opts");
      optsEl.insertBefore(badge, optsEl.firstChild);
    }, 100);
  }
}

function restartDiag(){
  diagScores = {seche:0,grasse:0,mixte:0,normale:0,sensible:0};
  diagStep = 0;
  diagResult = null;
  document.getElementById("diag-result").classList.add("hidden");
  renderDiagQuestion();
}

function pickSkin(id,el){ST.skinType=id;document.querySelectorAll("#q1-opts .sr").forEach(b=>b.classList.remove("on"));el.classList.add("on");document.getElementById("q1-next").disabled=false;}
function pickAge(id,el){ST.ageGroup=id;document.querySelectorAll("#q2-opts .sr").forEach(b=>b.classList.remove("on"));el.classList.add("on");document.getElementById("q2-next").disabled=false;}
function togConcern(id,el){const i=ST.concerns.indexOf(id);if(i>-1){ST.concerns.splice(i,1);el.classList.remove("on");}else{ST.concerns.push(id);el.classList.add("on");}document.getElementById("q3-next").disabled=ST.concerns.length===0;}
function togAllergy(el){const a=el.textContent;const i=ST.allergies.indexOf(a);if(i>-1){ST.allergies.splice(i,1);el.classList.remove("on");}else{ST.allergies.push(a);el.classList.add("on");}}
function pickBudget(id,el){
  ST.budget=id;
  document.querySelectorAll("#q4-opts .sr").forEach(b=>{
    b.classList.remove("on");
    const ph=b.querySelector('.budget-phrase');
    if(ph)ph.style.display='none';
  });
  el.classList.add("on");
  const phrase=el.querySelector('.budget-phrase');
  if(phrase)phrase.style.display='block';
  document.getElementById("q4-next").disabled=false;
}
function pickRoutine(id,el){ST.routine=id;document.querySelectorAll("#q5-opts .sr").forEach(b=>b.classList.remove("on"));el.classList.add("on");document.getElementById("q5-next").disabled=false;}

// ─── IMG HELPERS ──────────────────────────────────────────────────────────────
function translateEtape(etape){
  if(LANG!=='en') return etape;
  var map={
    'Nettoyant':'Cleanser',
    'Hydratant':'Moisturizer', 
    'Protection solaire':'Sun Protection',
    'Sérum principal':'Main Serum',
    'Sérum soir':'Evening Serum',
    'Soin ciblé':'Targeted Treatment'
  };
  return map[etape]||etape;
}

function imgHtml(key,marque,size=88){
  const src=IMGS[key]||"";
  const init=(marque||"").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  if(!src)return `<div class="pif"><div class="bi">${init}</div><div class="bn">${marque}</div></div>`;
  return `<div style="position:relative;width:${size}px;height:${size}px">
    <img src="${src}" alt="${marque}" style="width:${size}px;height:${size}px;object-fit:contain;display:block" onload="this.style.opacity=1" onerror="this.style.display='none';var fb=this.parentNode.querySelector('.pif-fb');if(fb)fb.style.display='flex'">
    <div class="pif pif-fb" style="display:none;position:absolute;top:0;left:0;width:100%;height:100%"><div class="bi">${init}</div><div class="bn">${marque}</div></div>
  </div>`;
}

function yukaBadge(yuka,yl){
  const cls=yuka>=75?"ye":yuka>=50?"yg":"ym";
  return `<span class="yb ${cls}">🥕 ${yuka}/100 · ${yl}</span>`;
}

// ─── GENERATE RESULT ──────────────────────────────────────────────────────────
function doGenerate(){
  try {
    // Utiliser le nouveau moteur de scoring si disponible, sinon fallback legacy
    if (typeof SkinMatchAlgo !== 'undefined' && PRODUCTS_CATALOG !== null) {
      const profile = {
        skinType:  ST.skinType  || 'normale',
        ageGroup:  ST.ageGroup  || '26-35',
        concerns:  ST.concerns  || [],
        allergies: ST.allergies || [],
        budget:    ST.budget    || 'mid',
        routine:   ST.routine   || 'simple',
      };
      ST.result = SkinMatchAlgo.generateRoutine(profile, PRODUCTS_CATALOG, LANG);
    } else {
      ST.result = build();
    }
    if (!ST.result || !ST.result.steps) {
      ST.result = { steps: [], intro: t('result_routine') || 'Votre routine', conseil: '', totalPrix: 0 };
    }
  } catch(e) {
    ST.result = build();
    if (!ST.result || !ST.result.steps) {
      ST.result = { steps: [], intro: t('result_routine') || 'Votre routine', conseil: '', totalPrix: 0 };
    }
  }
  ST.showShare = false;
  renderResult();
  go("result");
}

function renderResult(){
  const r=ST.result;
  // Filet de sécurité allergènes : retirer tout produit allergène qui aurait échappé au filtre principal
  const activeAllergies=(ST.allergies||[]).filter(a=>a!=="Aucune allergie connue"&&a!=="No known allergies");
  if(activeAllergies.length>0&&typeof SkinMatchAlgo!=="undefined"){
    r.steps=r.steps.filter(s=>!SkinMatchAlgo.isAllergic(s,activeAllergies));
  }
  const hasA=activeAllergies.length>0;
  const amSteps=r.steps.filter(s=>s.moment==="AM"||s.moment==="AM+PM");
  const pmSteps=r.steps.filter(s=>s.moment==="PM"||s.moment==="AM+PM");

  const stepsHtml=r.steps.map(s=>{
    const buyLabel=s.marque==="Cible Skin"?t('buy_cibleskin'):t('buy_easypara');
    return`<div class="pc">
      <div class="ph">
        <div class="piw">${imgHtml(s.key,s.marque)}</div>
        <div class="pi">
          <div class="pe">${translateEtape(s.etape)}</div>
          <div class="pn">${s.nom}</div>
          <div class="pm">${s.marque}</div>
          <div class="badges"><span class="cb">✓ ${s.compat}% ${t('compatible')}</span></div>
        </div>
        <div style="position:absolute;top:12px;right:12px;background:#FDF0E6;border-radius:8px;padding:5px 11px;font-family:Georgia,serif;font-size:15px;font-weight:800;color:#C4726A">${s.prix}</div>
      </div>
      <div class="pb">
        <div class="pu">${s.pourquoi}</div>
        <div class="tags">${(s.ak||[]).slice(0,3).map(a=>`<span class="tag">${a}</span>`).join("")}</div>
        <div class="btns" style="flex-wrap:wrap;gap:6px">

        </div>
        <button class="btn-fiche" onclick="openModal('${s.key}')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#9A8B7C"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
            <span>${t('fiche_btn')}</span>
          </button>
        <button onclick="showWhyAI('${s.key}','${s.nom}','${s.marque}')" style="width:100%;margin-top:10px;padding:12px 16px;border-radius:50px;border:none;background:#C4726A;color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:var(--sans);display:flex;align-items:center;justify-content:center;gap:8px">
          <span>${LANG==="en"?"Why this product?":"Mon Skin Match"}</span>
        </button>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:4px">
          ${s.yuka>=75
            ? `<span style="background:#E8F5E9;color:#2E7D32;border-radius:20px;padding:5px 10px;font-size:11px;font-weight:700;display:inline-flex;align-items:center;gap:4px">🥕 ${s.yuka}/100 · ${s.yl}</span>`
            : `<button class="btn-fiche" onclick="toggleYuka('yuka-${s.key}')"><span>${t("note_yuka")}</span></button>`
          }
          <a href="${s.link}" target="_blank" class="btn-buy"><span>${buyLabel}</span></a>
          <button onclick="showVideo('${s.video||''}','${s.nom}','${s.marque}','yt')" title="YouTube" style="display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;background:#FF0000;color:#fff;font-size:13px;flex-shrink:0;border:none;cursor:pointer;margin-left:4px;font-weight:700">▶</button>
          <button onclick="showVideo('${s.video||''}','${s.nom}','${s.marque}','tk')" title="TikTok" style="display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;background:#000;color:#fff;font-size:15px;flex-shrink:0;border:none;cursor:pointer;margin-left:4px">♪</button>
        </div>
        <div id="yuka-${s.key}" style="display:none;margin-top:8px;padding:10px 12px;border-radius:8px;background:#F7F3EF;border:1px solid #E8E0D6">
          <div style="font-size:10px;font-weight:700;color:#9A8B7C;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">${t('note_yuka')||'Yuka score'}</div>
          <div style="display:flex;align-items:center;gap:10px">
            <div style="flex:1;height:6px;border-radius:3px;background:#E8E0D6;overflow:hidden">
              <div style="height:100%;border-radius:3px" class="yuka-bar-${s.key}"></div>
            </div>
            <span style="font-family:var(--serif);font-size:16px;font-weight:700" class="yuka-score-${s.key}">${s.yuka}/100</span>
          </div>
          <div style="font-size:11px;font-weight:600;margin-top:4px" class="yuka-label-${s.key}">${s.yl}</div>
        </div>
      </div>
    </div>`;
  }).join("");

  const roHtml=(steps,id)=>`<div id="${id}">${steps.map((s,i)=>`<div class="ro-step">
    <div class="ro-num">${i+1}</div>
    <div class="ro-info"><div class="ro-name">${s.nom}</div><div class="ro-sub">${s.marque} · <span style="color:var(--acc2)">${s.moment==='AM'?t('morning_only'):s.moment==='PM'?t('evening_only'):t('both')}</span></div></div>
  </div>`).join("")}</div>`;

  document.getElementById("result-content").innerHTML=`
    <div class="rh">
      <div class="rey">${t('result_eyebrow')}</div>
      <div class="rt">${ST.user?.name?(t('result_hello')||'Hello')+' '+ST.user.name:t('result_routine')}</div>
      <div class="rsub">${ST.ageGroup?ST.ageGroup+(LANG==='fr'?' ans · ':' · '):''}${t('budget_total')} <strong>~${Math.round(r.totalPrix)}€</strong></div>
    </div>
    <div class="intro"><p class="intro-txt">${r.intro}</p></div>
    <button class="share-btn" onclick="openShareSheet()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>
      ${t('share_btn')}
    </button>
    <div class="ro">
      <div style="font-size:11px;font-weight:700;color:#2C2C2C;text-transform:uppercase;letter-spacing:.5px;margin-bottom:12px">${t('order_title')}</div>
      <div class="ro-tabs">
        <button class="ro-tab on" id="tab-am" onclick="switchTab('am')">${t('tab_am')}</button>
        <button class="ro-tab" id="tab-pm" onclick="switchTab('pm')">${t('tab_pm')}</button>
      </div>
      ${roHtml(amSteps,"ro-am")}
      <div id="ro-pm" style="display:none">${roHtml(pmSteps,"").innerHTML||""}</div>
    </div>
    <div class="section-lbl">${t('products_title')}</div>
    ${stepsHtml}
    <div class="conseil"><div class="conseil-lbl">${t('conseil_label')}</div><div class="conseil-txt">${r.conseil}</div></div>
    ${hasA?`<div class="aw"><svg width="16" height="16" viewBox="0 0 24 24" fill="#C4956A" style="flex-shrink:0;margin-top:1px"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg><div><div class="aw-t">${t('allergy_title')}</div><p class="aw-txt">${t('allergy_text')} ${ST.allergies.join(', ')}.</p></div></div>`:""}
    <div class="suivi">
      <div class="suivi-t">${t('suivi_title')}</div>
      <p class="suivi-txt">${t('suivi_text')}</p>
      <button style="padding:8px 14px;border-radius:8px;border:1.5px solid #2C2C2C;background:transparent;color:#2C2C2C;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit" onclick="doReset()">${t('suivi_btn')}</button>
    </div>
    <button onclick="openDashboard()" style="width:100%;padding:16px;border-radius:16px;border:none;background:linear-gradient(135deg,#C4726A,#A85A52);color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:var(--sans);display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 4px 20px rgba(196,114,106,.35);margin-top:8px;margin-bottom:10px">
      <span style="font-size:20px">🏠</span>
      <span>${LANG==="en"?"My SkinMatch Space":"Mon espace SkinMatch"}</span>
    </button>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:4px;margin-bottom:8px">
      <button onclick="openSuivi()" style="padding:14px 10px;border-radius:16px;border:none;background:linear-gradient(135deg,#F2C4BC,#E8A09A);color:#3D2B1F;font-size:12px;font-weight:700;cursor:pointer;font-family:var(--sans);display:flex;flex-direction:column;align-items:center;gap:6px;box-shadow:0 2px 10px rgba(196,114,106,.2)">
        <span style="font-size:22px">📅</span>
        <span>${LANG==="en"?"Track progress":"Suivre ma progression"}</span>
      </button>
      <button onclick="openCompare()" style="padding:14px 10px;border-radius:16px;border:none;background:linear-gradient(135deg,#F2C4BC,#E8A09A);color:#3D2B1F;font-size:12px;font-weight:700;cursor:pointer;font-family:var(--sans);display:flex;flex-direction:column;align-items:center;gap:6px;box-shadow:0 2px 10px rgba(196,114,106,.2)">
        <span style="font-size:22px">⚖️</span>
        <span>${LANG==="en"?"Compare":"Comparer des produits"}</span>
      </button>
    </div>
    <button class="btn-o" onclick="doReset()" style="margin-top:4px">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
      ${t('btn_restart')}
    </button>`;

  // Set yuka colors
  r.steps.forEach(function(s){
    var col=s.yuka>=75?'#2E7D32':s.yuka>=50?'#E65100':'#C62828';
    var bar=document.querySelector('.yuka-bar-'+s.key);
    var score=document.querySelector('.yuka-score-'+s.key);
    var lbl=document.querySelector('.yuka-label-'+s.key);
    if(bar){bar.style.width=s.yuka+'%';bar.style.background=col;}
    if(score){score.style.color=col;}
    if(lbl){lbl.style.color=col;}
  });
  // fix PM tab
  const pmWrap=document.getElementById("ro-pm");
  if(pmWrap)pmWrap.innerHTML=pmSteps.map((s,i)=>`<div class="ro-step"><div class="ro-num">${i+1}</div><div class="ro-info"><div class="ro-name">${s.nom}</div><div class="ro-sub">${translateEtape(s.etape)} · <span style="color:var(--acc2)">${s.moment==='AM'?t('morning_only'):s.moment==='PM'?t('evening_only'):t('both')}</span></div></div></div>`).join("");
}

function switchTab(tab){
  document.getElementById("tab-am").classList.toggle("on",tab==="am");
  document.getElementById("tab-pm").classList.toggle("on",tab==="pm");
  document.getElementById("tab-am").textContent = t('tab_am');
  document.getElementById("tab-pm").textContent = t('tab_pm');
  document.getElementById("ro-am").style.display=tab==="am"?"block":"none";
  document.getElementById("ro-pm").style.display=tab==="pm"?"block":"none";
}

function _buildShareText() {
  const r = ST.result;
  if (!r) return '';
  const skinLabels = {seche:'sèche',grasse:'grasse',mixte:'mixte',normale:'normale',sensible:'sensible'};
  const skinLabel = skinLabels[ST.skinType] || '';
  const amSteps = r.steps.filter(function(s){ return s.moment === 'AM' || s.moment === 'AM+PM'; });
  const pmSteps = r.steps.filter(function(s){ return s.moment === 'PM' || s.moment === 'AM+PM'; });
  var text = '🌿 Ma routine skincare sur-mesure\nPeau ' + skinLabel + ' · ~' + Math.round(r.totalPrix) + '€\n\n';
  if (amSteps.length) text += '☀️ Matin\n' + amSteps.map(function(s){ return '• ' + s.nom + ' (' + s.marque + ')'; }).join('\n') + '\n\n';
  if (pmSteps.length) text += '🌙 Soir\n' + pmSteps.map(function(s){ return '• ' + s.nom + ' (' + s.marque + ')'; }).join('\n') + '\n\n';
  text += '✨ Créez votre routine sur SkinMatch\n' + window.location.origin;
  return text;
}

async function openShareSheet() {
  const text  = _buildShareText();
  const url   = window.location.origin;
  const title = 'Ma routine SkinMatch';
  if (navigator.share) {
    try {
      await navigator.share({ title: title, text: text, url: url });
      return;
    } catch(e) {
      if (e.name === 'AbortError') return;
    }
  }
  _showShareFallback(text);
}

function _showShareFallback(text) {
  const existing = document.getElementById('share-sheet');
  if (existing) { existing.remove(); return; }
  const enc = encodeURIComponent(text);
  const sheet = document.createElement('div');
  sheet.id = 'share-sheet';
  sheet.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.5);display:flex;align-items:flex-end';
  sheet.innerHTML = [
    '<div style="width:100%;background:#fff;border-radius:24px 24px 0 0;padding:24px 20px 44px;box-shadow:0 -4px 30px rgba(0,0,0,.15)">',
      '<div style="width:40px;height:4px;background:#E0D5D0;border-radius:2px;margin:0 auto 20px"></div>',
      '<div style="font-size:15px;font-weight:700;color:#2C2C2C;margin-bottom:20px;font-family:var(--sans)">Partager ma routine</div>',
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px">',
        '<a href="https://twitter.com/intent/tweet?text='+enc+'" target="_blank" rel="noopener" style="text-decoration:none;display:flex;flex-direction:column;align-items:center;gap:8px">',
          '<div style="width:56px;height:56px;border-radius:16px;background:#000;display:flex;align-items:center;justify-content:center"><svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></div>',
          '<span style="font-size:11px;color:#6B5A55;font-family:var(--sans);font-weight:600">X / Twitter</span>',
        '</a>',
        '<a href="https://wa.me/?text='+enc+'" target="_blank" rel="noopener" style="text-decoration:none;display:flex;flex-direction:column;align-items:center;gap:8px">',
          '<div style="width:56px;height:56px;border-radius:16px;background:#25D366;display:flex;align-items:center;justify-content:center"><svg width="26" height="26" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></div>',
          '<span style="font-size:11px;color:#6B5A55;font-family:var(--sans);font-weight:600">WhatsApp</span>',
        '</a>',
        '<button id="share-copy-btn" onclick="_copyShareText()" style="background:none;border:none;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:8px;padding:0">',
          '<div style="width:56px;height:56px;border-radius:16px;background:#F2EDE9;display:flex;align-items:center;justify-content:center"><svg width="22" height="22" viewBox="0 0 24 24" fill="#C4726A"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg></div>',
          '<span id="share-copy-lbl" style="font-size:11px;color:#6B5A55;font-family:var(--sans);font-weight:600">Copier</span>',
        '</button>',
      '</div>',
      '<button onclick="document.getElementById(\'share-sheet\').remove()" style="width:100%;padding:14px;border-radius:14px;border:1.5px solid #E0D5D0;background:#fff;font-size:14px;font-weight:600;color:#6B5A55;cursor:pointer;font-family:var(--sans)">Annuler</button>',
    '</div>',
  ].join('');
  sheet.addEventListener('click', function(e){ if(e.target === sheet) sheet.remove(); });
  document.body.appendChild(sheet);
  window._shareTextToCopy = text;
}

function _copyShareText() {
  navigator.clipboard.writeText(window._shareTextToCopy || '').then(function() {
    var lbl = document.getElementById('share-copy-lbl');
    if (lbl) { lbl.textContent = 'Copié ✓'; setTimeout(function(){ lbl.textContent = 'Copier'; }, 2000); }
  });
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
function toggleYuka(id){
  const el=document.getElementById(id);
  if(el)el.style.display=el.style.display==='none'?'block':'none';
}
function openModal(key){
  const p=DB[key];if(!p)return;
  const src=IMGS[key]||"";
  const init=(p.marque||"").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  const fallbackImg=`<div class="pif"><div class="bi" style="font-size:32px">${init}</div><div class="bn" style="font-size:11px">${p.marque}</div></div>`;
  const yc=p.yuka>=75?"ye":p.yuka>=50?"yg":"ym";
  const buyLabel=p.marque==="Cible Skin"?"Acheter sur Cible Skin →":"Acheter sur Easypara →";
  const buyNote=p.marque!=="Cible Skin"?`<p class="modal-buy-note">${t('buy_note')}</p>`:"";
  document.getElementById("modal-content").innerHTML=`
    <div class="modal-head">
      <div><div class="modal-brand">${p.marque}</div><div class="modal-nom">${p.nom}</div></div>
      <button class="modal-close" onclick="closeModal()">×</button>
    </div>
    <div class="modal-img" id="modal-img-wrap"></div>
    <div class="modal-badges">
      ${p.clean?'<span class="bdg bdg-clean">100% Clean</span>':""}
      ${p.vegan?'<span class="bdg bdg-vegan">Vegan</span>':""}
      <span class="bdg bdg-tex">${p.texture}</span>
      ${p.yuka?yukaBadge(p.yuka,p.yl):""}
    </div>
    <div class="ms"><div class="ms-lbl">${LANG==='en'?'For who':'Pour qui'}</div><div class="ms-txt">${p.pq}</div></div>
    <div class="ms"><div class="ms-lbl">${LANG==='en'?'Benefits':'Bénéfices'}</div><div class="ms-txt">${p.ben}</div></div>
    <div class="ms"><div class="ms-lbl">${LANG==='en'?'Application':'Application'}</div><div class="ms-txt">${p.app}</div></div>
    <div class="ms"><div class="ms-lbl">${LANG==='en'?'Usage':'Usage'}</div><div class="ms-txt">${p.usage}</div></div>
    <div class="ms"><div class="ms-lbl">${LANG==='en'?'Key ingredients':'Actifs clés'}</div><div class="ak-list">${(p.ak||[]).map(a=>`<span class="ak">${a}</span>`).join("")}</div></div>
    <div class="ms"><div class="ms-lbl">${LANG==='en'?'INCI composition':'Composition INCI'}</div><div class="inci">${(p.comp||[]).join(" · ")}</div></div>
    <div class="prix-box"><div class="prix-lbl">${LANG==='en'?'Indicative price':'Prix indicatif'}</div><div class="prix-val">${p.prix}</div></div>
    <a href="${p.link}" target="_blank" class="modal-buy">${buyLabel}</a>
    ${buyNote}`;
  document.getElementById("modal-overlay").classList.remove("hidden");
}
function showWhyAI(key, nom, marque) {
    var p = DB[key];
    if (!p) return;

    var modal = document.getElementById("why-modal");
    if (!modal) return;
    modal.style.display = "flex";

    var isEN = LANG === "en";
    var l = T[LANG] || T.fr;
    var skinLabel = l.skin_labels[ST.skinType] || ST.skinType || "";
    var age = ST.ageGroup || "";
    var concerns = ST.concerns.length > 0
        ? ST.concerns.map(function(c){ return (l.concern_labels||{})[c] || c; }).join(", ")
        : (isEN ? "general skin care" : "soin général");

    document.getElementById("why-product-name").textContent = nom + " — " + marque;
    document.getElementById("why-loading").style.display = "none";

    var contentEl = document.getElementById("why-content");
    contentEl.innerHTML = "";

    var aktifs = (p.ak || []).join(", ");
    var benefit = isEN ? (p.ben_en || p.ben || "") : (p.ben || "");
    var usage = p.usage || "";
    var pq = p.pq || "";

    var sections = [
        {
            icon: "",
            title: isEN ? "Why this product for you" : "Pourquoi ce produit pour vous",
            text: isEN
                ? "Your skin is " + skinLabel + (age ? ", " + age + " years old" : "") + ". You are concerned about " + concerns + ". " + usage + " makes it perfectly adapted to your profile."
                : "Votre peau est " + skinLabel + (age ? ", " + age : "") + ". Vous êtes concerné(e) par " + concerns + ". " + (usage || "Ce produit") + " le rend parfaitement adapté à votre profil."
        },
        {
            icon: "⚗️",
            title: isEN ? "Key active ingredients" : "Actifs clés",
            text: aktifs
        },
        {
            icon: "",
            title: isEN ? "Expected benefits" : "Bénéfices attendus",
            text: benefit || usage
        },
        {
            icon: "👤",
            title: isEN ? "Ideal for" : "Idéal pour",
            text: pq
        }
    ];

    sections.forEach(function(s) {
        if (!s.text) return;
        var block = document.createElement("div");
        block.style.cssText = "margin-bottom:12px;padding:14px;background:#FDF0E6;border-radius:14px;border-left:3px solid #C4726A";
        var title = document.createElement("div");
        title.style.cssText = "font-size:11px;font-weight:700;color:#C4726A;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px";
        title.textContent = s.icon + "  " + s.title;
        var text = document.createElement("div");
        text.style.cssText = "font-size:14px;line-height:1.65;color:#3D2B1F";
        text.textContent = s.text;
        block.appendChild(title);
        block.appendChild(text);
        contentEl.appendChild(block);
    });

    // Note de compatibilité
    var compatBlock = document.createElement("div");
    compatBlock.style.cssText = "margin-top:4px;padding:12px;background:#E8F5E9;border-radius:14px;text-align:center";
    var compat = p.yuka >= 75
        ? (isEN ? "🟢 Excellent Yuka score: " + p.yuka + "/100" : "🟢 Excellente note Yuka : " + p.yuka + "/100")
        : (isEN ? "🥕 Yuka score: " + p.yuka + "/100" : "🥕 Note Yuka : " + p.yuka + "/100");
    compatBlock.innerHTML = "<div style='font-size:13px;font-weight:700;color:#2E7D32'>" + compat + "</div>";
    contentEl.appendChild(compatBlock);
}


function showVideo(url, nom, marque, platform) {
    var modal = document.getElementById('video-modal');
    var iframe = document.getElementById('video-iframe');
    var title = document.getElementById('video-title');
    if (!modal || !iframe) return;

    var query = encodeURIComponent((nom || '') + ' ' + (marque || '') + ' skincare');

    if (platform === 'tk') {
        // TikTok → recherche TikTok sur ce produit
        window.open('https://www.tiktok.com/search?q=' + query, '_blank');
        return;
    }

    // YouTube
    if (url && url.indexOf('youtube.com/embed') !== -1) {
        // Vidéo directe → jouer dans l'app
        iframe.src = url + '?autoplay=1&rel=0';
        title.textContent = nom;
        modal.style.display = 'flex';
    } else {
        // Recherche YouTube ciblée sur ce produit
        var ytQuery = encodeURIComponent((nom || '') + ' ' + (marque || '') + ' review soin');
        window.open('https://www.youtube.com/results?search_query=' + ytQuery, '_blank');
    }
}

function closeVideo() {
    var modal = document.getElementById('video-modal');
    var iframe = document.getElementById('video-iframe');
    if (iframe) iframe.src = '';
    if (modal) modal.style.display = 'none';
}

function showRegionModal() {
  selectedRegionValue = '';
  buildRegionList();
  var m = document.getElementById('region-modal');
  if (m) m.style.display = 'flex';
}

var selectedRegionValue = '';

var REGIONS = [
  {group:'🌍 Europe', items:[
    {val:'fr',flag:'🇫🇷',name:'France'},
    {val:'fr',flag:'🇧🇪',name:'Belgique'},
    {val:'fr',flag:'🇨🇭',name:'Suisse'},
    {val:'de',flag:'🇩🇪',name:'Allemagne'},
    {val:'es',flag:'🇪🇸',name:'Espagne'},
    {val:'gb',flag:'🇬🇧',name:'Royaume-Uni'},
    {val:'gb',flag:'🇮🇹',name:'Italie'},
    {val:'gb',flag:'🇳🇱',name:'Pays-Bas'},
  ]},
  {group:'🌍 Maghreb', items:[
    {val:'dz',flag:'🇩🇿',name:'Algérie'},
    {val:'ma',flag:'🇲🇦',name:'Maroc'},
    {val:'ma',flag:'🇹🇳',name:'Tunisie'},
    {val:'ma',flag:'🇱🇾',name:'Libye'},
  ]},
  {group:'🌍 Moyen-Orient', items:[
    {val:'gb',flag:'🇸🇦',name:'Arabie Saoudite'},
    {val:'gb',flag:'🇦🇪',name:'Émirats Arabes Unis'},
    {val:'gb',flag:'🇶🇦',name:'Qatar'},
    {val:'gb',flag:'🇱🇧',name:'Liban'},
    {val:'gb',flag:'🇪🇬',name:'Égypte'},
  ]},
  {group:'🌍 Amériques', items:[
    {val:'gb',flag:'🇺🇸',name:'États-Unis'},
    {val:'gb',flag:'🇨🇦',name:'Canada'},
    {val:'es',flag:'🇲🇽',name:'Mexique'},
    {val:'es',flag:'🇧🇷',name:'Brésil'},
  ]},
  {group:'🌍 Afrique', items:[
    {val:'gb',flag:'🇸🇳',name:'Sénégal'},
    {val:'gb',flag:'🇨🇮',name:"Côte d'Ivoire"},
    {val:'gb',flag:'🇨🇲',name:'Cameroun'},
  ]},
  {group:'🌍 Asie & Océanie', items:[
    {val:'gb',flag:'🇯🇵',name:'Japon'},
    {val:'gb',flag:'🇰🇷',name:'Corée du Sud'},
    {val:'gb',flag:'🇦🇺',name:'Australie'},
  ]},
];

function buildRegionList() {
  var container = document.getElementById('region-list');
  if (!container) return;
  container.innerHTML = '';
  REGIONS.forEach(function(group) {
    var groupLabel = document.createElement('div');
    groupLabel.style.cssText = 'font-size:10px;font-weight:700;color:#B0958F;text-transform:uppercase;letter-spacing:.5px;padding:4px 0 2px';
    groupLabel.textContent = group.group;
    container.appendChild(groupLabel);
    group.items.forEach(function(item) {
      var btn = document.createElement('button');
      btn.style.cssText = 'width:100%;padding:12px 16px;border-radius:12px;border:2px solid ' + (selectedRegionValue === item.val + '_' + item.name ? '#C4726A' : '#EDD9D4') + ';background:' + (selectedRegionValue === item.val + '_' + item.name ? '#FDF0E6' : '#fff') + ';cursor:pointer;display:flex;align-items:center;gap:10px;font-family:inherit;text-align:left';
      btn.innerHTML = '<span style="font-size:22px">' + item.flag + '</span><span style="font-size:14px;font-weight:600;color:#3D2B1F">' + item.name + '</span>';
      btn.onclick = (function(v, n) {
        return function() {
          selectedRegionValue = v + '_' + n;
          document.querySelectorAll('#region-list button').forEach(function(b) {
            b.style.borderColor = '#EDD9D4';
            b.style.background = '#fff';
          });
          btn.style.borderColor = '#C4726A';
          btn.style.background = '#FDF0E6';
          // Stocker juste la valeur région
          selectedRegionValue = v;
        };
      })(item.val, item.name);
      container.appendChild(btn);
    });
  });
}

function confirmRegion() {
  if (!selectedRegionValue) return;
  setRegion(selectedRegionValue);
}

function setRegion(r) {
  REGION = r;
  var m = document.getElementById('region-modal');
  if (m) m.style.display = 'none';
  var flags = {fr:'🇫🇷',dz:'🇩🇿',ma:'🇲🇦',gb:'🇬🇧',es:'🇪🇸',de:'🇩🇪',other:'🌍'};
  var badge = document.getElementById('region-badge');
  if (badge) badge.textContent = (flags[r] || '🌍');
}

function closeWhyModal() {
    document.getElementById("why-modal").style.display = "none";
}

function closeModal(){document.getElementById("modal-overlay").classList.add("hidden");}




// ─── SUIVI DANS LE TEMPS ──────────────────────────────────────────────────────
var SUIVI_KEY = "skinmatch_suivi";

function getSuiviData() {
    try {
        var raw = localStorage.getItem(SUIVI_KEY);
        return raw ? JSON.parse(raw) : { entries: [], skinType: null, startDate: null };
    } catch(e) { return { entries: [], skinType: null, startDate: null }; }
}

function saveSuiviData(data) {
    try { localStorage.setItem(SUIVI_KEY, JSON.stringify(data)); } catch(e) {}
}

function openSuivi() {
    renderSuivi();
    go("suivi");
}

function renderSuivi() {
    var data = getSuiviData();
    var wrap = document.getElementById("suivi-content");
    wrap.innerHTML = "";

    // Init si premiere fois
    if (!data.startDate) {
        data.startDate = new Date().toISOString();
        data.skinType = ST.skinType || "normale";
        saveSuiviData(data);
    }

    var start = new Date(data.startDate);
    var now = new Date();
    var daysPassed = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    var currentWeek = Math.min(Math.floor(daysPassed / 7) + 1, 4);

    // Barre de progression globale
    var progressWrap = document.createElement("div");
    progressWrap.style.cssText = "background:var(--blush);border-radius:16px;padding:16px;margin-bottom:16px;border:1px solid var(--rose)";

    var progressTitle = document.createElement("div");
    progressTitle.style.cssText = "font-size:11px;font-weight:700;color:var(--acc2);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px";
    progressTitle.textContent = "Progression globale";
    progressWrap.appendChild(progressTitle);

    var pct = Math.min(Math.round((daysPassed / 28) * 100), 100);
    var barWrap = document.createElement("div");
    barWrap.style.cssText = "height:8px;border-radius:4px;background:rgba(0,0,0,.1);overflow:hidden;margin-bottom:6px";
    var barFill = document.createElement("div");
    barFill.style.cssText = "height:100%;border-radius:4px;background:linear-gradient(90deg,#C4726A,#E8A09A);width:" + pct + "%";
    barWrap.appendChild(barFill);
    progressWrap.appendChild(barWrap);

    var pctLabel = document.createElement("div");
    pctLabel.style.cssText = "font-size:12px;color:var(--pri);display:flex;justify-content:space-between";
    pctLabel.innerHTML = "<span>Jour " + Math.min(daysPassed + 1, 28) + " / 28</span><span style='font-weight:700'>" + pct + "%</span>";
    progressWrap.appendChild(pctLabel);
    wrap.appendChild(progressWrap);

    // Graphique des notes
    var hasEntries = data.entries && data.entries.length > 0;
    if (hasEntries) {
        var chartWrap = document.createElement("div");
        chartWrap.style.cssText = "background:var(--surf);border-radius:16px;padding:16px;margin-bottom:16px;border:1px solid var(--bdr)";

        var chartTitle = document.createElement("div");
        chartTitle.style.cssText = "font-size:11px;font-weight:700;color:var(--mut);text-transform:uppercase;letter-spacing:.5px;margin-bottom:14px";
        chartTitle.textContent = "Evolution de votre peau";
        chartWrap.appendChild(chartTitle);

        var chartGrid = document.createElement("div");
        chartGrid.style.cssText = "display:flex;align-items:flex-end;gap:8px;height:80px;padding-bottom:4px";

        for (var w = 1; w <= 4; w++) {
            var entry = data.entries.find(function(e) { return e.week === w; });
            var col = document.createElement("div");
            col.style.cssText = "flex:1;display:flex;flex-direction:column;align-items:center;gap:4px";

            if (entry) {
                var barH = Math.round((entry.rating / 5) * 70);
                var b = document.createElement("div");
                b.style.cssText = "width:100%;border-radius:6px 6px 0 0;background:linear-gradient(180deg,#C4726A,#E8A09A);height:" + barH + "px;min-height:8px;transition:height .3s";
                var stars = document.createElement("div");
                stars.style.cssText = "font-size:10px;font-weight:700;color:var(--pri)";
                stars.textContent = entry.rating + "/5";
                col.appendChild(b);
                col.appendChild(stars);
            } else {
                var empty = document.createElement("div");
                empty.style.cssText = "width:100%;border-radius:6px;background:var(--bdr);height:20px;margin-top:auto";
                var emptyLbl = document.createElement("div");
                emptyLbl.style.cssText = "font-size:10px;color:var(--mut)";
                emptyLbl.textContent = "-";
                col.appendChild(empty);
                col.appendChild(emptyLbl);
            }

            var wLbl = document.createElement("div");
            wLbl.style.cssText = "font-size:10px;color:var(--mut);font-weight:" + (w === currentWeek ? "700" : "400");
            wLbl.textContent = "S" + w;
            col.appendChild(wLbl);
            chartGrid.appendChild(col);
        }
        chartWrap.appendChild(chartGrid);
        wrap.appendChild(chartWrap);
    }

    // Formulaire de saisie pour la semaine courante
    var weekEntry = data.entries ? data.entries.find(function(e) { return e.week === currentWeek; }) : null;

    var formWrap = document.createElement("div");
    formWrap.style.cssText = "background:var(--surf);border-radius:16px;padding:16px;margin-bottom:16px;border:1px solid var(--bdr)";

    var formTitle = document.createElement("div");
    formTitle.style.cssText = "font-family:var(--serif);font-size:17px;font-weight:700;margin-bottom:4px";
    formTitle.textContent = weekEntry ? "Semaine " + currentWeek + " — Modifier" : "Semaine " + currentWeek + " — A noter";
    formWrap.appendChild(formTitle);

    var formSub = document.createElement("div");
    formSub.style.cssText = "font-size:12px;color:var(--mut);margin-bottom:14px";
    formSub.textContent = weekEntry ? "Note enregistree le " + new Date(weekEntry.date).toLocaleDateString("fr-FR") : "Comment va votre peau cette semaine ?";
    formWrap.appendChild(formSub);

    // Etoiles
    var starsWrap = document.createElement("div");
    starsWrap.style.cssText = "display:flex;gap:8px;margin-bottom:14px";
    var selectedRating = weekEntry ? weekEntry.rating : 0;

    for (var r = 1; r <= 5; r++) {
        (function(rating) {
            var star = document.createElement("button");
            star.id = "star-" + rating;
            star.style.cssText = "flex:1;padding:10px 4px;border-radius:10px;border:1.5px solid " + (selectedRating >= rating ? "#C4726A" : "var(--bdr)") + ";background:" + (selectedRating >= rating ? "var(--blush)" : "var(--surf)") + ";font-size:20px;cursor:pointer;transition:all .2s";
            star.textContent = "";
            star.onclick = function() {
                selectedRating = rating;
                for (var i = 1; i <= 5; i++) {
                    var s = document.getElementById("star-" + i);
                    if (s) {
                        s.style.borderColor = selectedRating >= i ? "#C4726A" : "var(--bdr)";
                        s.style.background = selectedRating >= i ? "var(--blush)" : "var(--surf)";
                    }
                }
            };
            starsWrap.appendChild(star);
        })(r);
    }
    formWrap.appendChild(starsWrap);

    // Labels etoiles
    var starsLabels = document.createElement("div");
    starsLabels.style.cssText = "display:flex;justify-content:space-between;font-size:10px;color:var(--mut);margin-top:-10px;margin-bottom:12px";
    starsLabels.innerHTML = "<span>Tres mauvaise</span><span>Excellente</span>";
    formWrap.appendChild(starsLabels);

    // Note texte
    var noteLabel = document.createElement("div");
    noteLabel.style.cssText = "font-size:12px;font-weight:600;color:var(--pri);margin-bottom:6px";
    noteLabel.textContent = "Note (optionnel)";
    formWrap.appendChild(noteLabel);

    var textarea = document.createElement("textarea");
    textarea.id = "suivi-note";
    textarea.placeholder = "Ma peau semble plus hydratee, moins de rougeurs...";
    textarea.style.cssText = "width:100%;padding:10px 12px;border:1.5px solid var(--bdr);border-radius:10px;font-size:13px;font-family:var(--sans);color:var(--pri);background:var(--surf);resize:none;height:80px;outline:none;box-sizing:border-box";
    textarea.value = weekEntry ? (weekEntry.note || "") : "";
    formWrap.appendChild(textarea);

    // Bouton sauvegarder
    var saveBtn = document.createElement("button");
    saveBtn.style.cssText = "width:100%;padding:13px;border-radius:50px;border:none;background:linear-gradient(135deg,#D4A5A0,#C4887F);color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:var(--sans);margin-top:12px;box-shadow:0 4px 15px rgba(196,114,106,.3)";
    saveBtn.textContent = weekEntry ? "Modifier la note" : "Enregistrer la semaine " + currentWeek;
    saveBtn.onclick = function() {
        if (selectedRating === 0) {
            alert("Choisissez une note de 1 a 5 etoiles.");
            return;
        }
        var d = getSuiviData();
        if (!d.entries) d.entries = [];
        var idx = d.entries.findIndex(function(e) { return e.week === currentWeek; });
        var newEntry = {
            week: currentWeek,
            rating: selectedRating,
            note: document.getElementById("suivi-note").value,
            date: new Date().toISOString()
        };
        if (idx !== -1) d.entries[idx] = newEntry;
        else d.entries.push(newEntry);
        saveSuiviData(d);
        renderSuivi();
    };
    formWrap.appendChild(saveBtn);
    wrap.appendChild(formWrap);

    // Historique des semaines passees
    if (hasEntries) {
        var histWrap = document.createElement("div");
        histWrap.style.cssText = "background:var(--surf);border-radius:16px;border:1px solid var(--bdr);overflow:hidden;margin-bottom:16px";

        var histTitle = document.createElement("div");
        histTitle.style.cssText = "padding:14px 16px;font-size:11px;font-weight:700;color:var(--mut);text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid var(--bdr)";
        histTitle.textContent = "Historique";
        histWrap.appendChild(histTitle);

        data.entries.sort(function(a, b) { return a.week - b.week; }).forEach(function(entry) {
            var row = document.createElement("div");
            row.style.cssText = "padding:12px 16px;border-bottom:1px solid var(--bdr);display:flex;align-items:center;gap:12px";

            var wBadge = document.createElement("div");
            wBadge.style.cssText = "width:32px;height:32px;border-radius:50%;background:var(--blush);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--acc2);flex-shrink:0";
            wBadge.textContent = "S" + entry.week;
            row.appendChild(wBadge);

            var rowInfo = document.createElement("div");
            rowInfo.style.cssText = "flex:1;min-width:0";

            var rowStars = document.createElement("div");
            rowStars.style.cssText = "font-size:13px;margin-bottom:2px";
            rowStars.textContent = "".repeat(entry.rating) + " " + entry.rating + "/5";
            rowInfo.appendChild(rowStars);

            if (entry.note) {
                var rowNote = document.createElement("div");
                rowNote.style.cssText = "font-size:11px;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis";
                rowNote.textContent = entry.note;
                rowInfo.appendChild(rowNote);
            }

            var rowDate = document.createElement("div");
            rowDate.style.cssText = "font-size:10px;color:var(--mut);flex-shrink:0";
            rowDate.textContent = new Date(entry.date).toLocaleDateString("fr-FR");
            row.appendChild(rowInfo);
            row.appendChild(rowDate);
            histWrap.appendChild(row);
        });

        wrap.appendChild(histWrap);
    }

    // Bouton reset
    var resetBtn = document.createElement("button");
    resetBtn.style.cssText = "width:100%;padding:10px;border:none;background:none;color:var(--mut);font-size:11px;cursor:pointer;font-family:var(--sans);text-decoration:underline;margin-bottom:16px";
    resetBtn.textContent = "Recommencer un nouveau suivi";
    resetBtn.onclick = function() {
        if (confirm("Supprimer tout l'historique de suivi ?")) {
            localStorage.removeItem(SUIVI_KEY);
            renderSuivi();
        }
    };
    wrap.appendChild(resetBtn);
}



// ─── DASHBOARD ────────────────────────────────────────────────────────────────
var DASH_KEY = "skinmatch_dashboard";

function getDashData() {
    try {
        var raw = localStorage.getItem(DASH_KEY);
        return raw ? JSON.parse(raw) : { streak: 0, lastCheck: null, badges: [], challenges: {}, tipDate: null, tip: null, monthlyNotes: [] };
    } catch(e) { return { streak: 0, lastCheck: null, badges: [], challenges: {}, tipDate: null, tip: null, monthlyNotes: [] }; }
}

function saveDashData(data) {
    try { localStorage.setItem(DASH_KEY, JSON.stringify(data)); } catch(e) {}
}

function openDashboard() {
    renderDashboard();
    go("dashboard");
}

var BADGES_DEF = [
    { id: "first_routine", icon: "", label: "Première routine", desc: "Tu as généré ta première routine", condition: function(d) { return true; } },
    { id: "week1", icon: "🌱", label: "1 semaine", desc: "7 jours de routine", condition: function(d) { return d.streak >= 7; } },
    { id: "week2", icon: "", label: "2 semaines", desc: "14 jours de routine", condition: function(d) { return d.streak >= 14; } },
    { id: "month1", icon: "🌸", label: "1 mois", desc: "30 jours de routine accomplis", condition: function(d) { return d.streak >= 30; } },
    { id: "compare_pro", icon: "⚖️", label: "Comparateur pro", desc: "Tu as utilisé le mode comparaison", condition: function(d) { return d.badges && d.badges.indexOf("compare_used") !== -1; } },
    { id: "scanner", icon: "📸", label: "IA Scanner", desc: "Tu as utilisé le scan de peau", condition: function(d) { return d.badges && d.badges.indexOf("scan_used") !== -1; } },
];

var DAILY_TIPS_FR = [
    "Appliquez toujours votre sérum sur une peau légèrement humide pour maximiser l'absorption. ",
    "Le SPF est votre meilleur anti-âge — même par temps nuageux, les UV traversent les nuages à 80%. ☀️",
    "Changez votre taie d'oreiller tous les 2-3 jours pour éviter le transfert de bactéries sur votre peau. 🛏️",
    "Less is more en skincare — trop de produits peuvent irriter. Introduisez un nouveau produit toutes les 2 semaines. ",
    "Buvez 1,5L d'eau par jour — l'hydratation vient de l'intérieur avant tout. ",
    "Nettoyez votre téléphone régulièrement — c'est l'objet le plus bactérien que vous touchez dans la journée. 📱",
    "Dormez 7-8h par nuit — c'est pendant le sommeil que votre peau se régénère le plus activement. 🌙",
    "Évitez l'eau trop chaude sur le visage — elle fragilise la barrière cutanée et déshydrate. 🚿",
    "Appliquez vos soins de bas en haut — massez toujours vers le haut pour lutter contre la gravité. 👆",
    "La vitamine C s'applique le matin pour booster votre éclat et renforcer votre protection solaire. 🍊",
];

var DAILY_TIPS_EN = [
    "Always apply your serum on slightly damp skin to maximize absorption. ",
    "SPF is your best anti-aging product — even on cloudy days, UV rays penetrate through clouds at 80%. ☀️",
    "Change your pillowcase every 2-3 days to avoid bacteria transfer to your skin. 🛏️",
    "Less is more in skincare — too many products can irritate. Introduce one new product every 2 weeks. ",
    "Drink 1.5L of water daily — hydration starts from within. ",
    "Clean your phone regularly — it's the most bacteria-laden object you touch daily. 📱",
    "Sleep 7-8h per night — your skin regenerates most actively during sleep. 🌙",
    "Avoid hot water on your face — it weakens the skin barrier and causes dehydration. 🚿",
    "Apply your skincare from bottom to top — always massage upward to fight gravity. 👆",
    "Vitamin C should be applied in the morning to boost radiance and enhance sun protection. 🍊",
];

var CHALLENGES = [
    { id: "spf30", icon: "☀️", label: "SPF 30 jours", labelEN: "SPF 30 days", desc: "Appliquer ton SPF chaque matin", descEN: "Apply your SPF every morning", days: 30 },
    { id: "hydrate21", icon: "", label: "Hydratation 21j", labelEN: "Hydration 21d", desc: "Hydrater matin et soir pendant 21 jours", descEN: "Moisturize morning and evening for 21 days", days: 21 },
    { id: "noclean7", icon: "🧹", label: "Double nettoyage 7j", labelEN: "Double cleanse 7d", desc: "Double nettoyage chaque soir pendant 7 jours", descEN: "Double cleanse every evening for 7 days", days: 7 },
];

function renderDashboard() {
    var data = getDashData();
    var wrap = document.getElementById("dashboard-content");
    var isEN = LANG === "en";
    wrap.innerHTML = "";

    // Streak check
    var today = new Date().toDateString();
    if (data.lastCheck !== today) {
        // Auto-unlock first_routine badge
        if (!data.badges) data.badges = [];
        if (data.badges.indexOf("first_routine") === -1) data.badges.push("first_routine");
        saveDashData(data);
    }

    // Score de peau
    var suivi = getSuiviData();
    var skinScore = 0;
    var scoreLabel = isEN ? "Not enough data" : "Pas encore de données";
    var scoreColor = "#B0958F";
    if (suivi.entries && suivi.entries.length > 0) {
        var avg = suivi.entries.reduce(function(a,e){ return a + e.rating; }, 0) / suivi.entries.length;
        skinScore = Math.round(avg * 20);
        if (suivi.entries.length >= 2) {
            var last = suivi.entries[suivi.entries.length-1].rating;
            var prev = suivi.entries[suivi.entries.length-2].rating;
            var diff = last - prev;
            if (diff > 0) scoreLabel = isEN ? "+" + Math.round(diff*20) + "% vs last week 📈" : "+" + Math.round(diff*20) + "% vs semaine dernière 📈";
            else if (diff < 0) scoreLabel = isEN ? Math.round(diff*20) + "% vs last week 📉" : Math.round(diff*20) + "% vs semaine dernière 📉";
            else scoreLabel = isEN ? "Stable 📊" : "Stable 📊";
        }
        scoreColor = skinScore >= 70 ? "#2E7D32" : skinScore >= 50 ? "#E65100" : "#C62828";
    }

    // --- SCORE PEAU ---
    var scoreEl = document.createElement("div");
    scoreEl.style.cssText = "background:linear-gradient(135deg,#C4726A,#A85A52);border-radius:20px;padding:20px;margin-bottom:14px;color:#fff";
    scoreEl.innerHTML = "<div style='font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;opacity:.8;margin-bottom:8px'>" + (isEN ? "SKIN SCORE" : "SCORE DE PEAU") + "</div>" +
        "<div style='display:flex;align-items:center;justify-content:space-between'>" +
        "<div><div style='font-family:Georgia,serif;font-size:48px;font-weight:700'>" + (skinScore || "--") + "</div><div style='font-size:11px;opacity:.8'>" + scoreLabel + "</div></div>" +
        "<div style='width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,.15);display:flex;flex-direction:column;align-items:center;justify-content:center'>" +
        "<div style='font-size:28px'>" + (skinScore >= 70 ? "🌸" : skinScore >= 50 ? "" : skinScore > 0 ? "🌱" : "") + "</div>" +
        "</div></div>";
    wrap.appendChild(scoreEl);

    // --- CONSEIL DU JOUR ---
    var tips = isEN ? DAILY_TIPS_EN : DAILY_TIPS_FR;
    var dayIdx = new Date().getDate() % tips.length;
    var tipEl = document.createElement("div");
    tipEl.style.cssText = "background:var(--blush);border-radius:16px;padding:16px;margin-bottom:14px;border:1px solid var(--rose)";
    tipEl.innerHTML = "<div style='font-size:10px;font-weight:700;color:var(--acc2);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px'>💡 " + (isEN ? "TIP OF THE DAY" : "CONSEIL DU JOUR") + "</div>" +
        "<div style='font-size:13px;line-height:1.6;color:var(--pri)'>" + tips[dayIdx] + "</div>";
    wrap.appendChild(tipEl);

    // --- DÉFIS ---
    var challengeEl = document.createElement("div");
    challengeEl.style.cssText = "background:var(--surf);border-radius:16px;border:1px solid var(--bdr);overflow:hidden;margin-bottom:14px";
    var challHeader = document.createElement("div");
    challHeader.style.cssText = "padding:14px 16px;font-size:11px;font-weight:700;color:var(--mut);text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid var(--bdr)";
    challHeader.textContent = isEN ? "🎯 30-DAY CHALLENGES" : "🎯 DÉFIS 30 JOURS";
    challengeEl.appendChild(challHeader);

    CHALLENGES.forEach(function(ch) {
        var chData = (data.challenges && data.challenges[ch.id]) || { started: false, days: 0, lastCheck: null };
        var row = document.createElement("div");
        row.style.cssText = "padding:14px 16px;border-bottom:1px solid var(--bdr);display:flex;align-items:center;gap:12px";

        var icon = document.createElement("div");
        icon.style.cssText = "font-size:24px;flex-shrink:0";
        icon.textContent = ch.icon;
        row.appendChild(icon);

        var info = document.createElement("div");
        info.style.cssText = "flex:1;min-width:0";
        var chLabel = isEN ? ch.labelEN : ch.label;
        var chDesc = isEN ? ch.descEN : ch.desc;
        info.innerHTML = "<div style='font-size:13px;font-weight:700;color:var(--pri)'>" + chLabel + "</div>" +
            "<div style='font-size:11px;color:var(--mut);margin-top:2px'>" + chDesc + "</div>";

        if (chData.started) {
            var pct = Math.min(100, Math.round((chData.days / ch.days) * 100));
            var barWrap = document.createElement("div");
            barWrap.style.cssText = "height:4px;border-radius:2px;background:var(--bdr);overflow:hidden;margin-top:6px";
            var barFill = document.createElement("div");
            barFill.style.cssText = "height:100%;background:#C4726A;width:" + pct + "%";
            barWrap.appendChild(barFill);
            info.appendChild(barWrap);
            var daysLbl = document.createElement("div");
            daysLbl.style.cssText = "font-size:10px;color:var(--acc2);margin-top:3px;font-weight:600";
            daysLbl.textContent = chData.days + "/" + ch.days + (isEN ? " days" : " jours");
            info.appendChild(daysLbl);
        }
        row.appendChild(info);

        var btn = document.createElement("button");
        btn.style.cssText = "flex-shrink:0;padding:7px 12px;border-radius:20px;font-size:11px;font-weight:700;cursor:pointer;font-family:var(--sans);border:none";
        if (!chData.started) {
            btn.style.background = "#C4726A";
            btn.style.color = "#fff";
            btn.textContent = isEN ? "Start" : "Démarrer";
            btn.onclick = (function(chId) { return function() { startChallenge(chId); }; })(ch.id);
        } else if (chData.lastCheck === today) {
            btn.style.background = "#E8F5E9";
            btn.style.color = "#2E7D32";
            btn.textContent = "✓";
        } else if (chData.days >= ch.days) {
            btn.style.background = "#E8F5E9";
            btn.style.color = "#2E7D32";
            btn.textContent = "🏆";
        } else {
            btn.style.background = "var(--blush)";
            btn.style.color = "#C4726A";
            btn.textContent = isEN ? "Done ✓" : "Fait ✓";
            btn.onclick = (function(chId) { return function() { checkChallenge(chId); }; })(ch.id);
        }
        row.appendChild(btn);
        challengeEl.appendChild(row);
    });
    wrap.appendChild(challengeEl);

    // --- BADGES ---
    var badgeEl = document.createElement("div");
    badgeEl.style.cssText = "background:var(--surf);border-radius:16px;border:1px solid var(--bdr);padding:16px;margin-bottom:14px";
    var badgeHeader = document.createElement("div");
    badgeHeader.style.cssText = "font-size:11px;font-weight:700;color:var(--mut);text-transform:uppercase;letter-spacing:.5px;margin-bottom:12px";
    badgeHeader.textContent = isEN ? "🏆 MY BADGES" : "🏆 MES BADGES";
    badgeEl.appendChild(badgeHeader);

    var badgeGrid = document.createElement("div");
    badgeGrid.style.cssText = "display:grid;grid-template-columns:repeat(3,1fr);gap:10px";

    BADGES_DEF.forEach(function(b) {
        var unlocked = data.badges && data.badges.indexOf(b.id) !== -1;
        var card = document.createElement("div");
        card.style.cssText = "text-align:center;padding:12px 6px;border-radius:12px;background:" + (unlocked ? "var(--blush)" : "var(--bg)") + ";border:1px solid " + (unlocked ? "var(--rose)" : "var(--bdr)") + ";opacity:" + (unlocked ? "1" : ".4");
        card.innerHTML = "<div style='font-size:28px;margin-bottom:4px'>" + b.icon + "</div>" +
            "<div style='font-size:10px;font-weight:700;color:var(--pri);line-height:1.3'>" + b.label + "</div>";
        if (unlocked) {
            card.title = b.desc;
        }
        badgeGrid.appendChild(card);
    });
    badgeEl.appendChild(badgeGrid);
    wrap.appendChild(badgeEl);

    // --- RAPPORT MENSUEL ---
    if (suivi.entries && suivi.entries.length > 0) {
        var reportEl = document.createElement("div");
        reportEl.style.cssText = "background:var(--surf);border-radius:16px;border:1px solid var(--bdr);padding:16px;margin-bottom:16px";
        var repHeader = document.createElement("div");
        repHeader.style.cssText = "font-size:11px;font-weight:700;color:var(--mut);text-transform:uppercase;letter-spacing:.5px;margin-bottom:12px";
        repHeader.textContent = isEN ? "📊 MONTHLY REPORT" : "📊 RAPPORT MENSUEL";
        reportEl.appendChild(repHeader);

        var bestEntry = suivi.entries.reduce(function(a,b){ return a.rating > b.rating ? a : b; });
        var avgRating = (suivi.entries.reduce(function(a,e){ return a+e.rating;},0)/suivi.entries.length).toFixed(1);

        var stats = [
            { label: isEN ? "Weeks tracked" : "Semaines notées", val: suivi.entries.length + "/4" },
            { label: isEN ? "Average score" : "Note moyenne", val: avgRating + "/5 " },
            { label: isEN ? "Best week" : "Meilleure semaine", val: "S" + bestEntry.week + " (" + bestEntry.rating + "/5)" },
        ];

        stats.forEach(function(s) {
            var row = document.createElement("div");
            row.style.cssText = "display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--bdr)";
            row.innerHTML = "<span style='font-size:12px;color:var(--mut)'>" + s.label + "</span>" +
                "<span style='font-size:13px;font-weight:700;color:var(--pri)'>" + s.val + "</span>";
            reportEl.appendChild(row);
        });

        var advice = document.createElement("div");
        advice.style.cssText = "margin-top:12px;padding:10px;background:var(--blush);border-radius:10px;font-size:12px;color:var(--pri);line-height:1.5";
        advice.textContent = parseFloat(avgRating) >= 4
            ? (isEN ? "🌸 Excellent progress! Your routine is working perfectly." : "🌸 Excellent progrès ! Votre routine fonctionne parfaitement.")
            : parseFloat(avgRating) >= 3
            ? (isEN ? "Good progress. Stay consistent for better results." : "Bons progrès. Continuez pour de meilleurs résultats.")
            : (isEN ? "🌱 Your skin needs more time. Stay patient and consistent!" : "🌱 Votre peau a besoin de plus de temps. Restez patient et régulier !");
        reportEl.appendChild(advice);
        wrap.appendChild(reportEl);
    }
}

function startChallenge(id) {
    var data = getDashData();
    if (!data.challenges) data.challenges = {};
    data.challenges[id] = { started: true, days: 0, lastCheck: null };
    saveDashData(data);
    renderDashboard();
}

function checkChallenge(id) {
    var data = getDashData();
    if (!data.challenges) data.challenges = {};
    var ch = data.challenges[id] || { started: true, days: 0, lastCheck: null };
    var today = new Date().toDateString();
    if (ch.lastCheck !== today) {
        ch.days = (ch.days || 0) + 1;
        ch.lastCheck = today;
        data.challenges[id] = ch;
        // Badge si challenge complet
        var def = CHALLENGES.find(function(c){ return c.id === id; });
        if (def && ch.days >= def.days) {
            if (!data.badges) data.badges = [];
            if (data.badges.indexOf("challenge_" + id) === -1) data.badges.push("challenge_" + id);
        }
        saveDashData(data);
        renderDashboard();
    }
}


// ─── MODE COMPARAISON ─────────────────────────────────────────────────────────
var compareSelected = { a: null, b: null };

function openCompare() {
    compareSelected = [];
    document.getElementById("compare-result").innerHTML = "";
    document.getElementById("compare-sub").textContent = LANG === "en" ? "Tap 2 products to compare." : "Touchez 2 produits pour les comparer.";
    var searchEl = document.getElementById("compare-search");
    if (searchEl) searchEl.value = "";
    buildCompareCards("");
    go("compare");
}

function filterCompareCards() {
    var q = document.getElementById("compare-search").value;
    buildCompareCards(q);
}

function buildCompareCards(query) {
    var q = (query || "").toLowerCase().trim();
    var keys = [];
    if (ST.result && ST.result.steps) {
        ST.result.steps.forEach(function(s) { keys.push(s.key); });
    }
    var regionKeys = getRegionProducts();
    regionKeys.forEach(function(k) {
        if (keys.indexOf(k) === -1) keys.push(k);
    });

    // Filtrer si recherche - normaliser les accents
    function normalize(str) {
        return (str||"").toLowerCase()
            .replace(/[éèêë]/g,"e")
            .replace(/[àâä]/g,"a")
            .replace(/[ùûü]/g,"u")
            .replace(/[îï]/g,"i")
            .replace(/[ôö]/g,"o")
            .replace(/[ç]/g,"c");
    }
    if (q) {
        var qn = normalize(q);
        keys = keys.filter(function(k) {
            var p = DB[k];
            if (!p) return false;
            var searchStr = normalize(p.nom + " " + p.marque + " " + (p.usage||"") + " " + (p.ak||[]).join(" "));
            return searchStr.indexOf(qn) !== -1;
        });
    }

    var grid = document.getElementById("compare-cards");
    grid.innerHTML = "";

    keys.forEach(function(key) {
        var p = DB[key];
        if (!p) return;
        var inRoutine = ST.result && ST.result.steps && ST.result.steps.some(function(s){ return s.key === key; });
        var isSelected = compareSelected.indexOf(key) !== -1;
        var selIdx = compareSelected.indexOf(key);

        var card = document.createElement("div");
        card.id = "ccard-" + key;
        card.style.cssText = "border:2px solid " + (isSelected ? "#C4726A" : "var(--bdr)") + ";border-radius:14px;padding:12px;cursor:pointer;background:" + (isSelected ? "var(--blush)" : "var(--surf)") + ";transition:all .2s;position:relative;text-align:center";

        if (inRoutine) {
            var badge = document.createElement("div");
            badge.style.cssText = "position:absolute;top:6px;left:6px;background:#C4726A;color:#fff;border-radius:20px;padding:2px 7px;font-size:9px;font-weight:700";
            badge.textContent = "MA ROUTINE";
            card.appendChild(badge);
        }

        if (isSelected) {
            var numBadge = document.createElement("div");
            numBadge.style.cssText = "position:absolute;top:6px;right:6px;width:22px;height:22px;border-radius:50%;background:#C4726A;color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center";
            numBadge.textContent = selIdx + 1;
            card.appendChild(numBadge);
        }

        var imgWrap = document.createElement("div");
        imgWrap.style.cssText = "width:56px;height:56px;margin:8px auto 8px;display:flex;align-items:center;justify-content:center";
        if (IMGS[key]) {
            var img = document.createElement("img");
            img.src = IMGS[key];
            img.style.cssText = "width:56px;height:56px;object-fit:contain;border-radius:8px";
            img.onerror = function() { this.style.display = "none"; };
            imgWrap.appendChild(img);
        } else {
            var fb = document.createElement("div");
            fb.style.cssText = "width:56px;height:56px;border-radius:8px;background:var(--tag);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;color:var(--acc2)";
            fb.textContent = p.marque[0];
            imgWrap.appendChild(fb);
        }
        card.appendChild(imgWrap);

        var nom = document.createElement("div");
        nom.style.cssText = "font-size:11px;font-weight:700;color:var(--pri);line-height:1.3;margin-bottom:2px";
        nom.textContent = p.nom;
        card.appendChild(nom);

        var marque = document.createElement("div");
        marque.style.cssText = "font-size:10px;color:var(--mut)";
        marque.textContent = p.marque;
        card.appendChild(marque);

        var prix = document.createElement("div");
        prix.style.cssText = "font-size:11px;font-weight:600;color:var(--acc2);margin-top:4px";
        prix.textContent = p.prix;
        card.appendChild(prix);

        card.onclick = (function(k) { return function() { toggleCompareCard(k); }; })(key);
        grid.appendChild(card);
    });
}





function toggleCompareCard(key) {
    var idx = compareSelected.indexOf(key);
    if (idx !== -1) {
        compareSelected.splice(idx, 1);
        document.getElementById("compare-result").innerHTML = "";
    } else {
        if (compareSelected.length >= 2) return;
        compareSelected.push(key);
    }

    // Vider la recherche et rebuilder
    var searchEl = document.getElementById("compare-search");
    if (searchEl) searchEl.value = "";
    buildCompareCards("");

    var sub = document.getElementById("compare-sub");
    if (compareSelected.length === 0) {
        sub.textContent = LANG === "en" ? "Tap 2 products to compare." : "Touchez 2 produits pour les comparer.";
        document.getElementById("compare-result").innerHTML = "";
    } else if (compareSelected.length === 1) {
        sub.textContent = LANG === "en" ? "Select one more product." : "Sélectionnez encore un produit.";
    } else {
        sub.textContent = "";
        renderCompare();
        setTimeout(function() {
            var res = document.getElementById("compare-result");
            if (res) res.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
    }
}

function renderCompare() {
    var keyA = compareSelected[0];
    var keyB = compareSelected[1];
    var wrap = document.getElementById("compare-result");

    if (!keyA || !keyB) { wrap.innerHTML = ""; return; }

    var a = DB[keyA];
    var b = DB[keyB];
    if (!a || !b) return;

    function yukaColor(y) { return y >= 75 ? "#2E7D32" : y >= 50 ? "#E65100" : "#C62828"; }
    function yukaBg(y) { return y >= 75 ? "#E8F5E9" : y >= 50 ? "#FFF3E0" : "#FFEBEE"; }

    function makeImg(key, prod) {
        var el;
        if (IMGS[key]) {
            el = document.createElement("img");
            el.src = IMGS[key];
            el.alt = prod.marque;
            el.style.cssText = "width:60px;height:60px;object-fit:contain;border-radius:8px;background:var(--tag)";
            el.onerror = function() { this.style.display = "none"; };
        } else {
            el = document.createElement("div");
            el.style.cssText = "width:60px;height:60px;border-radius:8px;background:var(--tag);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:var(--acc2)";
            el.textContent = prod.marque[0];
        }
        return el;
    }

    function makeBadge(isWinner) {
        if (!isWinner) return null;
        var b = document.createElement("span");
        b.style.cssText = "background:#E8F5E9;color:#2E7D32;border-radius:20px;padding:2px 8px;font-size:10px;font-weight:700;margin-top:3px;display:inline-block";
        b.textContent = "Meilleur";
        return b;
    }

    function makeBar(val, color) {
        var wrap = document.createElement("div");
        wrap.style.cssText = "height:6px;border-radius:3px;background:#E8E0D6;overflow:hidden;margin-bottom:4px";
        var fill = document.createElement("div");
        fill.style.cssText = "height:100%;border-radius:3px;background:" + color + ";width:" + (val) + "%";
        wrap.appendChild(fill);
        return wrap;
    }

    // CONTENEUR PRINCIPAL
    wrap.innerHTML = "";

    // --- HEADER ---
    var header = document.createElement("div");
    header.style.cssText = "display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px";

    ["A","B"].forEach(function(side) {
        var key = side === "A" ? keyA : keyB;
        var prod = side === "A" ? a : b;
        var card = document.createElement("div");
        card.style.cssText = "background:var(--blush);border-radius:14px;padding:14px;text-align:center;border:1px solid var(--rose)";

        var imgWrap = document.createElement("div");
        imgWrap.style.cssText = "display:flex;justify-content:center;margin-bottom:8px";
        imgWrap.appendChild(makeImg(key, prod));
        card.appendChild(imgWrap);

        var name = document.createElement("div");
        name.style.cssText = "font-family:var(--serif);font-size:13px;font-weight:700;line-height:1.3;margin-bottom:2px";
        name.textContent = prod.nom;
        card.appendChild(name);

        var brand = document.createElement("div");
        brand.style.cssText = "font-size:11px;color:var(--mut)";
        brand.textContent = prod.marque;
        card.appendChild(brand);

        header.appendChild(card);
    });
    wrap.appendChild(header);

    // --- LIGNES DE COMPARAISON ---
    var table = document.createElement("div");
    table.style.cssText = "background:var(--surf);border-radius:14px;border:1px solid var(--bdr);overflow:hidden;margin-bottom:10px";

    var rows = [
        { label:"Prix", valA: a.prix, valB: b.prix, winA: parseFloat(a.prix) < parseFloat(b.prix), winB: parseFloat(b.prix) < parseFloat(a.prix) },
        { label:"Yuka", isYuka: true },
        { label:"Texture", valA: a.texture, valB: b.texture },
        { label:"Clean", valA: a.clean ? "Oui" : "Non", valB: b.clean ? "Oui" : "Non", winA: a.clean && !b.clean, winB: b.clean && !a.clean },
        { label:"Vegan", valA: a.vegan ? "Oui" : "Non", valB: b.vegan ? "Oui" : "Non", winA: a.vegan && !b.vegan, winB: b.vegan && !a.vegan },
        { label:"Moment", valA: a.moment === "AM" ? "Matin" : a.moment === "PM" ? "Soir" : "Matin & Soir", valB: b.moment === "AM" ? "Matin" : b.moment === "PM" ? "Soir" : "Matin & Soir" },
    ];

    rows.forEach(function(row, i) {
        var rowEl = document.createElement("div");
        rowEl.style.cssText = "display:grid;grid-template-columns:1fr 50px 1fr;border-bottom:1px solid var(--bdr);background:" + (i%2===0?"var(--surf)":"var(--bg)");

        // Colonne A
        var colA = document.createElement("div");
        colA.style.cssText = "padding:11px 10px;text-align:right";

        if (row.isYuka) {
            colA.appendChild(makeBar(a.yuka, yukaColor(a.yuka)));
            var ya = document.createElement("span");
            ya.style.cssText = "background:" + yukaBg(a.yuka) + ";color:" + yukaColor(a.yuka) + ";border-radius:5px;padding:2px 7px;font-size:11px;font-weight:700";
            ya.textContent = "🥕 " + a.yuka + "/100";
            colA.appendChild(ya);
            if (a.yuka > b.yuka) { var bA = makeBadge(true); if(bA) colA.appendChild(bA); }
        } else {
            var tA = document.createElement("div");
            tA.style.cssText = "font-size:12px;color:var(--pri)";
            tA.textContent = row.valA || "";
            colA.appendChild(tA);
            if (row.winA) { var bA2 = makeBadge(true); if(bA2) colA.appendChild(bA2); }
        }

        // Label central
        var lbl = document.createElement("div");
        lbl.style.cssText = "padding:11px 2px;text-align:center;border-left:1px solid var(--bdr);border-right:1px solid var(--bdr);display:flex;align-items:center;justify-content:center";
        var lblTxt = document.createElement("div");
        lblTxt.style.cssText = "font-size:9px;font-weight:700;color:var(--mut);text-transform:uppercase;letter-spacing:.4px";
        lblTxt.textContent = row.label;
        lbl.appendChild(lblTxt);

        // Colonne B
        var colB = document.createElement("div");
        colB.style.cssText = "padding:11px 10px;text-align:left";

        if (row.isYuka) {
            colB.appendChild(makeBar(b.yuka, yukaColor(b.yuka)));
            var yb = document.createElement("span");
            yb.style.cssText = "background:" + yukaBg(b.yuka) + ";color:" + yukaColor(b.yuka) + ";border-radius:5px;padding:2px 7px;font-size:11px;font-weight:700";
            yb.textContent = "🥕 " + b.yuka + "/100";
            colB.appendChild(yb);
            if (b.yuka > a.yuka) { var bB = makeBadge(true); if(bB) colB.appendChild(bB); }
        } else {
            var tB = document.createElement("div");
            tB.style.cssText = "font-size:12px;color:var(--pri)";
            tB.textContent = row.valB || "";
            colB.appendChild(tB);
            if (row.winB) { var bB2 = makeBadge(true); if(bB2) colB.appendChild(bB2); }
        }

        rowEl.appendChild(colA);
        rowEl.appendChild(lbl);
        rowEl.appendChild(colB);
        table.appendChild(rowEl);
    });

    // Actifs cles
    var akRow = document.createElement("div");
    akRow.style.cssText = "padding:12px;background:var(--bg)";
    var akLbl = document.createElement("div");
    akLbl.style.cssText = "font-size:9px;font-weight:700;color:var(--mut);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px;text-align:center";
    akLbl.textContent = "Actifs cles";
    akRow.appendChild(akLbl);

    var akGrid = document.createElement("div");
    akGrid.style.cssText = "display:grid;grid-template-columns:1fr 1fr;gap:8px";

    [a, b].forEach(function(prod) {
        var col = document.createElement("div");
        col.style.cssText = "display:flex;flex-wrap:wrap;gap:4px";
        (prod.ak || []).forEach(function(ak) {
            var tag = document.createElement("span");
            tag.style.cssText = "background:#FDF0E6;color:#8B6F47;border-radius:20px;padding:3px 8px;font-size:10px;font-weight:600";
            tag.textContent = ak;
            col.appendChild(tag);
        });
        akGrid.appendChild(col);
    });

    akRow.appendChild(akGrid);
    table.appendChild(akRow);
    wrap.appendChild(table);

    // Boutons acheter
    var btns = document.createElement("div");
    btns.style.cssText = "display:grid;grid-template-columns:1fr 1fr;gap:8px";

    [{ key: keyA, prod: a }, { key: keyB, prod: b }].forEach(function(item) {
        var link = document.createElement("a");
        link.href = item.prod.link || "#";
        link.target = "_blank";
        link.style.cssText = "display:flex;align-items:center;justify-content:center;padding:11px;background:var(--pri);color:#fff;border-radius:10px;text-decoration:none;font-size:12px;font-weight:600;font-family:var(--sans)";
        link.textContent = item.prod.marque === "Cible Skin" ? "Cible Skin" : "Easypara";
        btns.appendChild(link);
    });

    wrap.appendChild(btns);
}


function doReset(){
  ST.skinType=null;ST.ageGroup=null;ST.concerns=[];ST.allergies=[];ST.budget=null;ST.routine=null;ST.result=null;ST.showShare=false;
  initQuestions();go("q1");
}

// ─── INTÉGRATION AUTH SUPABASE ────────────────────────────────────────────────
// Écoute les événements émis par auth.js pour mettre à jour l'UI

document.addEventListener('skinmatch:auth', function(e) {
  const { event, user } = e.detail || {};

  if (event === 'SIGNED_IN' && user) {
    ST.user = {
      id:    user.id,
      name:  user.user_metadata?.full_name || user.email?.split('@')[0] || 'Vous',
      email: user.email,
    };
    _updateAuthUI(true);
    // Charger le profil sauvegardé depuis Supabase si dispo
    if (typeof DB_Client !== 'undefined') {
      DB_Client.Profiles.get().then(function(res) {
        if (res.data && res.data.skin_type) {
          // Pré-remplir le questionnaire avec le profil connu
          ST.skinType  = res.data.skin_type  || ST.skinType;
          ST.ageGroup  = res.data.age_group  || ST.ageGroup;
          ST.concerns  = res.data.concerns   || ST.concerns;
          ST.allergies = res.data.allergies  || ST.allergies;
          ST.budget    = res.data.budget     || ST.budget;
          ST.routine   = res.data.routine_type || ST.routine;
        }
      });
      // Charger la dernière routine active
      DB_Client.Routines.getActive().then(function(res) {
        if (res.data && res.data.steps) {
          ST.result = {
            steps:     res.data.steps,
            intro:     res.data.intro,
            conseil:   res.data.conseil,
            totalPrix: res.data.total_prix,
          };
        }
      });
    }
  }

  if (event === 'SIGNED_OUT') {
    ST.user = null;
    _updateAuthUI(false);
  }
});

function _updateAuthUI(isLoggedIn) {
  // Boutons login/logout sur l'écran welcome
  const btnLogin  = document.getElementById('btn-login');
  const btnLogout = document.getElementById('btn-logout');
  const userBadge = document.getElementById('user-badge');
  const userName  = document.getElementById('user-name-display');

  if (btnLogin)  btnLogin.style.display  = isLoggedIn ? 'none'  : '';
  if (btnLogout) btnLogout.style.display = isLoggedIn ? ''      : 'none';
  if (userBadge) userBadge.style.display = isLoggedIn ? 'flex'  : 'none';
  if (userName && ST.user?.name) userName.textContent = ST.user.name;
}

function doLogout() {
  if (typeof Auth !== 'undefined') {
    Auth.logout();
  } else {
    ST.user = null;
    _updateAuthUI(false);
    go('welcome');
  }
}

// Surcharge de doGenerate pour auto-sauvegarder la routine après génération
(function() {
  var _orig = doGenerate;
  doGenerate = function() {
    _orig();
    // Auto-save si connecté (non-bloquant)
    if (ST.result && typeof DB_Client !== 'undefined') {
      DB_Client.autoSaveRoutine(ST, ST.result);
    }
  };
})();

// ─── Drapeau langue dans les topbars ──────────────────────────────────────────
const LANG_FLAGS = { fr: '🇫🇷', en: '🇬🇧', es: '🇪🇸', de: '🇩🇪', ar: '🇸🇦' };

document.addEventListener('skinmatch:langchange', function(e) {
  const flag = LANG_FLAGS[e.detail?.lang] || '🌐';
  document.querySelectorAll('.btn-lang-flag').forEach(function(btn) {
    btn.textContent = flag;
  });
});

// ─── Init ─────────────────────────────────────────────────────────────────────
go('lang');
initQuestions();
setTimeout(applyWelcomeLang, 50);