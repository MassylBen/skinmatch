/**
 * SkinMatch — Données legacy (temporaire)
 * Ces données seront progressivement migrées vers src/data/*.json
 * Agent Products gère products.json
 * Agent Algorithm gère routes.json
 * Agent Localization gère translations.json
 *
 * NE PAS MODIFIER CE FICHIER DIRECTEMENT
 */

'use strict';

// ─── LANGUE (doit être en premier) ───────────────────────────────────────────
let LANG = 'fr';
let REGION = 'fr';

const T = {
  fr:{
    welcome_title:"Votre routine.<br>Sur mesure.",
    welcome_desc:"Diagnostic de peau personnalisé et recommandations selon votre profil, votre âge et votre budget.",
    btn_register:"Créer un compte",btn_login:"Se connecter",btn_guest:"Continuer sans compte",
    legal:"En continuant, vous acceptez nos conditions d'utilisation.",or:"ou",
    q1_title:"Type de peau",q1_sub:"Choisissez celui qui vous correspond.",
    q2_title:"Votre tranche d'âge",q2_sub:"Les besoins de votre peau évoluent avec l'âge.",
    q3_title:"Vos problèmes de peau",q3_sub:"Sélectionnez tout ce qui vous concerne.",
    q3_allergies:"Allergies / Ingrédients à éviter",
    q4_title:"Votre budget",q4_sub:"Par produit, en moyenne.",
    q5_title:"Type de routine",q5_sub:"Selon le temps que vous souhaitez y consacrer.",
    btn_continue:"Continuer",btn_generate:"Générer ma routine",btn_restart:"Recommencer",
    result_eyebrow:"Votre routine personnalisée",
    share_btn:"Partager ma routine",order_title:"Ordre d'application",
    tab_am:"☀️ Matin",tab_pm:"🌙 Soir",
    products_title:"Les produits sélectionnés",conseil_label:"💡 Conseil expert",
    allergy_title:"Allergies enregistrées",allergy_text:"Vérifiez la composition. Allergènes :",
    suivi_title:"Suivi à 4 semaines",
    suivi_text:"Votre peau évolue. Revenez dans 4 semaines pour ajuster votre routine.",
    suivi_btn:"Refaire le diagnostic",
    fiche_btn:"En savoir plus",note_yuka:"🥕 Note Yuka",
    budget_total:"Budget estimé :",compatible:"compatible",
    morning_only:"Matin seulement",result_routine:"Votre routine personnalisée",result_hello:"Bonjour",evening_only:"Soir seulement",both:"Matin & Soir",
    register_title:"Créer votre compte",register_sub:"Enregistrez votre profil pour accéder à vos recommandations.",
    login_title:"Bon retour",login_sub:"Connectez-vous pour accéder à votre profil.",
    placeholder_name:"Prénom",placeholder_email:"Adresse email",
    placeholder_pw_reg:"Mot de passe (6 min.)",placeholder_pw:"Mot de passe",
    btn_login_action:"Se connecter",already_account:"J'ai déjà un compte",no_account:"Créer un compte",
    err_name:"Veuillez entrer votre prénom.",err_email:"Email invalide.",
    err_pw:"Mot de passe : 6 caractères minimum.",err_pw2:"Mot de passe requis.",
    skin_seche:"Sèche",skin_seche_sub:"Tiraillements, manque d'hydratation",
    skin_grasse:"Grasse",skin_grasse_sub:"Brillance, pores dilatés",
    skin_mixte:"Mixte",skin_mixte_sub:"Zone T grasse, joues normales",
    skin_normale:"Normale",skin_normale_sub:"Équilibrée, peu de soucis",
    skin_sensible:"Sensible",skin_sensible_sub:"Réactive, rougeurs fréquentes",
    skin_labels:{seche:"sèche",grasse:"grasse",mixte:"mixte",normale:"normale",sensible:"sensible"},
    ages:[
      {id:"18-25",label:"18 – 25 ans",sub:"Prévention & éclat"},
      {id:"26-35",label:"26 – 35 ans",sub:"Maintien & correction"},
      {id:"36-45",label:"36 – 45 ans",sub:"Anti-âge précoce"},
      {id:"46+",  label:"46 ans et +",sub:"Correction intense"},
    ],
    concerns:[
      {id:"acne",label:"Acné / Boutons"},{id:"taches",label:"Taches & hyperpigmentation"},
      {id:"rides",label:"Rides & anti-âge"},{id:"pores",label:"Pores dilatés"},
      {id:"rougeurs",label:"Rougeurs / Couperose"},{id:"cernes",label:"Cernes & poches"},
      {id:"eclat",label:"Teint terne / Éclat"},{id:"deshydratation",label:"Déshydratation"},
      {id:"imperfections",label:"Points noirs"},{id:"sensibilite",label:"Réactivité / Irritations"},
    ],
    budgets:[
      {id:"low", label:"Économique",    sub:"< 15€ / produit",    phrase:"Les meilleures formules ne coûtent pas forcément cher 💛"},
      {id:"mid", label:"Modéré", sub:"15€ – 50€ / produit", phrase:"Le bon équilibre entre efficacité et budget "},
      {id:"high",label:"Premium",       sub:"> 50€ / produit",     phrase:"La haute cosmétique au service de votre peau "},
      {id:"mix", label:"Flexible",      sub:"Pas de limite",        phrase:"On mixe le meilleur pour vous."},
    ],
    routines:[
      {id:"simple",    label:"Essentielle", sub:"3 étapes, rapide"},
      {id:"complete",  label:"Complète",    sub:"Matin + soir"},
      {id:"specifique",label:"Ciblée",      sub:"Un seul soin précis"},
    ],
    concern_labels:{acne:"l'acné",taches:"les taches",rides:"les rides",pores:"les pores dilatés",rougeurs:"les rougeurs",cernes:"les cernes",eclat:"le manque d'éclat",deshydratation:"la déshydratation",imperfections:"les points noirs",sensibilite:"la réactivité"},
    why_prefix:"Sélectionné pour votre peau",why_against:"efficace contre",
    age1:"18 – 25 ans",age1_sub:"Prévention & éclat",
    age2:"26 – 35 ans",age2_sub:"Maintien & correction",
    age3:"36 – 45 ans",age3_sub:"Anti-âge précoce",
    age4:"46 ans et +",age4_sub:"Correction intense",
    concerns:["Acné / Boutons","Taches & hyperpigmentation","Rides & anti-âge","Pores dilatés","Rougeurs / Couperose","Cernes & poches","Teint terne / Éclat","Déshydratation","Points noirs","Réactivité / Irritations"],
    allergies:["Parfums / Fragrances","Parabènes","Alcool","Sulfates (SLS/SLES)","Silicones","Huiles essentielles","Acide salicylique","Rétinol","Vitamine C","Acides (AHA/BHA)","Aucune allergie connue"],
    budgets:[
      {id:"low",label:"Économique",sub:"Efficace sans se ruiner"},
      {id:"mid",label:"Modéré ",sub:"Le meilleur compromis"},
      {id:"high",label:"Premium",sub:"Les meilleurs actifs du marché"},
      {id:"mix",label:"Flexible",sub:"Je fais confiance à SkinMatch"},
    ],
    routines:[
      {id:"simple",label:"Essentielle",sub:"3 étapes, 5 minutes par jour"},
      {id:"complete",label:"Complète",sub:"Matin + soir, résultats optimaux"},
      {id:"specifique",label:"Ciblée",sub:"Un seul soin pour un problème précis"},
    ],
    skin_labels:{seche:"sèche",grasse:"grasse",mixte:"mixte",normale:"normale",sensible:"sensible"},
    concern_labels:{acne:"l'acné",taches:"les taches",rides:"les rides",pores:"les pores dilatés",rougeurs:"les rougeurs",cernes:"les cernes",eclat:"le manque d'éclat",deshydratation:"la déshydratation",imperfections:"les points noirs",sensibilite:"la réactivité"},
    why_prefix:"Sélectionné pour votre peau",why_against:"efficace contre",
    intro_skin:{seche:"sèche",grasse:"grasse",mixte:"mixte",normale:"normale",sensible:"sensible"},
    intro_tpl:"Votre routine sur-mesure pour une peau {skin}{age}. Chaque produit sélectionné selon vos problématiques et votre budget.",
    conseils:{
      acne:"Évitez de toucher votre visage. Changez votre taie d'oreiller chaque semaine. Introduisez les actifs progressivement.",
      taches:"Le SPF le matin est indispensable — sans lui, les taches s'aggravent au soleil.",
      rides:"Le rétinol se commence 2×/semaine le soir, on augmente progressivement. Toujours associé à un SPF.",
      eclat:"Hydratation interne et sommeil sont aussi importants que votre routine. 1,5L d'eau par jour minimum.",
      deshydratation:"Appliquez le sérum sur peau légèrement humide pour maximiser l'absorption de l'acide hyaluronique.",
      rougeurs:"Évitez l'eau trop chaude. Bannissez les produits avec alcool, parfum ou menthol.",
      pores:"La régularité du BHA et du niacinamide réduit visiblement les pores en 4 semaines.",
      imperfections:"N'exprimez jamais les points noirs à la main, utilisez un exfoliant BHA 2-3 fois par semaine.",
      sensibilite:"Introduisez un seul produit à la fois, attendez 2 semaines avant d'en ajouter un autre.",
      cernes:"Appliquez par tapotements doux, jamais en frottant. La tête légèrement surélevée la nuit aide.",
    },
    buy_easypara:"Easypara →",buy_cibleskin:"Cible Skin →",
    buy_easypara_modal:"Acheter sur Easypara →",buy_cibleskin_modal:"Acheter sur Cible Skin →",
    buy_note:"${t('buy_note')}",
    share_footer:"${t('share_footer')}",
  },
  en:{
    welcome_title:"Your routine.<br>Tailored for you.",
    welcome_desc:"Personalized skin diagnosis and dermatological recommendations based on your profile, age and budget.",
    btn_register:"Create an account",btn_login:"Sign in",btn_guest:"Continue without account",
    legal:"By continuing, you agree to our terms of use.",or:"or",
    q1_title:"Skin type",q1_sub:"Choose the one that best describes your skin.",
    q2_title:"Your age group",q2_sub:"Your skin needs change as you age.",
    q3_title:"Your skin concerns",q3_sub:"Select everything that applies to you.",
    q3_allergies:"Allergies / Ingredients to avoid",
    q4_title:"Your budget",q4_sub:"Per product, on average.",
    q5_title:"Routine type",q5_sub:"Based on the time you want to dedicate.",
    btn_continue:"Continue",btn_generate:"Generate my routine",btn_restart:"Restart",
    result_eyebrow:"Your personalized routine",
    share_btn:"Share my routine",order_title:"Application order",
    tab_am:"☀️ Morning",tab_pm:"🌙 Evening",
    products_title:"Selected products",conseil_label:"💡 Expert tip",
    allergy_title:"Registered allergies",allergy_text:"Check the ingredients. Declared allergens:",
    suivi_title:"4-week follow-up",
    suivi_text:"Your skin evolves. Come back in 4 weeks to adjust your routine.",
    suivi_btn:"Redo the diagnosis",
    fiche_btn:"Learn more",note_yuka:"🥕 Yuka score",
    budget_total:"Estimated budget:",compatible:"compatible",
    morning_only:"Morning only",result_routine:"Your personalized routine",result_hello:"Hello",evening_only:"Evening only",both:"Morning & Evening",
    register_title:"Create your account",register_sub:"Save your profile to access your recommendations.",
    login_title:"Welcome back",login_sub:"Sign in to access your profile.",
    placeholder_name:"First name",placeholder_email:"Email address",
    placeholder_pw_reg:"Password (6 min.)",placeholder_pw:"Password",
    btn_login_action:"Sign in",already_account:"I already have an account",no_account:"Create an account",
    err_name:"Please enter your first name.",err_email:"Invalid email.",
    err_pw:"Password: minimum 6 characters.",err_pw2:"Password required.",
    skin_seche:"Dry",skin_seche_sub:"Tightness, lack of hydration",
    skin_grasse:"Oily",skin_grasse_sub:"Shine, enlarged pores",
    skin_mixte:"Combination",skin_mixte_sub:"Oily T-zone, normal cheeks",
    skin_normale:"Normal",skin_normale_sub:"Balanced, few concerns",
    skin_sensible:"Sensitive",skin_sensible_sub:"Reactive, frequent redness",
    skin_labels:{seche:"dry",grasse:"oily",mixte:"combination",normale:"normal",sensible:"sensitive"},
    ages:[
      {id:"18-25",label:"18 – 25",sub:"Prevention & radiance"},
      {id:"26-35",label:"26 – 35",sub:"Maintenance & correction"},
      {id:"36-45",label:"36 – 45",sub:"Early anti-aging"},
      {id:"46+",  label:"46+",    sub:"Intensive correction"},
    ],
    concerns:[
      {id:"acne",label:"Acne / Blemishes"},{id:"taches",label:"Dark spots & hyperpigmentation"},
      {id:"rides",label:"Wrinkles & anti-aging"},{id:"pores",label:"Enlarged pores"},
      {id:"rougeurs",label:"Redness / Rosacea"},{id:"cernes",label:"Dark circles & puffiness"},
      {id:"eclat",label:"Dull complexion / Radiance"},{id:"deshydratation",label:"Dehydration"},
      {id:"imperfections",label:"Blackheads"},{id:"sensibilite",label:"Sensitivity / Irritations"},
    ],
    budgets:[
      {id:"low", label:"Budget-friendly",sub:"< €15 / product",   phrase:"Great skincare doesn't have to break the bank 💛"},
      {id:"mid", label:"Mid-range",      sub:"€15 – €50 / product",phrase:"The sweet spot between results and value "},
      {id:"high",label:"Premium",        sub:"> €50 / product",    phrase:"High-end formulas for exceptional skin "},
      {id:"mix", label:"Flexible",       sub:"No limit",            phrase:"We mix the best options just for you"},
    ],
    routines:[
      {id:"simple",    label:"Essential", sub:"3 steps, quick"},
      {id:"complete",  label:"Complete",  sub:"Morning + evening"},
      {id:"specifique",label:"Targeted",  sub:"One specific treatment"},
    ],
    concern_labels:{acne:"acne",taches:"dark spots",rides:"wrinkles",pores:"enlarged pores",rougeurs:"redness",cernes:"dark circles",eclat:"dull complexion",deshydratation:"dehydration",imperfections:"blackheads",sensibilite:"sensitivity"},
    why_prefix:"Selected for your",why_against:"effective against",
    age1:"18 – 25",age1_sub:"Prevention & radiance",
    age2:"26 – 35",age2_sub:"Maintenance & correction",
    age3:"36 – 45",age3_sub:"Early anti-aging",
    age4:"46+",age4_sub:"Intensive correction",
    concerns:["Acne / Blemishes","Dark spots & hyperpigmentation","Wrinkles & anti-aging","Enlarged pores","Redness / Rosacea","Dark circles & puffiness","Dull complexion / Radiance","Dehydration","Blackheads","Sensitivity / Irritations"],
    allergies:["Fragrances / Perfumes","Parabens","Alcohol","Sulfates (SLS/SLES)","Silicones","Essential oils","Salicylic acid","Retinol","Vitamin C","Acids (AHA/BHA)","No known allergies"],
    budgets:[
      {id:"low",label:"Budget",sub:"Effective without breaking the bank"},
      {id:"mid",label:"Mid-range ",sub:"The best compromise"},
      {id:"high",label:"Premium",sub:"The best active ingredients"},
      {id:"mix",label:"Flexible",sub:"I trust SkinMatch to decide"},
    ],
    routines:[
      {id:"simple",label:"Essential",sub:"3 steps, 5 minutes a day"},
      {id:"complete",label:"Complete",sub:"Morning + evening, optimal results"},
      {id:"specifique",label:"Targeted",sub:"One treatment for one specific concern"},
    ],
    skin_labels:{seche:"dry",grasse:"oily",mixte:"combination",normale:"normal",sensible:"sensitive"},
    concern_labels:{acne:"acne",taches:"dark spots",rides:"wrinkles",pores:"enlarged pores",rougeurs:"redness",cernes:"dark circles",eclat:"dull complexion",deshydratation:"dehydration",imperfections:"blackheads",sensibilite:"sensitivity"},
    why_prefix:"Selected for your",why_against:"effective against",
    intro_skin:{seche:"dry",grasse:"oily",mixte:"combination",normale:"normal",sensible:"sensitive"},
    intro_tpl:"Your tailored routine for {skin} skin{age}. Each product selected based on your concerns and budget.",
    conseils:{
      acne:"Avoid touching your face. Change your pillowcase weekly. Introduce active ingredients gradually.",
      taches:"Morning SPF is essential — without it, dark spots worsen in the sun.",
      rides:"Start retinol 2x/week in the evening, gradually increase. Always pair with morning SPF.",
      eclat:"Internal hydration and sleep are as important as your routine. Drink 1.5L of water daily.",
      deshydratation:"Apply serum on slightly damp skin to maximize hyaluronic acid absorption.",
      rougeurs:"Avoid hot water. Ban products with alcohol, fragrance, or menthol.",
      pores:"Regular BHA and niacinamide visibly reduce pores in 4 weeks.",
      imperfections:"Never squeeze blackheads by hand, use a BHA exfoliant 2-3 times a week.",
      sensibilite:"Introduce one product at a time, wait 2 weeks before adding another.",
      cernes:"Apply with gentle tapping, never rubbing. Sleeping with head slightly elevated helps.",
    },
    buy_easypara:"Easypara →",buy_cibleskin:"Cible Skin →",
    buy_easypara_modal:"Buy on Easypara →",buy_cibleskin_modal:"Buy on Cible Skin →",
    buy_note:"French certified pharmacy · Free delivery from €49",
    share_footer:"Generated by SkinMatch · Your Skin, Your Routine",
  }
};

// ─── IMAGES ───────────────────────────────────────────────────────────────────
const IMGS = {
  "cs-power":  "https://www.cibleskin.com/cdn/shop/files/1b906a08fd6bbad76d5683570bfb8018d37a61e8.jpg",
  "cs-bleu":   "https://www.cibleskin.com/cdn/shop/files/3edce08d5716eb9b930ba24235a46b7eb5c635d7.jpg",
  "cs-skin2":  "https://www.cibleskin.com/cdn/shop/files/c06c0c2e6798ced364c6554ab659eecdacb16563.jpg",
  "cs-u":      "https://www.cibleskin.com/cdn/shop/files/c2f30aae745b75f82b7277836403773ba0bd781e.jpg",
  "cs-eye":    "https://www.cibleskin.com/cdn/shop/files/09319a4e3f4fbadd8919de8d4eee35cac0858e4f.jpg",
  "cs-culte":  "https://www.cibleskin.com/cdn/shop/files/104d734d1bfda050e60895a37d4d5abf119cda08_c218000d-12b6-40fb-90ea-830df6fb9e95.jpg",
  "cs-mousse": "https://www.cibleskin.com/cdn/shop/files/681ba3cf42a8030d5cb90aa08403c09366110eef.jpg",
  "cs-crev":   "https://www.cibleskin.com/cdn/shop/files/25774fce1370bb9af8050c5a33a5bf5801ec0782_112db18e-d249-4c66-948d-3da7b71c8557.jpg",
  "skc-cef": "https://www.easypara.fr/img/p/1/0/7/5/5/4/107554-home_default.jpg",
  "skc-ph":    "https://www.easypara.fr/img/p/1/0/7/5/5/5/107555-home_default.jpg",
  "skc-sil":   "https://www.easypara.fr/img/p/1/3/8/1/4/4/138144-home_default.jpg",
  "skc-ha": "https://www.easypara.fr/img/p/1/3/8/1/4/5/138145-home_default.jpg",
  "skc-dis": "https://www.easypara.fr/img/p/1/3/8/1/4/6/138146-home_default.jpg",
  "skc-age":   "https://www.easypara.fr/img/p/1/3/8/1/4/7/138147-home_default.jpg",
  "skc-bl":    "https://www.easypara.fr/img/p/1/0/7/5/5/6/107556-home_default.jpg",
  "skc-phy":   "https://www.easypara.fr/img/p/1/0/7/5/5/7/107557-home_default.jpg",
  "skc-met":   "https://www.easypara.fr/img/p/1/0/7/5/5/8/107558-home_default.jpg",
  "skc-spf":   "https://www.easypara.fr/img/p/1/3/8/1/4/8/138148-home_default.jpg",
  "lrp-effgel": "https://ccdn.myshoptet.com/usr/www.najlacnejsikozmetika.sk/user/documents/upload/La%20Roche-Posay/Effaclar/effaclar-gel-400ml_1.jpg",
  "lrp-effduo": "https://www.pharmacie-du-centre.fr/media/catalog/product/cache/1/image/700x700/9df78eab33525d08d6e5fb8d27136e95/3/3/3337875596704.jpg",
  "lrp-cica": "https://www.pharmacie-du-centre.fr/media/catalog/product/cache/1/image/700x700/9df78eab33525d08d6e5fb8d27136e95/3/3/3337875520670.jpg",
  "lrp-tol": "https://www.pharmacie-du-centre.fr/media/catalog/product/cache/1/image/700x700/9df78eab33525d08d6e5fb8d27136e95/3/3/3337875520977.jpg",
  "lrp-anth": "https://www.pharmacie-du-centre.fr/media/catalog/product/cache/1/image/700x700/9df78eab33525d08d6e5fb8d27136e95/3/3/3337875545086.jpg",
  "lrp-hyalu": "https://www.pharmacie-du-centre.fr/media/catalog/product/cache/1/image/700x700/9df78eab33525d08d6e5fb8d27136e95/3/3/3337875545291.jpg",
  "av-tol": "https://www.pharmacie-du-centre.fr/media/catalog/product/cache/1/image/700x700/9df78eab33525d08d6e5fb8d27136e95/3/2/3282770104219.jpg",
  "av-lait": "https://www.pharmacie-du-centre.fr/media/catalog/product/cache/1/image/700x700/9df78eab33525d08d6e5fb8d27136e95/3/2/3282770033168.jpg",
  "bd-sens": "https://www.pharmacie-du-centre.fr/media/catalog/product/cache/1/image/700x700/9df78eab33525d08d6e5fb8d27136e95/3/4/3401399616740.jpg",
  "bd-sebgel": "https://www.pharmacie-du-centre.fr/media/catalog/product/cache/1/image/700x700/9df78eab33525d08d6e5fb8d27136e95/3/4/3401321101734.jpg",
  "bd-hydra": "https://www.pharmacie-du-centre.fr/media/catalog/product/cache/1/image/700x700/9df78eab33525d08d6e5fb8d27136e95/3/4/3401321110064.jpg",
  "bd-sebser": "https://www.pharmacie-du-centre.fr/media/catalog/product/cache/1/image/700x700/9df78eab33525d08d6e5fb8d27136e95/3/4/3401321110033.jpg",
  "cv-gel": "https://www.pharmacie-du-centre.fr/media/catalog/product/cache/1/image/700x700/9df78eab33525d08d6e5fb8d27136e95/3/3/3337875596490.jpg",
  "cv-crem": "https://www.pharmacie-du-centre.fr/media/catalog/product/cache/1/image/700x700/9df78eab33525d08d6e5fb8d27136e95/3/3/3337875597404.jpg",
  "cv-vitc": "https://www.pharmacie-du-centre.fr/media/catalog/product/cache/1/image/700x700/9df78eab33525d08d6e5fb8d27136e95/3/3/3337875772749.jpg",
  "cv-ret": "https://www.pharmacie-du-centre.fr/media/catalog/product/cache/1/image/700x700/9df78eab33525d08d6e5fb8d27136e95/3/3/3337875772763.jpg",
  "cv-eye": "https://www.pharmacie-du-centre.fr/media/catalog/product/cache/1/image/700x700/9df78eab33525d08d6e5fb8d27136e95/3/3/3337875521622.jpg",
  "cv-mou": "https://www.pharmacie-du-centre.fr/media/catalog/product/cache/1/image/700x700/9df78eab33525d08d6e5fb8d27136e95/3/3/3337875772756.jpg",
  "ng-spf": "https://www.pharmacie-du-centre.fr/media/catalog/product/cache/1/image/700x700/9df78eab33525d08d6e5fb8d27136e95/3/5/3574661685921.jpg",
  "ng-bha": "https://www.pharmacie-du-centre.fr/media/catalog/product/cache/1/image/700x700/9df78eab33525d08d6e5fb8d27136e95/0/0/0086800108597.jpg"
};

// ─── PRODUITS ─────────────────────────────────────────────────────────────────
const DB = {
  "cs-power": {nom:"Sérum Le Power",marque:"Cible Skin",prix:"190€",link:"https://www.cibleskin.com/product/serum-le-power",yuka:100,yl:"Excellent",usage:"Anti-rides, liftant & antioxydant",texture:"Sérum fluide",ak:["Complexe IDANS®","Actifs liftants","Antioxydants"],comp:["Aqua","Glycerin","Complexe IDANS®","Sodium Hyaluronate"],clean:true,vegan:true,pq:"Tous types de peau, peaux matures.",ben:"Réduit rides et ridules, effet liftant immédiat.",app:"5-6 gouttes sur visage et cou, matin et/ou soir.",video:"https://www.youtube.com/results?search_query=Cible+Skin+serum+power+skincare",moment:"AM+PM",video:"https://www.youtube.com/results?search_query=Cible+Skin+skincare"},
  "cs-bleu":  {nom:"Sérum Bleu",marque:"Cible Skin",prix:"140€",link:"https://www.cibleskin.com/product/serum-bleu",yuka:100,yl:"Excellent",usage:"Ultra-hydratant & antioxydant",texture:"Sérum gel",ak:["Complexe IDANS®","Acide hyaluronique","Antioxydants"],comp:["Aqua","Complexe IDANS®","Sodium Hyaluronate","Glycerin"],clean:true,vegan:true,pq:"Tous types de peau, peaux déshydratées.",ben:"Repulpe et réhydrate intensément.",app:"5-6 gouttes, matin et soir.",video:"https://www.youtube.com/results?search_query=Cible+Skin+serum+bleu+skincare",moment:"AM+PM",video:"https://www.youtube.com/results?search_query=Cible+Skin+skincare"},
  "cs-skin2": {nom:"Sérum Seconde-Peau",marque:"Cible Skin",prix:"150€",link:"https://www.cibleskin.com/product/serum-seconde-peau",yuka:100,yl:"Excellent",usage:"Anti-imperfections & séborégulateur",texture:"Sérum léger",ak:["Complexe IDANS®","Niacinamide","Zinc PCA"],comp:["Aqua","Complexe IDANS®","Niacinamide","Zinc PCA"],clean:true,vegan:true,pq:"Peaux grasses, mixtes, acnéiques.",ben:"Réduit imperfections, régule sébum, resserre les pores.",app:"5-6 gouttes, matin et soir sur peau propre.",video:"https://www.youtube.com/results?search_query=Cible+Skin+skincare+review",moment:"AM+PM",video:"https://www.youtube.com/results?search_query=Cible+Skin+skincare"},
  "cs-u":     {nom:"Sérum U",marque:"Cible Skin",prix:"170€",link:"https://www.cibleskin.com/product/serum-u",yuka:100,yl:"Excellent",usage:"Anti-taches & unifiant",texture:"Sérum fluide",ak:["Vitamine C biotech","Niacinamide","Ferments Kombucha"],comp:["Aqua","3-O-Ethyl Ascorbic Acid","Niacinamide","Tocopherol"],clean:true,vegan:true,pq:"Peaux avec taches pigmentaires.",ben:"Réduit taches et hyperpigmentation à la racine.",app:"5-6 gouttes, matin et soir. SPF obligatoire le matin.",video:"https://www.youtube.com/results?search_query=Cible+Skin+serum+U+skincare",moment:"AM+PM",video:"https://www.youtube.com/results?search_query=Cible+Skin+skincare"},
  "cs-eye":   {nom:"Eye Sérum O2",marque:"Cible Skin",prix:"110€",link:"https://www.cibleskin.com/product/eye-serum-o2",yuka:100,yl:"Excellent",usage:"Anti-cernes & illuminateur",texture:"Sérum gel",ak:["Complexe IDANS®","Caféine","Actifs anti-cernes"],comp:["Aqua","Complexe IDANS®","Sodium Hyaluronate","Caffeine"],clean:true,vegan:true,pq:"Cernes foncés, poches, contour des yeux fatigué.",ben:"Atténue cernes et poches, illumine le regard.",app:"Tapotements légers autour de l'œil, matin et soir.",video:"https://www.youtube.com/results?search_query=Cible+Skin+soin+yeux",moment:"AM+PM"},
  "cs-culte": {nom:"Mask-Crème Culte",marque:"Cible Skin",prix:"120€",link:"https://www.cibleskin.com/product/la-creme-culte",yuka:100,yl:"Excellent",usage:"Masque illuminateur & exfoliant doux",texture:"Crème-masque",ak:["Acide glycolique","Algues rouges","Biopeeling™"],comp:["Aqua","Glycolic Acid","Red Algae Extract","Tocopherol"],clean:true,vegan:true,pq:"Tous types de peau, teint terne, taches.",ben:"Exfolie, unifie et illumine dès la 1ère utilisation.",app:"1-2x/semaine le soir. Poser 15-20 min, rincer.",video:"https://www.youtube.com/results?search_query=Cible+Skin+creme+culte+review",moment:"PM",video:"https://www.youtube.com/results?search_query=Cible+Skin+skincare"},
  "cs-mousse":{nom:"Gentle Mousse",marque:"Cible Skin",prix:"40€",link:"https://www.cibleskin.com/product/gentle-mousse",yuka:100,yl:"Excellent",usage:"Nettoyant & démaquillant doux",texture:"Mousse légère",ak:["Tensioactifs doux","Glycérine végétale"],comp:["Aqua","Mild surfactants","Glycerin"],clean:true,vegan:true,pq:"Tous types de peau, peaux sensibles.",ben:"Nettoie sans agresser, préserve le microbiome cutané.",app:"2-3 pressions, masser, rincer.",video:"https://www.youtube.com/results?search_query=Cible+Skin+mousse+nettoyante",moment:"AM+PM",video:"https://www.youtube.com/results?search_query=Cible+Skin+skincare"},
  "cs-crev":  {nom:"Crème Revitalisante",marque:"Cible Skin",prix:"155€",link:"https://www.cibleskin.com/product/creme-revitalisante",yuka:100,yl:"Excellent",usage:"Hydratante & matifiante",texture:"Crème légère",ak:["Technologie IDANS®","Acide hyaluronique"],comp:["Aqua","IDANS® Technology","Sodium Hyaluronate"],clean:true,vegan:true,pq:"Tous types de peau, peaux grasses à mixtes.",ben:"Hydrate tout en matifiant, rééquilibre le sébum.",app:"Matin et soir après sérum.",video:"https://www.youtube.com/results?search_query=Cible+Skin+creme+revitalisante",moment:"AM+PM"},
  "skc-cef":  {nom:"C E Ferulic",marque:"SkinCeuticals",prix:"165€",link:"https://www.easypara.fr/serum-visage-anti-rides-ce-ferulic-30ml-vitamine-c-pure-skinceuticals.html",yuka:54,yl:"Médiocre",usage:"Sérum antioxydant Vit.C anti-âge",texture:"Sérum aqueux",ak:["Vitamine C 15%","Vitamine E 1%","Acide férulique 0.5%"],comp:["Ascorbic Acid 15%","Alpha Tocopherol 1%","Ferulic Acid 0.5%"],clean:false,vegan:false,pq:"Peaux normales à sèches, anti-âge.",ben:"Protection antioxydante 72h, réduit rides et taches.",app:"4-5 gouttes le matin, avant crème et SPF.",video:"https://www.youtube.com/embed/8L1ZOhlHAN4",moment:"AM",video:"https://www.youtube.com/results?search_query=SkinCeuticals+serum+soin"},
  "skc-ph":   {nom:"Phloretin CF",marque:"SkinCeuticals",prix:"165€",link:"https://www.easypara.fr/les-marques-de-parapharmacie/skinceuticals.html",yuka:52,yl:"Médiocre",usage:"Sérum antioxydant Vit.C peaux mixtes/grasses",texture:"Sérum fluide",ak:["Vitamine C 10%","Phlorétine 2%","Acide férulique"],comp:["Ascorbic Acid 10%","Phloretin 2%","Ferulic Acid 0.5%"],clean:false,vegan:false,pq:"Peaux mixtes à grasses.",ben:"Protège des radicaux libres, réduit irrégularités de teint.",app:"4-5 gouttes le matin, avant SPF.",video:"https://www.youtube.com/embed/6FJoyFkoymE",moment:"AM",video:"https://www.youtube.com/results?search_query=SkinCeuticals+serum+soin"},
  "skc-sil":  {nom:"Silymarin CF",marque:"SkinCeuticals",prix:"115€",link:"https://www.easypara.fr/les-marques-de-parapharmacie/skinceuticals.html",yuka:58,yl:"Médiocre",usage:"Sérum Vit.C anti-imperfections peaux grasses",texture:"Sérum mat",ak:["Vitamine C 15%","Silymarine 0.5%","Acide salicylique 0.5%"],comp:["Ascorbic Acid 15%","Silybum Marianum 0.5%","Salicylic Acid 0.5%"],clean:false,vegan:false,pq:"Peaux grasses, acnéiques, points noirs.",ben:"Neutralise l'oxydation du sébum, prévient points noirs.",app:"4-5 gouttes le matin.",video:"https://www.youtube.com/embed/9Y5y26T1gy8",moment:"AM",video:"https://www.youtube.com/results?search_query=SkinCeuticals+serum+soin"},
  "skc-ha":   {nom:"HA Intensifier Multi-Glycan",marque:"SkinCeuticals",prix:"115€",link:"https://www.easypara.fr/les-marques-de-parapharmacie/skinceuticals.html",yuka:71,yl:"Bon",usage:"Sérum booster hyaluronique",texture:"Sérum gel",ak:["Acide hyaluronique 10%","Glycane 0.1%","Proxylane"],comp:["Sodium Hyaluronate 10%","Glycane 0.1%","Proxylane"],clean:false,vegan:false,pq:"Tous types de peau, déshydratation.",ben:"Amplifie la production naturelle d'HA, repulpe longue durée.",app:"4-5 gouttes matin et/ou soir.",video:"https://www.youtube.com/embed/zzWH4IWC2Zg",moment:"AM+PM",video:"https://www.youtube.com/results?search_query=SkinCeuticals+serum+soin"},
  "skc-dis":  {nom:"Discoloration Defense",marque:"SkinCeuticals",prix:"105€",link:"https://www.easypara.fr/les-marques-de-parapharmacie/skinceuticals.html",yuka:63,yl:"Bon",usage:"Sérum anti-taches & correcteur hyperpigmentation",texture:"Sérum fluide",ak:["Acide tranexamique 1.8%","Niacinamide 5%","HEPES 5%"],comp:["Tranexamic Acid 1.8%","Niacinamide 5%","HEPES 5%"],clean:false,vegan:false,pq:"Taches brunes, masque de grossesse, cicatrices d'acné.",ben:"Amélioration de 78% du teint en 8 semaines.",app:"Quelques gouttes matin et soir. SPF obligatoire.",video:"https://www.youtube.com/embed/RLvT6Mdy05U",moment:"AM+PM",video:"https://www.youtube.com/results?search_query=SkinCeuticals+serum+soin"},
  "skc-age":  {nom:"A.G.E. Interrupter Advanced",marque:"SkinCeuticals",prix:"155€",link:"https://www.easypara.fr/les-marques-de-parapharmacie/skinceuticals.html",yuka:61,yl:"Bon",usage:"Crème anti-âge correctrice multi-signes",texture:"Crème riche",ak:["Proxylane 25%","Extrait de myrtille","Phytosphingosine"],comp:["Proxylane 25%","Blueberry Extract","Phytosphingosine"],clean:false,vegan:false,pq:"Peaux matures, rides profondes.",ben:"Inverse le vieillissement lié à la glycation.",app:"Matin et soir sur visage et cou.",video:"https://www.youtube.com/embed/aXvfrhJJjMA",moment:"AM+PM",video:"https://www.youtube.com/results?search_query=SkinCeuticals+serum+soin"},
  "skc-bl":   {nom:"Blemish + Age Defense",marque:"SkinCeuticals",prix:"115€",link:"https://www.easypara.fr/les-marques-de-parapharmacie/skinceuticals.html",yuka:49,yl:"Médiocre",usage:"Sérum acide anti-imperfections & anti-âge",texture:"Sérum fluide",ak:["Acide salicylique 2%","LHA 0.2%","Glycolique 3.5%"],comp:["Glycolic Acid 3.5%","LHA 0.2%","Salicylic Acid 2%"],clean:false,vegan:false,pq:"Peaux grasses/mixtes avec imperfections.",ben:"Resserre pores, prévient imperfections, réduit premières rides.",app:"Quelques gouttes le soir. Introduire progressivement.",video:"https://www.youtube.com/embed/isY-GN5hdIM",moment:"PM",video:"https://www.youtube.com/results?search_query=SkinCeuticals+serum+soin"},
  "skc-phy":  {nom:"Phyto Corrective Gel",marque:"SkinCeuticals",prix:"85€",link:"https://www.easypara.fr/les-marques-de-parapharmacie/skinceuticals.html",yuka:78,yl:"Bon",usage:"Sérum apaisant peaux sensibles & rougeurs",texture:"Gel léger",ak:["Extrait de concombre","Thym","Dipeptide-2"],comp:["Cucumber Extract","Thyme Extract","Dipeptide-2"],clean:false,vegan:false,pq:"Peaux sensibles, réactives, rougeurs.",ben:"Apaise et hydrate les peaux fragilisées, réduit les rougeurs.",app:"Quelques gouttes matin et soir.",video:"https://www.youtube.com/embed/pbpTCgKrJhI",moment:"AM+PM",video:"https://www.youtube.com/results?search_query=SkinCeuticals+serum+soin"},
  "skc-met":  {nom:"Metacell Renewal B3",marque:"SkinCeuticals",prix:"90€",link:"https://www.easypara.fr/les-marques-de-parapharmacie/skinceuticals.html",yuka:69,yl:"Bon",usage:"Émulsion corrective quotidienne éclat & fermeté",texture:"Émulsion",ak:["Niacinamide 5%","Tri-peptide"],comp:["Niacinamide 5%","Tri-peptide Concentrate"],clean:false,vegan:false,pq:"Peaux normales à mixtes, premiers signes d'âge.",ben:"Retend et unifie le teint.",app:"Matin et soir, après le sérum.",video:"https://www.youtube.com/embed/zzWH4IWC2Zg",moment:"AM+PM",video:"https://www.youtube.com/results?search_query=SkinCeuticals+serum+soin"},
  "skc-spf":  {nom:"Ultra Facial Defense SPF50",marque:"SkinCeuticals",prix:"55€",link:"https://www.easypara.fr/les-marques-de-parapharmacie/skinceuticals.html",yuka:55,yl:"Médiocre",usage:"Protection solaire SPF50",texture:"Fluide teinté",ak:["Filtres UV avancés","Acide hyaluronique"],comp:["Avobenzone 3%","Homosalate 9%","Titanium Dioxide"],clean:false,vegan:false,pq:"Tous types de peau.",ben:"Protection large spectre UVA/UVB.",app:"Dernière étape du matin.",video:"https://www.youtube.com/embed/zzWH4IWC2Zg",moment:"AM",video:"https://www.youtube.com/results?search_query=SkinCeuticals+serum+soin"},
  "lrp-effgel":{nom:"Gel Moussant Effaclar",marque:"La Roche-Posay",prix:"14€",link:"https://www.easypara.fr/gel-moussant-400ml-effaclar-la-roche-posay.html",yuka:67,yl:"Bon",usage:"Gel nettoyant purifiant peaux grasses",texture:"Gel moussant",ak:["Acide salicylique 0.1%","Niacinamide","Zinc"],comp:["Water","Salicylic Acid 0.1%","Niacinamide","Zinc Pidolate"],clean:false,vegan:false,pq:"Peaux grasses, mixtes, acnéiques.",ben:"Nettoie, régule sébum, désobstrue les pores.",app:"Sur visage humide, masser, rincer. Matin et soir.",video:"https://www.youtube.com/embed/xtwt0RxvXI0",moment:"AM+PM",video:"https://www.youtube.com/results?search_query=La+Roche-Posay+soin+peau"},
  "lrp-effduo":{nom:"Effaclar Duo+ M",marque:"La Roche-Posay",prix:"22€",link:"https://www.easypara.fr/duo-plus-40ml-effaclar-la-roche-posay.html",yuka:62,yl:"Bon",usage:"Soin anti-imperfections & anti-marques",texture:"Crème légère",ak:["Niacinamide 2%","Acide salicylique 0.3%","LHA"],comp:["Niacinamide 2%","Salicylic Acid 0.3%","LHA 0.15%"],clean:false,vegan:false,pq:"Peaux grasses et mixtes acnéiques.",ben:"Traite boutons, prévient récidives, réduit marques post-acné.",app:"Matin et soir sur visage propre.",video:"https://www.youtube.com/embed/xtwt0RxvXI0",moment:"AM+PM",video:"https://www.youtube.com/results?search_query=La+Roche-Posay+soin+peau"},
  "lrp-cica": {nom:"Cicaplast Baume B5",marque:"La Roche-Posay",prix:"11€",link:"https://www.easypara.fr/baume-b5-40ml-cicaplast-la-roche-posay.html",yuka:74,yl:"Bon",usage:"Baume réparateur peaux irritées",texture:"Baume riche",ak:["Panthenol B5 5%","Madecassoside","Beurre de karité"],comp:["Panthenol B5 5%","Madecassoside","Shea Butter","Zinc"],clean:false,vegan:false,pq:"Peaux sensibles, réactives, irritées.",ben:"Apaise, répare et protège la barrière cutanée.",app:"Appliquer sur zones irritées, visage et corps.",video:"https://www.youtube.com/embed/bKb99QJPyS0",moment:"AM+PM",video:"https://www.youtube.com/results?search_query=La+Roche-Posay+soin+peau"},
  "lrp-tol":  {nom:"Toleriane Dermallergo",marque:"La Roche-Posay",prix:"19€",link:"https://www.easypara.fr/les-marques-de-parapharmacie/la-roche-posay.html",yuka:83,yl:"Excellent",usage:"Hydratant longue durée peaux très sensibles",texture:"Crème confort",ak:["Neurosensine","Beurre de karité"],comp:["Neurosensine","Shea Butter","Glycerin"],clean:false,vegan:false,pq:"Peaux hypersensibles, allergiques.",ben:"Apaisement immédiat et longue durée.",app:"Matin et soir sur visage propre.",video:"https://www.youtube.com/results?search_query=La+Roche-Posay+soin+peau",moment:"AM+PM",video:"https://www.youtube.com/results?search_query=La+Roche-Posay+soin+peau"},
  "lrp-anth": {nom:"Anthelios Invisible SPF50+",marque:"La Roche-Posay",prix:"20€",link:"https://www.easypara.fr/les-marques-de-parapharmacie/la-roche-posay/solaires.html",yuka:58,yl:"Médiocre",usage:"Protection solaire SPF50+ quotidienne",texture:"Fluide invisible",ak:["Mexoryl XL & SX","Tinosorb S"],comp:["Mexoryl XL","Mexoryl SX","Tinosorb S"],clean:false,vegan:false,pq:"Tous types de peau.",ben:"Protection maximale UVA/UVB. Texture invisible.",app:"Le matin en dernière étape.",video:"https://www.youtube.com/embed/xtwt0RxvXI0",moment:"AM",video:"https://www.youtube.com/results?search_query=La+Roche-Posay+soin+peau"},
  "lrp-hyalu":{nom:"Hyalu B5 Sérum",marque:"La Roche-Posay",prix:"34€",link:"https://www.easypara.fr/les-marques-de-parapharmacie/la-roche-posay.html",yuka:76,yl:"Bon",usage:"Sérum repulpant anti-rides",texture:"Sérum gel",ak:["Acide hyaluronique bi-moléculaire","Madecassoside","Vitamine B5"],comp:["Sodium Hyaluronate","Madecassoside","Vitamin B5"],clean:false,vegan:false,pq:"Peaux sèches à normales, premières rides.",ben:"Repulpe et lisse les rides, double action hydratante.",app:"Matin et soir, avant la crème.",video:"https://www.youtube.com/embed/xtwt0RxvXI0",moment:"AM+PM",video:"https://www.youtube.com/results?search_query=La+Roche-Posay+soin+peau"},
  "av-tol":   {nom:"Crème Tolérance Extrême",marque:"Avène",prix:"19€",link:"https://www.easypara.fr/les-marques-de-parapharmacie/avene.html",yuka:88,yl:"Excellent",usage:"Hydratant ultra-tolérance peaux hypersensibles",texture:"Crème légère",ak:["Eau thermale d'Avène","Cold Cream"],comp:["Avene Thermal Spring Water","Cold Cream","Glycerin"],clean:false,vegan:false,pq:"Peaux hypersensibles, intolérantes.",ben:"8 ingrédients. Aucun conservateur ni parfum.",app:"Matin et soir.",video:"https://www.youtube.com/results?search_query=Avene+soin+peau+sensible",moment:"AM+PM",video:"https://www.youtube.com/results?search_query=Avene+soin+peau+sensible"},
  "av-lait":  {nom:"Lait Nettoyant Tolérance Extrême",marque:"Avène",prix:"13€",link:"https://www.easypara.fr/les-marques-de-parapharmacie/avene.html",yuka:85,yl:"Excellent",usage:"Nettoyant doux peaux sèches et sensibles",texture:"Lait fluide",ak:["Eau thermale d'Avène","Cold Cream"],comp:["Avene Thermal Spring Water","Cold Cream","Glycerin"],clean:false,vegan:false,pq:"Peaux sèches et sensibles.",ben:"Nettoie en douceur sans agresser.",app:"Appliquer, masser, rincer ou retirer au coton.",video:"https://www.youtube.com/results?search_query=Avene+soin+peau+sensible",moment:"AM+PM",video:"https://www.youtube.com/results?search_query=Avene+soin+peau+sensible"},
  "bd-sens":  {nom:"Sensibio H2O",marque:"Bioderma",prix:"11€",link:"https://www.easypara.fr/solution-micellaire-demaquillante-sans-parfum-500ml-crealine-h2o-bioderma.html",yuka:72,yl:"Bon",usage:"Eau micellaire démaquillante peaux sensibles",texture:"Eau micellaire",ak:["Eau micellaire","Fructooligosaccharides"],comp:["Water","PEG-6 Caprylic/Capric Glycerides","Fructooligosaccharides","Mannitol","Xylitol"],clean:false,vegan:false,pq:"Tous types de peau, peaux sensibles.",ben:"Démaquille sans friction ni rinçage.",app:"Verser sur coton, appliquer sans frotter. Sans rinçage.",video:"https://www.youtube.com/results?search_query=Bioderma+soin+peau",moment:"AM+PM",video:"https://www.youtube.com/results?search_query=Bioderma+soin+peau"},
  "bd-sebgel":{nom:"Sébium Gel Moussant",marque:"Bioderma",prix:"13€",link:"https://www.easypara.fr/les-marques-de-parapharmacie/bioderma/soins.html",yuka:68,yl:"Bon",usage:"Gel nettoyant purifiant peaux grasses",texture:"Gel moussant",ak:["Fluidactiv","Zinc","Cuivre"],comp:["Water","Zinc Gluconate","Copper Gluconate","Fluidactiv"],clean:false,vegan:false,pq:"Peaux grasses et mixtes.",ben:"Régule la qualité du sébum (Fluidactiv).",app:"Sur visage humide, masser, rincer.",video:"https://www.youtube.com/results?search_query=Bioderma+soin+peau",moment:"AM+PM",video:"https://www.youtube.com/results?search_query=Bioderma+soin+peau"},
  "bd-hydra": {nom:"Hydrabio Gel-Crème",marque:"Bioderma",prix:"17€",link:"https://www.easypara.fr/les-marques-de-parapharmacie/bioderma/soins.html",yuka:75,yl:"Bon",usage:"Gel-crème hydratant peaux normales à mixtes",texture:"Gel-crème",ak:["Complexe Aquagenium","Acide hyaluronique"],comp:["Water","Aquagenium Complex","Sodium Hyaluronate","Mannitol"],clean:false,vegan:false,pq:"Peaux normales à mixtes déshydratées.",ben:"Hydrate intensément, renforce la réhydratation naturelle.",app:"Matin et soir après nettoyage.",video:"https://www.youtube.com/results?search_query=Bioderma+soin+peau",moment:"AM+PM",video:"https://www.youtube.com/results?search_query=Bioderma+soin+peau"},
  "bd-sebser":{nom:"Sébium Sérum Global",marque:"Bioderma",prix:"25€",link:"https://www.easypara.fr/les-marques-de-parapharmacie/bioderma/soins.html",yuka:66,yl:"Bon",usage:"Sérum purifiant anti-imperfections & pores",texture:"Sérum gel",ak:["Fluidactiv","AHA/BHA","Niacinamide"],comp:["Fluidactiv","AHA/BHA complex","Niacinamide","Zinc Gluconate"],clean:false,vegan:false,pq:"Peaux grasses et mixtes avec pores dilatés.",ben:"Régule sébum, resserre pores, réduit imperfections.",app:"Matin et soir après nettoyage.",video:"https://www.youtube.com/results?search_query=Bioderma+soin+peau",moment:"AM+PM",video:"https://www.youtube.com/results?search_query=Bioderma+soin+peau"},
  "cv-gel":   {nom:"Gel Moussant Anti-Imperfections",marque:"CeraVe",prix:"9€",link:"https://www.easypara.fr/les-marques-de-parapharmacie/cerave.html",yuka:56,yl:"Médiocre",usage:"Gel nettoyant purifiant peaux grasses",texture:"Gel moussant",ak:["Acide salicylique 0.5%","Niacinamide","Céramides 1,3,6-II"],comp:["Salicylic Acid 0.5%","Niacinamide","Ceramides 1,3,6-II"],clean:false,vegan:false,pq:"Peaux grasses, mixtes, acnéiques.",ben:"Élimine l'excès de sébum sans altérer la barrière.",app:"Sur peau humide, masser, rincer.",video:"https://www.youtube.com/embed/ebl5LLtuQe4",moment:"AM+PM",video:"https://www.youtube.com/results?search_query=CeraVe+gel+moussant+anti+imperfections"},
  "cv-crem":  {nom:"Crème Hydratante",marque:"CeraVe",prix:"12€",link:"https://www.easypara.fr/les-marques-de-parapharmacie/cerave.html",yuka:64,yl:"Bon",usage:"Crème hydratante restauratrice peaux sèches",texture:"Crème riche",ak:["Céramides 1,3,6-II","Acide hyaluronique","Niacinamide"],comp:["Ceramides 1,3,6-II","Hyaluronic Acid","Niacinamide","Glycerin"],clean:false,vegan:false,pq:"Peaux sèches à très sèches.",ben:"Hydratation continue 24h (technologie MVE).",app:"Matin et soir sur visage et cou.",video:"https://www.youtube.com/embed/JCAKu-TTFh0",moment:"AM+PM",video:"https://www.youtube.com/results?search_query=CeraVe+produit+soin"},
  "cv-vitc":  {nom:"Sérum Vitamine C",marque:"CeraVe",prix:"14€",link:"https://www.easypara.fr/les-marques-de-parapharmacie/cerave.html",yuka:60,yl:"Bon",usage:"Sérum éclat vitamine C & anti-taches",texture:"Sérum fluide",ak:["Vitamine C 10%","Niacinamide","Céramides"],comp:["L-Ascorbic Acid 10%","Niacinamide","Ceramides"],clean:false,vegan:false,pq:"Teint terne, petites taches.",ben:"Illumine le teint, estompe les petites taches.",app:"Matin, 2-3 gouttes, avant crème et SPF.",video:"https://www.youtube.com/embed/JCAKu-TTFh0",moment:"AM",video:"https://www.youtube.com/results?search_query=CeraVe+produit+soin"},
  "cv-ret":   {nom:"Sérum Rétinol Anti-Marques",marque:"CeraVe",prix:"14€",link:"https://www.easypara.fr/les-marques-de-parapharmacie/cerave.html",yuka:58,yl:"Médiocre",usage:"Sérum rétinol anti-âge & anti-marques",texture:"Sérum fluide",ak:["Rétinol encapsulé","Niacinamide","Extrait de réglisse"],comp:["Encapsulated Retinol","Niacinamide","Licorice Root Extract"],clean:false,vegan:false,pq:"Taches post-acné, premières rides.",ben:"Rétinol à libération progressive. Réduit marques et rides.",app:"Soir uniquement. Commencer 2x/semaine.",video:"https://www.youtube.com/embed/JCAKu-TTFh0",moment:"PM",video:"https://www.youtube.com/results?search_query=CeraVe+produit+soin"},
  "cv-eye":   {nom:"Crème Contour des Yeux",marque:"CeraVe",prix:"13€",link:"https://www.easypara.fr/les-marques-de-parapharmacie/cerave.html",yuka:63,yl:"Bon",usage:"Soin contour des yeux hydratant",texture:"Crème légère",ak:["Céramides","Acide hyaluronique","Niacinamide"],comp:["Ceramides","Hyaluronic Acid","Niacinamide"],clean:false,vegan:false,pq:"Cernes, contour des yeux fatigué.",ben:"Hydrate la zone délicate, réduit l'aspect fatigué.",app:"Légers tapotements matin et soir.",video:"https://www.youtube.com/results?search_query=CeraVe+produit+soin",moment:"AM+PM",video:"https://www.youtube.com/results?search_query=CeraVe+produit+soin"},
  "cv-mou":   {nom:"Mousse Nettoyante",marque:"CeraVe",prix:"9€",link:"https://www.easypara.fr/les-marques-de-parapharmacie/cerave.html",yuka:59,yl:"Médiocre",usage:"Mousse nettoyante peaux normales à mixtes",texture:"Mousse légère",ak:["Niacinamide","Céramides 1,3,6-II","Acide hyaluronique"],comp:["Niacinamide","Ceramides 1,3,6-II","Hyaluronic Acid"],clean:false,vegan:false,pq:"Peaux normales à mixtes.",ben:"Nettoie efficacement sans dessécher.",app:"Sur peau humide, masser, rincer.",video:"https://www.youtube.com/embed/ebl5LLtuQe4",moment:"AM+PM",video:"https://www.youtube.com/results?search_query=CeraVe+produit+soin"},
  "ng-spf":   {nom:"Fluide Hydratant SPF50",marque:"Neutrogena",prix:"10€",link:"https://www.easypara.fr/les-marques-de-parapharmacie/neutrogena.html",yuka:48,yl:"Médiocre",usage:"Protection solaire quotidienne SPF50",texture:"Fluide léger",ak:["Avobenzone","Homosalate"],comp:["Avobenzone","Homosalate","Glycerin"],clean:false,vegan:false,pq:"Tous types de peau.",ben:"Protection large spectre, texture légère.",app:"Le matin en dernière étape.",video:"https://www.youtube.com/results?search_query=Neutrogena+skincare",moment:"AM",video:"https://www.youtube.com/results?search_query=Neutrogena+skincare"},
  "ng-bha":   {nom:"Sérum Anti-Imperfections BHA",marque:"Neutrogena",prix:"12€",link:"https://www.easypara.fr/les-marques-de-parapharmacie/neutrogena.html",yuka:51,yl:"Médiocre",usage:"Sérum anti-points noirs & imperfections",texture:"Sérum fluide",ak:["Acide salicylique 2%","Vitamine B5"],comp:["Salicylic Acid 2%","Vitamin B5"],clean:false,vegan:false,pq:"Peaux avec points noirs.",ben:"Dissout les bouchons et points noirs.",app:"Soir sur visage propre.",video:"https://www.youtube.com/results?search_query=Neutrogena+skincare",moment:"PM",video:"https://www.youtube.com/results?search_query=Neutrogena+skincare"},

  // ── SVR ──────────────────────────────────────────────────────────────────────
  "svr-hydra": {nom:"Hydraliane Légère",marque:"SVR",prix:"14€",link:"https://www.easypara.fr/svr-hydraliane-legere.html",yuka:82,yl:"Excellent",usage:"Crème hydratante légère peaux normales à mixtes",texture:"Crème légère",ak:["Acide hyaluronique","Glycérine","Allantoïne"],comp:["Aqua","Glycerin","Sodium Hyaluronate","Allantoin"],clean:false,vegan:false,pq:"Peaux normales à mixtes.",ben:"Hydratation longue durée, texture fondante.",app:"Matin et soir sur visage propre.",video:"https://www.youtube.com/results?search_query=SVR+laboratoire+soin",moment:"AM+PM",ben_en:"Long-lasting hydration with melting texture."},
  "svr-sebiaclear": {nom:"Sebiaclear Gel Moussant",marque:"SVR",prix:"11€",link:"https://www.easypara.fr/svr-sebiaclear-gel-moussant.html",yuka:74,yl:"Bon",usage:"Gel nettoyant purifiant peaux grasses",texture:"Gel moussant",ak:["Acide salicylique","Niacinamide","Zinc"],comp:["Water","Salicylic Acid","Niacinamide","Zinc Gluconate"],clean:false,vegan:false,pq:"Peaux grasses et mixtes acnéiques.",ben:"Nettoie et réduit les imperfections.",app:"Matin et soir, rincer.",video:"https://www.youtube.com/results?search_query=SVR+laboratoire+soin",moment:"AM+PM",ben_en:"Cleanses and reduces blemishes."},
  "svr-xerial": {nom:"Xerial 10 Lait",marque:"SVR",prix:"13€",link:"https://www.easypara.fr/svr-xerial-10-lait.html",yuka:78,yl:"Bon",usage:"Lait hydratant peaux très sèches",texture:"Lait",ak:["Urée 10%","Acide lactique","Glycérine"],comp:["Water","Urea 10%","Lactic Acid","Glycerin"],clean:false,vegan:false,pq:"Peaux très sèches.",ben:"Exfolie et hydrate intensément.",app:"Appliquer sur peau sèche.",moment:"AM+PM",ben_en:"Intensely exfoliates and hydrates."},
  "svr-cicavit": {nom:"Cicavit+ Crème",marque:"SVR",prix:"12€",link:"https://www.easypara.fr/svr-cicavit.html",yuka:80,yl:"Bon",usage:"Crème réparatrice cicatrisante",texture:"Crème",ak:["Vitamine B5","Allantoïne","Zinc"],comp:["Water","Panthenol","Allantoin","Zinc Oxide"],clean:false,vegan:false,pq:"Peaux irritées, cicatrices.",ben:"Répare et apaise les peaux abîmées.",app:"Appliquer sur zones à traiter.",moment:"AM+PM",ben_en:"Repairs and soothes damaged skin."},
  "svr-sun-secure": {nom:"Sun Secure SPF50+",marque:"SVR",prix:"16€",link:"https://www.easypara.fr/svr-sun-secure.html",yuka:72,yl:"Bon",usage:"Protection solaire SPF50+",texture:"Spray",ak:["Filtres UV minéraux","Vitamine E"],comp:["Titanium Dioxide","Zinc Oxide","Tocopherol"],clean:false,vegan:false,pq:"Tous types de peau.",ben:"Protection large spectre, résistant à l'eau.",app:"Avant exposition, renouveler toutes les 2h.",moment:"AM",ben_en:"Broad spectrum water-resistant protection."},

  // ── URIAGE ───────────────────────────────────────────────────────────────────
  "uri-eau-thermale": {nom:"Eau Thermale Lotion",marque:"Uriage",prix:"9€",link:"https://www.easypara.fr/uriage-eau-thermale.html",yuka:85,yl:"Excellent",usage:"Eau thermale apaisante",texture:"Spray",ak:["Eau thermale d'Uriage","Sels minéraux"],comp:["Uriage Thermal Water","Mineral Salts"],clean:false,vegan:false,pq:"Tous types de peau, peaux sensibles.",ben:"Apaise et hydrate instantanément.",app:"Vaporiser sur visage, ne pas rincer.",moment:"AM+PM",ben_en:"Instantly soothes and hydrates."},
  "uri-bariesun": {nom:"Bariesun SPF50+",marque:"Uriage",prix:"18€",link:"https://www.easypara.fr/uriage-bariesun.html",yuka:68,yl:"Bon",usage:"Crème solaire SPF50+ peaux sensibles",texture:"Crème fluide",ak:["Eau thermale d'Uriage","Filtres UV","Bisabolol"],comp:["Uriage Thermal Water","UV Filters","Bisabolol"],clean:false,vegan:false,pq:"Peaux sensibles.",ben:"Protection haute et apaisement.",app:"Le matin avant exposition.",moment:"AM",ben_en:"High protection with soothing effect."},
  "uri-roseliane": {nom:"Roséliane Crème",marque:"Uriage",prix:"17€",link:"https://www.easypara.fr/uriage-roseliane.html",yuka:76,yl:"Bon",usage:"Crème anti-rougeurs peaux sensibles",texture:"Crème légère",ak:["Eau thermale d'Uriage","Ruscus","Vitamine PP"],comp:["Uriage Thermal Water","Ruscus Extract","Niacinamide"],clean:false,vegan:false,pq:"Peaux avec rougeurs et couperose.",ben:"Réduit les rougeurs et renforce la peau.",app:"Matin et soir.",video:"https://www.youtube.com/results?search_query=Uriage+soin+peau",moment:"AM+PM",ben_en:"Reduces redness and strengthens skin."},
  "uri-isdin": {nom:"Hyséac Gel Nettoyant",marque:"Uriage",prix:"10€",link:"https://www.easypara.fr/uriage-hyseac.html",yuka:70,yl:"Bon",usage:"Gel nettoyant peaux grasses",texture:"Gel",ak:["Eau thermale","Zinc","Acide salicylique"],comp:["Uriage Thermal Water","Zinc","Salicylic Acid"],clean:false,vegan:false,pq:"Peaux grasses et acnéiques.",ben:"Nettoie et matifie la peau.",app:"Matin et soir.",moment:"AM+PM",ben_en:"Cleanses and mattifies skin."},
  "uri-prederma": {nom:"Prederma Crème Riche",marque:"Uriage",prix:"20€",link:"https://www.easypara.fr/uriage-prederma.html",yuka:79,yl:"Bon",usage:"Crème nourrissante peaux sèches",texture:"Crème riche",ak:["Eau thermale","Cold Cream","Beurre de karité"],comp:["Uriage Thermal Water","Cold Cream","Shea Butter"],clean:false,vegan:false,pq:"Peaux sèches à très sèches.",ben:"Nourrit et protège les peaux sèches.",app:"Matin et soir.",moment:"AM+PM",ben_en:"Nourishes and protects dry skin."},

  // ── EUCERIN ──────────────────────────────────────────────────────────────────
  "euc-hyaluron": {nom:"Hyaluron-Filler Sérum",marque:"Eucerin",prix:"35€",link:"https://www.easypara.fr/eucerin-hyaluron-filler-serum.html",yuka:65,yl:"Bon",usage:"Sérum anti-rides à l'acide hyaluronique",texture:"Sérum",ak:["Acide hyaluronique","Urée"],comp:["Sodium Hyaluronate","Urea","Glycerin"],clean:false,vegan:false,pq:"Peaux matures, rides et ridules.",ben:"Comble les rides et repulpe la peau.",app:"Matin et soir avant la crème.",video:"https://www.youtube.com/results?search_query=Eucerin+soin+hydratant",moment:"AM+PM",ben_en:"Fills wrinkles and plumps skin."},
  "euc-aquaphor": {nom:"Aquaphor Baume",marque:"Eucerin",prix:"12€",link:"https://www.easypara.fr/eucerin-aquaphor.html",yuka:88,yl:"Excellent",usage:"Baume réparateur multi-usage",texture:"Baume",ak:["Panthenol","Bisabolol","Glycérine"],comp:["Petrolatum","Panthenol","Bisabolol"],clean:false,vegan:false,pq:"Peaux sèches, lèvres, zones irritées.",ben:"Répare et protège les peaux abîmées.",app:"Appliquer sur zones sèches.",moment:"AM+PM",ben_en:"Repairs and protects damaged skin."},
  "euc-dermopure": {nom:"Dermopure Gel Nettoyant",marque:"Eucerin",prix:"12€",link:"https://www.easypara.fr/eucerin-dermopure.html",yuka:66,yl:"Bon",usage:"Gel nettoyant anti-imperfections",texture:"Gel",ak:["Acide salicylique","Zinc"],comp:["Water","Salicylic Acid","Zinc Gluconate"],clean:false,vegan:false,pq:"Peaux grasses et acnéiques.",ben:"Réduit les imperfections et les pores.",app:"Matin et soir.",moment:"AM+PM",ben_en:"Reduces blemishes and pores."},
  "euc-urearepair": {nom:"UreaRepair Crème 5%",marque:"Eucerin",prix:"14€",link:"https://www.easypara.fr/eucerin-urearepair.html",yuka:71,yl:"Bon",usage:"Crème hydratante à l'urée peaux sèches",texture:"Crème",ak:["Urée 5%","Acide lactique"],comp:["Urea 5%","Lactic Acid","Glycerin"],clean:false,vegan:false,pq:"Peaux sèches à très sèches.",ben:"Hydrate et répare la barrière cutanée.",app:"Matin et soir.",moment:"AM+PM",ben_en:"Hydrates and repairs the skin barrier."},
  "euc-sun": {nom:"Sun Gel-Crème SPF50",marque:"Eucerin",prix:"20€",link:"https://www.easypara.fr/eucerin-sun.html",yuka:62,yl:"Bon",usage:"Protection solaire SPF50 peaux grasses",texture:"Gel-crème",ak:["Tinosorb M","Tinosorb S"],comp:["Tinosorb M","Tinosorb S","Glycerin"],clean:false,vegan:false,pq:"Peaux grasses.",ben:"Protection haute sans effet gras.",app:"Le matin.",moment:"AM",ben_en:"High protection without greasy effect."},

  // ── ACM ──────────────────────────────────────────────────────────────────────
  "acm-sebionex": {nom:"Sebionex Gel Nettoyant",marque:"ACM",prix:"12€",link:"https://www.easypara.fr/acm-sebionex.html",yuka:72,yl:"Bon",usage:"Gel nettoyant peaux grasses",texture:"Gel",ak:["Acide salicylique","Zinc"],comp:["Water","Salicylic Acid","Zinc PCA"],clean:false,vegan:false,pq:"Peaux grasses et mixtes.",ben:"Nettoie et régule le sébum.",app:"Matin et soir.",moment:"AM+PM",ben_en:"Cleanses and regulates sebum."},
  "acm-depiwhite": {nom:"Depiwhite Crème Dépigmentante",marque:"ACM",prix:"28€",link:"https://www.easypara.fr/acm-depiwhite.html",yuka:68,yl:"Bon",usage:"Crème dépigmentante anti-taches",texture:"Crème",ak:["Phytosphingosine","Niacinamide","Acide kojique"],comp:["Phytosphingosine","Niacinamide","Kojic Acid"],clean:false,vegan:false,pq:"Peaux avec taches d'hyperpigmentation.",ben:"Réduit les taches et unifie le teint.",app:"Soir sur zones à traiter.",moment:"PM",ben_en:"Reduces dark spots and evens skin tone."},
  "acm-sterilak": {nom:"Sterilak Crème",marque:"ACM",prix:"15€",link:"https://www.easypara.fr/acm-sterilak.html",yuka:75,yl:"Bon",usage:"Crème purifiante anti-acné",texture:"Crème légère",ak:["Zinc","Niacinamide","Soufre"],comp:["Zinc","Niacinamide","Sulfur"],clean:false,vegan:false,pq:"Peaux acnéiques.",ben:"Réduit les boutons et prévient leur apparition.",app:"Matin et soir.",moment:"AM+PM",ben_en:"Reduces pimples and prevents breakouts."},
  "acm-novophane": {nom:"Novophane Shampooing",marque:"ACM",prix:"14€",link:"https://www.easypara.fr/acm-novophane.html",yuka:70,yl:"Bon",usage:"Shampooing antipelliculaire",texture:"Shampooing",ak:["Kétoconazole","Zinc Pyrithione"],comp:["Ketoconazole","Zinc Pyrithione"],clean:false,vegan:false,pq:"Cuir chevelu avec pellicules.",ben:"Élimine les pellicules et prévient leur retour.",app:"2x par semaine.",moment:"AM+PM",ben_en:"Eliminates dandruff and prevents recurrence."},

  // ── AHAVA ────────────────────────────────────────────────────────────────────
  "aha-dead-sea": {nom:"Dead Sea Water Mineral Toner",marque:"AHAVA",prix:"30€",link:"https://www.easypara.fr/ahava.html",yuka:78,yl:"Bon",usage:"Lotion tonifiante eau de mer Morte",texture:"Lotion",ak:["Eau de mer Morte","Minéraux","Osmoter"],comp:["Dead Sea Water","Minerals","Osmoter"],clean:false,vegan:true,pq:"Tous types de peau.",ben:"Purifie et équilibre le pH de la peau.",app:"Après nettoyage, matin et soir.",moment:"AM+PM",ben_en:"Purifies and balances skin pH."},
  "aha-mineral": {nom:"Mineral Botanic Crème",marque:"AHAVA",prix:"45€",link:"https://www.easypara.fr/ahava.html",yuka:80,yl:"Excellent",usage:"Crème hydratante aux minéraux de la mer Morte",texture:"Crème",ak:["Eau de mer Morte","Osmoter","Beurre de rose"],comp:["Dead Sea Water","Osmoter","Rose Butter"],clean:false,vegan:true,pq:"Peaux sèches à normales.",ben:"Nourrit et revitalise grâce aux minéraux.",app:"Matin et soir.",moment:"AM+PM",ben_en:"Nourishes and revitalizes with minerals."},
  "aha-mud": {nom:"Dead Sea Mud Mask",marque:"AHAVA",prix:"35€",link:"https://www.easypara.fr/ahava.html",yuka:82,yl:"Excellent",usage:"Masque purifiant à la boue de mer Morte",texture:"Masque",ak:["Boue de mer Morte","Minéraux"],comp:["Dead Sea Mud","Minerals","Glycerin"],clean:false,vegan:true,pq:"Tous types de peau, peaux grasses.",ben:"Purifie en profondeur et resserre les pores.",app:"1-2x par semaine, laisser 10 min.",moment:"PM",ben_en:"Deep purifies and tightens pores."},

  // ── DUCRAY ───────────────────────────────────────────────────────────────────
  "duc-melascreen": {nom:"Melascreen Crème Légère SPF50+",marque:"Ducray",prix:"26€",link:"https://www.easypara.fr/ducray-melascreen.html",yuka:65,yl:"Bon",usage:"Crème anti-taches SPF50+ peaux normales",texture:"Crème légère",ak:["Mexoryl SX","Vitamine PP","Glycolique"],comp:["Mexoryl SX","Niacinamide","Glycolic Acid"],clean:false,vegan:false,pq:"Peaux avec taches pigmentaires.",ben:"Corrige les taches et protège du soleil.",app:"Le matin comme dernière étape.",video:"https://www.youtube.com/results?search_query=Ducray+soin+peau",moment:"AM",ben_en:"Corrects dark spots and protects from sun."},
  "duc-kertyol": {nom:"Kertyol Shampooing",marque:"Ducray",prix:"15€",link:"https://www.easypara.fr/ducray-kertyol.html",yuka:68,yl:"Bon",usage:"Shampooing kératorégulateur psoriasis",texture:"Shampooing",ak:["Acide salicylique","Piroctone Olamine"],comp:["Salicylic Acid","Piroctone Olamine"],clean:false,vegan:false,pq:"Cuir chevelu avec psoriasis.",ben:"Réduit les squames et démangeaisons.",app:"1-2x par semaine.",moment:"AM+PM",ben_en:"Reduces scales and itching."},
  "duc-anaphase": {nom:"Anaphase+ Shampooing",marque:"Ducray",prix:"14€",link:"https://www.easypara.fr/ducray-anaphase.html",yuka:72,yl:"Bon",usage:"Shampooing anti-chute",texture:"Shampooing",ak:["Vitamines B","Arginine","Taurine"],comp:["Vitamins B","Arginine","Taurine"],clean:false,vegan:false,pq:"Chute de cheveux.",ben:"Renforce et stimule la pousse des cheveux.",app:"Chaque lavage.",moment:"AM+PM",ben_en:"Strengthens and stimulates hair growth."},
  "duc-ictyane": {nom:"Ictyane Crème Hydratante",marque:"Ducray",prix:"16€",link:"https://www.easypara.fr/ducray-ictyane.html",yuka:76,yl:"Bon",usage:"Crème hydratante peaux sèches",texture:"Crème",ak:["Urée","Glycérine","Beurre de karité"],comp:["Urea","Glycerin","Shea Butter"],clean:false,vegan:false,pq:"Peaux sèches.",ben:"Hydrate durablement les peaux sèches.",app:"Matin et soir.",moment:"AM+PM",ben_en:"Durably hydrates dry skin."},

  // ── A-DERMA ──────────────────────────────────────────────────────────────────
  "ader-epitheliale": {nom:"Epitheliale A.H Crème",marque:"A-Derma",prix:"20€",link:"https://www.easypara.fr/a-derma-epitheliale.html",yuka:83,yl:"Excellent",usage:"Crème réparatrice ultra-riche",texture:"Crème riche",ak:["Avoine Rhealba","Dexpanthenol"],comp:["Avoine Rhealba Extract","Dexpanthenol","Glycerin"],clean:false,vegan:false,pq:"Peaux sèches à très sèches, irritées.",ben:"Répare et restaure la barrière cutanée.",app:"Matin et soir.",moment:"AM+PM",ben_en:"Repairs and restores the skin barrier."},
  "ader-protect": {nom:"Protect Crème SPF50+",marque:"A-Derma",prix:"18€",link:"https://www.easypara.fr/a-derma-protect.html",yuka:74,yl:"Bon",usage:"Protection solaire SPF50+ peaux sensibles",texture:"Crème",ak:["Avoine Rhealba","Filtres UV"],comp:["Avoine Rhealba","UV Filters","Glycerin"],clean:false,vegan:false,pq:"Peaux sensibles.",ben:"Protège et apaise les peaux réactives.",app:"Le matin.",moment:"AM",ben_en:"Protects and soothes reactive skin."},
  "ader-exomega": {nom:"Exomega Control Crème",marque:"A-Derma",prix:"22€",link:"https://www.easypara.fr/a-derma-exomega.html",yuka:80,yl:"Excellent",usage:"Crème émolliente peaux atopiques",texture:"Crème",ak:["Avoine Rhealba","Vitamine PP","Glycérine"],comp:["Avoine Rhealba","Niacinamide","Glycerin"],clean:false,vegan:false,pq:"Peaux atopiques et eczémateuses.",ben:"Apaise et hydrate les peaux atopiques.",app:"Matin et soir.",moment:"AM+PM",ben_en:"Soothes and hydrates atopic skin."},
  "ader-dermalibour": {nom:"Dermalibour+ Crème",marque:"A-Derma",prix:"14€",link:"https://www.easypara.fr/a-derma-dermalibour.html",yuka:78,yl:"Bon",usage:"Crème purifiante peaux irritées",texture:"Crème",ak:["Avoine Rhealba","Cuivre","Zinc"],comp:["Avoine Rhealba","Copper","Zinc"],clean:false,vegan:false,pq:"Peaux irritées et surinfectées.",ben:"Assainit et apaise les peaux irritées.",app:"Appliquer sur zones à traiter.",moment:"AM+PM",ben_en:"Sanitizes and soothes irritated skin."},

  // ── PAYOT ────────────────────────────────────────────────────────────────────
  "pay-pate-grise": {nom:"Pate Grise Originale",marque:"Payot",prix:"15€",link:"https://www.easypara.fr/payot-pate-grise.html",yuka:70,yl:"Bon",usage:"Soin ciblé anti-imperfections",texture:"Pâte",ak:["Argile","Soufre","Camphre"],comp:["Kaolin","Sulfur","Camphor"],clean:false,vegan:false,pq:"Peaux avec imperfections.",ben:"Assèche les boutons rapidement.",app:"Application locale sur bouton.",moment:"PM",ben_en:"Quickly dries out pimples."},
  "pay-hydra24": {nom:"Hydra 24+ Crème Réconfortante",marque:"Payot",prix:"38€",link:"https://www.easypara.fr/payot-hydra24.html",yuka:72,yl:"Bon",usage:"Crème hydratante 24h peaux sèches",texture:"Crème",ak:["Acide hyaluronique","Beurre de karité","Aloe vera"],comp:["Sodium Hyaluronate","Shea Butter","Aloe Vera"],clean:false,vegan:false,pq:"Peaux sèches.",ben:"Hydratation intense 24h.",app:"Matin et soir.",moment:"AM+PM",ben_en:"Intense 24h hydration."},
  "pay-serum-eclat": {nom:"My Payot Sérum Eclat",marque:"Payot",prix:"42€",link:"https://www.easypara.fr/payot-my-payot.html",yuka:74,yl:"Bon",usage:"Sérum illuminateur anti-fatigue",texture:"Sérum",ak:["Vitamine C","Acide hyaluronique","Guarana"],comp:["Ascorbic Acid","Sodium Hyaluronate","Guarana Extract"],clean:false,vegan:false,pq:"Teint terne, peaux fatiguées.",ben:"Illumine et revitalise le teint.",app:"Matin sur peau propre.",moment:"AM",ben_en:"Brightens and revitalizes complexion."},

  // ── TALIKA ───────────────────────────────────────────────────────────────────
  "tal-eye-therapy": {nom:"Eye Therapy Patch",marque:"Talika",prix:"30€",link:"https://www.easypara.fr/talika-eye-therapy.html",yuka:76,yl:"Bon",usage:"Patch contour des yeux anti-cernes",texture:"Patch",ak:["Collagène","Acide hyaluronique","Caféine"],comp:["Collagen","Hyaluronic Acid","Caffeine"],clean:false,vegan:false,pq:"Cernes et poches.",ben:"Réduit poches et cernes en 60 minutes.",app:"Appliquer 60 min, 1-2x par semaine.",moment:"AM+PM",ben_en:"Reduces puffiness and dark circles in 60 minutes."},
  "tal-lash": {nom:"Lipocils Expert",marque:"Talika",prix:"28€",link:"https://www.easypara.fr/talika-lipocils.html",yuka:78,yl:"Bon",usage:"Soin densifiant cils",texture:"Sérum",ak:["Phytosqualane","Extrait de pois","Biotine"],comp:["Phytosqualane","Pea Extract","Biotin"],clean:false,vegan:false,pq:"Cils clairsemés.",ben:"Densifie et allonge les cils.",app:"Soir sur cils propres.",moment:"PM",ben_en:"Densifies and lengthens lashes."},

  // ── CLARINS ──────────────────────────────────────────────────────────────────
  "cla-double-serum": {nom:"Double Serum",marque:"Clarins",prix:"110€",link:"https://www.easypara.fr/clarins-double-serum.html",yuka:68,yl:"Bon",usage:"Sérum anti-âge total",texture:"Sérum bi-phase",ak:["Turmeric","Acide hyaluronique","20 extraits plantes"],comp:["Turmeric Extract","Hyaluronic Acid","Plant Extracts"],clean:false,vegan:false,pq:"Peaux matures.",ben:"Lutte contre tous les signes visibles du vieillissement.",app:"Matin et soir avant la crème.",video:"https://www.youtube.com/results?search_query=Clarins+soin+peau",moment:"AM+PM",ben_en:"Fights all visible signs of aging.",video:"https://www.youtube.com/results?search_query=Clarins+soin+peau"},
  "cla-hydra-essentiel": {nom:"Hydra-Essentiel Crème",marque:"Clarins",prix:"52€",link:"https://www.easypara.fr/clarins-hydra-essentiel.html",yuka:66,yl:"Bon",usage:"Crème hydratante multi-réhydratante",texture:"Crème",ak:["Acide hyaluronique","Extrait de feuille de lotus","Beurre de karité"],comp:["Hyaluronic Acid","Lotus Extract","Shea Butter"],clean:false,vegan:false,pq:"Peaux normales à sèches.",ben:"Réhydrate et lisse la peau.",app:"Matin et soir.",moment:"AM+PM",ben_en:"Rehydrates and smoothes skin.",video:"https://www.youtube.com/results?search_query=Clarins+soin+peau"},
  "cla-multi-active": {nom:"Multi-Active Sérum",marque:"Clarins",prix:"75€",link:"https://www.easypara.fr/clarins-multi-active.html",yuka:65,yl:"Bon",usage:"Sérum anti-âge peaux normales à mixtes",texture:"Sérum",ak:["Teasel","Katafray","Acide hyaluronique"],comp:["Teasel Extract","Katafray","Hyaluronic Acid"],clean:false,vegan:false,pq:"Peaux normales à mixtes.",ben:"Prévient les premières rides.",app:"Matin et soir.",moment:"AM+PM",ben_en:"Prevents first wrinkles."},
  "cla-spf": {nom:"UV Plus SPF50",marque:"Clarins",prix:"48€",link:"https://www.easypara.fr/clarins-uv-plus.html",yuka:62,yl:"Bon",usage:"Fluide protecteur SPF50 anti-pollution",texture:"Fluide",ak:["Filtres UV","Extrait de plante","Acide hyaluronique"],comp:["UV Filters","Plant Extract","Hyaluronic Acid"],clean:false,vegan:false,pq:"Tous types de peau.",ben:"Protège et hydrate.",app:"Le matin.",moment:"AM",ben_en:"Protects and hydrates."},

  // ── VICHY ────────────────────────────────────────────────────────────────────
  "vic-minral89": {nom:"Minéral 89 Sérum",marque:"Vichy",prix:"25€",link:"https://www.easypara.fr/vichy-mineral89.html",yuka:72,yl:"Bon",usage:"Sérum boosteur hydratant quotidien",texture:"Sérum gel",ak:["Eau minérale volcanique","Acide hyaluronique","Niacinamide"],comp:["Vichy Volcanic Water","Sodium Hyaluronate","Niacinamide"],clean:false,vegan:false,pq:"Tous types de peau.",ben:"Renforce la barrière cutanée et hydrate.",app:"Matin et soir sous la crème.",video:"https://www.youtube.com/results?search_query=Vichy+soin+peau",moment:"AM+PM",ben_en:"Strengthens skin barrier and hydrates.",video:"https://www.youtube.com/results?search_query=Vichy+soin+peau"},
  "vic-liftactiv": {nom:"Liftactiv Collagen Specialist",marque:"Vichy",prix:"42€",link:"https://www.easypara.fr/vichy-liftactiv.html",yuka:65,yl:"Bon",usage:"Crème anti-rides fermeté",texture:"Crème",ak:["Collagène","Néohesperidine","Rhamnose"],comp:["Collagen","Neohesperidin","Rhamnose"],clean:false,vegan:false,pq:"Peaux matures.",ben:"Raffermit et réduit les rides.",app:"Matin et soir.",moment:"AM+PM",ben_en:"Firms and reduces wrinkles.",video:"https://www.youtube.com/results?search_query=Vichy+soin+peau"},
  "vic-normaderm": {nom:"Normaderm Phytosolution Gel",marque:"Vichy",prix:"16€",link:"https://www.easypara.fr/vichy-normaderm.html",yuka:68,yl:"Bon",usage:"Gel nettoyant double correction peaux grasses",texture:"Gel",ak:["Acide salicylique","Glycolique","Eau thermale"],comp:["Salicylic Acid","Glycolic Acid","Vichy Thermal Water"],clean:false,vegan:false,pq:"Peaux grasses et acnéiques.",ben:"Nettoie et resserre les pores.",app:"Matin et soir.",video:"https://www.youtube.com/results?search_query=Vichy+soin+peau",moment:"AM+PM",ben_en:"Cleanses and tightens pores.",video:"https://www.youtube.com/results?search_query=Vichy+soin+peau"},
  "vic-capital": {nom:"Capital Soleil Fluide SPF50+",marque:"Vichy",prix:"20€",link:"https://www.easypara.fr/vichy-capital-soleil.html",yuka:60,yl:"Bon",usage:"Protection solaire SPF50+ quotidienne",texture:"Fluide",ak:["Mexoryl SX","Mexoryl XL","Eau thermale"],comp:["Mexoryl SX","Mexoryl XL","Vichy Thermal Water"],clean:false,vegan:false,pq:"Tous types de peau.",ben:"Protection maximale anti-UV.",app:"Le matin.",moment:"AM",ben_en:"Maximum UV protection.",video:"https://www.youtube.com/results?search_query=Vichy+soin+peau"},
  "vic-slow-age": {nom:"Slow Age Crème",marque:"Vichy",prix:"35€",link:"https://www.easypara.fr/vichy-slow-age.html",yuka:67,yl:"Bon",usage:"Crème anti-âge quotidienne SPF30",texture:"Crème fluide",ak:["Probiotiques","Bakuchiol","Eau thermale"],comp:["Probiotics","Bakuchiol","Vichy Thermal Water"],clean:false,vegan:false,pq:"Peaux normales à mixtes.",ben:"Ralentit les signes du vieillissement.",app:"Le matin.",moment:"AM",ben_en:"Slows down signs of aging.",video:"https://www.youtube.com/results?search_query=Vichy+soin+peau"},

  // ── BIOTHERM ─────────────────────────────────────────────────────────────────
  "bio-aquasource": {nom:"Aquasource Sérum",marque:"Biotherm",prix:"55€",link:"https://www.easypara.fr/biotherm-aquasource.html",yuka:70,yl:"Bon",usage:"Sérum hydratant concentré",texture:"Sérum",ak:["Pure Thermal Plankton","Acide hyaluronique"],comp:["Pure Thermal Plankton","Hyaluronic Acid","Glycerin"],clean:false,vegan:false,pq:"Tous types de peau.",ben:"Hydratation concentrée et durée.",app:"Matin et soir.",moment:"AM+PM",ben_en:"Concentrated and lasting hydration."},
  "bio-blue-therapy": {nom:"Blue Therapy Crème",marque:"Biotherm",prix:"65€",link:"https://www.easypara.fr/biotherm-blue-therapy.html",yuka:64,yl:"Bon",usage:"Crème anti-âge accélératrice de réparation",texture:"Crème",ak:["Algue bleue","Acide hyaluronique","Vitamine C"],comp:["Blue Algae Extract","Hyaluronic Acid","Ascorbic Acid"],clean:false,vegan:false,pq:"Peaux matures.",ben:"Accélère la réparation cutanée naturelle.",app:"Matin et soir.",moment:"AM+PM",ben_en:"Accelerates natural skin repair."},
  "bio-life-plankton": {nom:"Life Plankton Elixir",marque:"Biotherm",prix:"75€",link:"https://www.easypara.fr/biotherm-life-plankton.html",yuka:72,yl:"Bon",usage:"Elixir réparateur multi-fonctions",texture:"Huile-sérum",ak:["Life Plankton","Acide hyaluronique"],comp:["Life Plankton Extract","Hyaluronic Acid"],clean:false,vegan:false,pq:"Tous types de peau.",ben:"Régénère et revitalise la peau.",app:"Matin et soir.",moment:"AM+PM",ben_en:"Regenerates and revitalizes skin."},

  // ── LANCÔME ──────────────────────────────────────────────────────────────────
  "lan-advanced-genifique": {nom:"Advanced Génifique Sérum",marque:"Lancôme",prix:"105€",link:"https://www.easypara.fr/lancome-advanced-genifique.html",yuka:62,yl:"Bon",usage:"Sérum anti-âge au microbiome",texture:"Sérum",ak:["Bifidus","Acide hyaluronique","Vitamine CG"],comp:["Bifidus Extract","Hyaluronic Acid","Vitamin CG"],clean:false,vegan:false,pq:"Tous types de peau, peaux matures.",ben:"Renforce le microbiome et lisse la peau.",app:"Matin et soir avant la crème.",moment:"AM+PM",ben_en:"Strengthens microbiome and smoothes skin."},
  "lan-renergie": {nom:"Rénergie H.C.F. Triple Sérum",marque:"Lancôme",prix:"125€",link:"https://www.easypara.fr/lancome-renergie.html",yuka:60,yl:"Bon",usage:"Sérum anti-âge triple action",texture:"Sérum",ak:["Acide hyaluronique","Rétinol","Vitamine C"],comp:["Hyaluronic Acid","Retinol","Ascorbic Acid"],clean:false,vegan:false,pq:"Peaux matures.",ben:"Réduit rides, taches et raffermit.",app:"Soir.",moment:"PM",ben_en:"Reduces wrinkles, spots and firms skin."},
  "lan-absolue": {nom:"Absolue Crème Riche",marque:"Lancôme",prix:"220€",link:"https://www.easypara.fr/lancome-absolue.html",yuka:58,yl:"Médiocre",usage:"Crème anti-âge luxe peaux matures",texture:"Crème riche",ak:["Rose de Lancôme","Grand Rose Extracts"],comp:["Rose de Lancôme Extract","Glycerin","Peptides"],clean:false,vegan:false,pq:"Peaux très matures.",ben:"Repulpe et redensifie intensément.",app:"Matin et soir.",moment:"AM+PM",ben_en:"Intensely replumps and redensifies."},

  // ── NUXE ─────────────────────────────────────────────────────────────────────
  "nux-huile-prodigieuse": {nom:"Huile Prodigieuse",marque:"Nuxe",prix:"30€",link:"https://www.easypara.fr/nuxe-huile-prodigieuse.html",yuka:82,yl:"Excellent",usage:"Huile sèche multi-usages visage corps cheveux",texture:"Huile sèche",ak:["Macadamia","Argan","Camomille","Rose musquée"],comp:["Macadamia Oil","Argan Oil","Chamomile","Rosehip Oil"],clean:false,vegan:false,pq:"Tous types de peau.",ben:"Nourrit et illumine le visage, le corps et les cheveux.",app:"Matin ou soir, quelques gouttes.",video:"https://www.youtube.com/results?search_query=Nuxe+soin+beaute",moment:"AM+PM",ben_en:"Nourishes and illuminates face, body and hair.",video:"https://www.youtube.com/results?search_query=Nuxe+soin+beaute"},
  "nux-reve-de-miel": {nom:"Reve de Miel Baume",marque:"Nuxe",prix:"14€",link:"https://www.easypara.fr/nuxe-reve-de-miel.html",yuka:78,yl:"Bon",usage:"Baume lèvres nourrissant",texture:"Baume",ak:["Miel","Beurre de karité","Cire d'abeille"],comp:["Honey","Shea Butter","Beeswax"],clean:false,vegan:false,pq:"Lèvres sèches.",ben:"Répare et adoucit les lèvres.",app:"Appliquer sur les lèvres.",moment:"AM+PM",ben_en:"Repairs and softens lips."},
  "nux-creme-fraiche": {nom:"Crème Fraîche de Beauté",marque:"Nuxe",prix:"25€",link:"https://www.easypara.fr/nuxe-creme-fraiche.html",yuka:74,yl:"Bon",usage:"Crème hydratante repulpante",texture:"Crème légère",ak:["Acide hyaluronique","Eau de rose","Aloe vera"],comp:["Hyaluronic Acid","Rose Water","Aloe Vera"],clean:false,vegan:false,pq:"Peaux normales à mixtes.",ben:"Repulpe et hydrate durablement.",app:"Matin et soir.",moment:"AM+PM",ben_en:"Replumps and durably hydrates.",video:"https://www.youtube.com/results?search_query=Nuxe+soin+beaute"},
  "nux-merveillance": {nom:"Merveillance Expert Crème",marque:"Nuxe",prix:"48€",link:"https://www.easypara.fr/nuxe-merveillance.html",yuka:70,yl:"Bon",usage:"Crème anti-rides peaux normales à mixtes",texture:"Crème légère",ak:["Figuier","Acide hyaluronique","Rétinol"],comp:["Fig Extract","Hyaluronic Acid","Retinol"],clean:false,vegan:false,pq:"Peaux normales à mixtes matures.",ben:"Lisse les rides et redensifie.",app:"Soir.",moment:"PM",ben_en:"Smoothes wrinkles and redensifies.",video:"https://www.youtube.com/results?search_query=Nuxe+soin+beaute"},

  // ── CAUDALIE ─────────────────────────────────────────────────────────────────
  "cau-vinoperfect": {nom:"Vinoperfect Sérum Eclat",marque:"Caudalie",prix:"59€",link:"https://www.easypara.fr/caudalie-vinoperfect.html",yuka:76,yl:"Bon",usage:"Sérum éclat anti-taches",texture:"Sérum",ak:["Viniférine","Niacinamide","Acide hyaluronique"],comp:["Viniferine","Niacinamide","Hyaluronic Acid"],clean:false,vegan:true,pq:"Peaux avec taches et teint terne.",ben:"Réduit les taches et illumine en 2 semaines.",app:"Matin et soir.",video:"https://www.youtube.com/results?search_query=Caudalie+soin+vinoperfect",moment:"AM+PM",ben_en:"Reduces dark spots and brightens in 2 weeks.",video:"https://www.youtube.com/results?search_query=Caudalie+soin+vinoperfect"},
  "cau-vinosource": {nom:"Vinosource-Hydra Sérum SOS",marque:"Caudalie",prix:"42€",link:"https://www.easypara.fr/caudalie-vinosource.html",yuka:78,yl:"Bon",usage:"Sérum hydratant SOS déshydratation",texture:"Sérum",ak:["Raisin","Polyphénols","Acide hyaluronique"],comp:["Grape Extract","Polyphenols","Hyaluronic Acid"],clean:false,vegan:true,pq:"Peaux déshydratées.",ben:"Hydratation intense SOS.",app:"Matin et soir.",moment:"AM+PM",ben_en:"Intense SOS hydration.",video:"https://www.youtube.com/results?search_query=Caudalie+soin+vinoperfect"},
  "cau-resveratrol": {nom:"Resveratrol Lift Crème",marque:"Caudalie",prix:"78€",link:"https://www.easypara.fr/caudalie-resveratrol.html",yuka:72,yl:"Bon",usage:"Crème anti-âge fermeté et éclat",texture:"Crème",ak:["Resvératrol","Acide hyaluronique","Vigne"],comp:["Resveratrol","Hyaluronic Acid","Vine Extract"],clean:false,vegan:true,pq:"Peaux matures.",ben:"Raffermit et illumine les peaux matures.",app:"Matin et soir.",moment:"AM+PM",ben_en:"Firms and brightens mature skin.",video:"https://www.youtube.com/results?search_query=Caudalie+soin+vinoperfect"},
  "cau-spf": {nom:"Vinosun Protect SPF50+",marque:"Caudalie",prix:"32€",link:"https://www.easypara.fr/caudalie-vinosun.html",yuka:70,yl:"Bon",usage:"Protection solaire SPF50+ anti-taches",texture:"Fluide",ak:["Vigne","Filtres UV","Antioxydants"],comp:["Vine Extract","UV Filters","Antioxidants"],clean:false,vegan:true,pq:"Tous types de peau.",ben:"Protège et prévient les taches.",app:"Le matin.",moment:"AM",ben_en:"Protects and prevents dark spots."},

  // ── LIERAC ───────────────────────────────────────────────────────────────────
  "lie-premium": {nom:"Premium La Crème Soyeuse",marque:"Lierac",prix:"85€",link:"https://www.easypara.fr/lierac-premium.html",yuka:66,yl:"Bon",usage:"Crème anti-âge absolue multi-corrections",texture:"Crème soyeuse",ak:["Mélatonine","Acide hyaluronique","Rétinol"],comp:["Melatonin","Hyaluronic Acid","Retinol"],clean:false,vegan:false,pq:"Peaux matures.",ben:"Corrige toutes les imperfections du vieillissement.",app:"Nuit.",video:"https://www.youtube.com/results?search_query=Lierac+soin+hydratant",moment:"PM",ben_en:"Corrects all aging imperfections."},
  "lie-hydragenist": {nom:"Hydragenist Gel-Crème",marque:"Lierac",prix:"38€",link:"https://www.easypara.fr/lierac-hydragenist.html",yuka:70,yl:"Bon",usage:"Gel-crème hydratant éclat",texture:"Gel-crème",ak:["Acide hyaluronique","OHmégA","Aloe vera"],comp:["Hyaluronic Acid","OHmegA Complex","Aloe Vera"],clean:false,vegan:false,pq:"Peaux normales à mixtes.",ben:"Hydrate et illumine le teint.",app:"Matin et soir.",video:"https://www.youtube.com/results?search_query=Lierac+soin+hydratant",moment:"AM+PM",ben_en:"Hydrates and brightens complexion."},
  "lie-sebologie": {nom:"Sebologie Solution Kératolytique",marque:"Lierac",prix:"28€",link:"https://www.easypara.fr/lierac-sebologie.html",yuka:72,yl:"Bon",usage:"Solution anti-pores et points noirs",texture:"Lotion",ak:["Acide salicylique","Acide glycolique","Zinc"],comp:["Salicylic Acid","Glycolic Acid","Zinc"],clean:false,vegan:false,pq:"Peaux grasses avec pores dilatés.",ben:"Réduit les pores et points noirs.",app:"Soir sur peau propre.",video:"https://www.youtube.com/results?search_query=Lierac+soin+hydratant",moment:"PM",ben_en:"Reduces pores and blackheads."},

  // ── PATYKA ───────────────────────────────────────────────────────────────────
  "pat-absolis": {nom:"Absolis Huile Précieuse",marque:"Patyka",prix:"55€",link:"https://www.easypara.fr/patyka-absolis.html",yuka:90,yl:"Excellent",usage:"Huile de soin anti-âge certifiée bio",texture:"Huile",ak:["Argan","Rose musquée","Jojoba","Tamanu"],comp:["Argan Oil","Rosehip Oil","Jojoba Oil","Tamanu Oil"],clean:true,vegan:true,pq:"Tous types de peau.",ben:"Nourrit et régénère la peau en profondeur.",app:"Soir, quelques gouttes sur visage.",video:"https://www.youtube.com/results?search_query=Patyka+soin+bio",moment:"PM",ben_en:"Nourishes and regenerates skin deeply."},
  "pat-ageless": {nom:"Ageless Sérum Liftant",marque:"Patyka",prix:"85€",link:"https://www.easypara.fr/patyka-ageless.html",yuka:88,yl:"Excellent",usage:"Sérum liftant certifié bio",texture:"Sérum",ak:["Bakuchiol","Acide hyaluronique","Centella asiatica"],comp:["Bakuchiol","Hyaluronic Acid","Centella Asiatica"],clean:true,vegan:true,pq:"Peaux matures.",ben:"Lisse et raffermit naturellement.",app:"Matin et soir.",moment:"AM+PM",ben_en:"Naturally smoothes and firms."},

  // ── GARANCIA ─────────────────────────────────────────────────────────────────
  "gar-potion-magique": {nom:"Potion Magique",marque:"Garancia",prix:"32€",link:"https://www.easypara.fr/garancia-potion-magique.html",yuka:74,yl:"Bon",usage:"Soin anti-pores et anti-brillance",texture:"Gel",ak:["Acide salicylique","Niacinamide","Zinc"],comp:["Salicylic Acid","Niacinamide","Zinc"],clean:false,vegan:false,pq:"Peaux grasses avec pores dilatés.",ben:"Resserre les pores et matifie.",app:"Matin sur les zones T.",moment:"AM",ben_en:"Tightens pores and mattifies."},
  "gar-boum-boum": {nom:"Boum Boum Lait",marque:"Garancia",prix:"35€",link:"https://www.easypara.fr/garancia-boum-boum.html",yuka:76,yl:"Bon",usage:"Lait hydratant repulpant",texture:"Lait",ak:["Acide hyaluronique","Céramides","Aloe vera"],comp:["Hyaluronic Acid","Ceramides","Aloe Vera"],clean:false,vegan:false,pq:"Peaux normales à sèches.",ben:"Repulpe et nourrit la peau.",app:"Matin et soir.",moment:"AM+PM",ben_en:"Replumps and nourishes skin."},

  // ── JONZAC ───────────────────────────────────────────────────────────────────
  "jon-rehydrate": {nom:"Rehydrate Crème Légère",marque:"Jonzac",prix:"18€",link:"https://www.easypara.fr/jonzac-rehydrate.html",yuka:92,yl:"Excellent",usage:"Crème hydratante bio eau thermale",texture:"Crème légère",ak:["Eau thermale de Jonzac","Aloe vera","Acide hyaluronique"],comp:["Jonzac Thermal Water","Aloe Vera","Sodium Hyaluronate"],clean:true,vegan:true,pq:"Peaux normales à mixtes.",ben:"Hydratation légère et durable.",app:"Matin et soir.",moment:"AM+PM",ben_en:"Light and lasting hydration."},
  "jon-pure": {nom:"Pure Gel Nettoyant",marque:"Jonzac",prix:"12€",link:"https://www.easypara.fr/jonzac-pure.html",yuka:90,yl:"Excellent",usage:"Gel nettoyant bio peaux mixtes à grasses",texture:"Gel",ak:["Eau thermale","Zinc","Acide lactique"],comp:["Jonzac Thermal Water","Zinc","Lactic Acid"],clean:true,vegan:true,pq:"Peaux mixtes à grasses.",ben:"Nettoie et équilibre la peau.",app:"Matin et soir.",moment:"AM+PM",ben_en:"Cleanses and balances skin."},
  "jon-nutritive": {nom:"Nutritive Crème Riche",marque:"Jonzac",prix:"20€",link:"https://www.easypara.fr/jonzac-nutritive.html",yuka:91,yl:"Excellent",usage:"Crème nourrissante bio peaux sèches",texture:"Crème riche",ak:["Eau thermale","Beurre de karité","Huile de jojoba"],comp:["Jonzac Thermal Water","Shea Butter","Jojoba Oil"],clean:true,vegan:true,pq:"Peaux sèches à très sèches.",ben:"Nourrit et répare les peaux sèches.",app:"Matin et soir.",moment:"AM+PM",ben_en:"Nourishes and repairs dry skin."},

  // ── TOPICREME ────────────────────────────────────────────────────────────────
  "top-base": {nom:"Base Universelle Topicreme",marque:"Topicreme",prix:"16€",link:"https://www.easypara.fr/topicreme.html",yuka:85,yl:"Excellent",usage:"Base hydratante protectrice universelle",texture:"Crème",ak:["Glycérine","Urée","Allantoïne"],comp:["Glycerin","Urea","Allantoin"],clean:false,vegan:false,pq:"Tous types de peau, peaux sensibles.",ben:"Hydrate et protège la peau toute la journée.",app:"Matin et soir.",moment:"AM+PM",ben_en:"Hydrates and protects skin all day."},
  "top-soin-mains": {nom:"Soin Mains Topicreme",marque:"Topicreme",prix:"12€",link:"https://www.easypara.fr/topicreme-mains.html",yuka:83,yl:"Excellent",usage:"Crème mains nourrissante",texture:"Crème",ak:["Glycérine","Urée 5%","Allantoïne"],comp:["Glycerin","Urea 5%","Allantoin"],clean:false,vegan:false,pq:"Mains sèches.",ben:"Nourrit et protège les mains.",app:"Après chaque lavage.",moment:"AM+PM",ben_en:"Nourishes and protects hands."},

  // ── ISISPHARMA ───────────────────────────────────────────────────────────────
  "isis-uveblock": {nom:"Uveblock SPF50+",marque:"Isis Pharma",prix:"22€",link:"https://www.easypara.fr/isispharma-uveblock.html",yuka:70,yl:"Bon",usage:"Protection solaire SPF50+ peaux sensibles",texture:"Crème fluide",ak:["Filtres UV","Tinosorb M","Antioxydants"],comp:["Tinosorb M","Tinosorb S","Antioxidants"],clean:false,vegan:false,pq:"Peaux sensibles et intolérantes.",ben:"Protection maximale sans irritation.",app:"Le matin.",moment:"AM",ben_en:"Maximum protection without irritation."},
  "isis-yday": {nom:"Yday Crème Hydratante",marque:"Isis Pharma",prix:"18€",link:"https://www.easypara.fr/isispharma-daytime.html",yuka:72,yl:"Bon",usage:"Crème hydratante quotidienne peaux normales",texture:"Crème légère",ak:["Acide hyaluronique","Niacinamide","Aquaxyl"],comp:["Hyaluronic Acid","Niacinamide","Aquaxyl"],clean:false,vegan:false,pq:"Peaux normales.",ben:"Hydrate et lisse le grain de peau.",app:"Matin.",moment:"AM",ben_en:"Hydrates and smoothes skin texture."},
  "isis-teinte": {nom:"Uveblock BB Crème SPF50+",marque:"Isis Pharma",prix:"24€",link:"https://www.easypara.fr/isispharma-uveblock-teinte.html",yuka:68,yl:"Bon",usage:"BB crème protectrice SPF50+",texture:"BB crème",ak:["Filtres UV","Pigments minéraux","Antioxydants"],comp:["UV Filters","Mineral Pigments","Antioxidants"],clean:false,vegan:false,pq:"Tous types de peau.",ben:"Protège et unifie le teint.",app:"Le matin.",moment:"AM",ben_en:"Protects and evens complexion."},

  // ── SOSKIN ───────────────────────────────────────────────────────────────────
  "sos-hydra": {nom:"Hydra+ Crème Hydratante",marque:"Soskin",prix:"32€",link:"https://www.easypara.fr/soskin.html",yuka:74,yl:"Bon",usage:"Crème hydratante intensive",texture:"Crème",ak:["Acide hyaluronique","Urée","Aloe vera"],comp:["Hyaluronic Acid","Urea","Aloe Vera"],clean:false,vegan:false,pq:"Peaux sèches.",ben:"Hydratation intense et durable.",app:"Matin et soir.",moment:"AM+PM",ben_en:"Intense and lasting hydration."},
  "sos-protect": {nom:"Protect B SPF50+",marque:"Soskin",prix:"26€",link:"https://www.easypara.fr/soskin-protect.html",yuka:68,yl:"Bon",usage:"Protection solaire SPF50+",texture:"Crème fluide",ak:["Filtres UV","Vitamine E","Acide hyaluronique"],comp:["UV Filters","Vitamin E","Hyaluronic Acid"],clean:false,vegan:false,pq:"Tous types de peau.",ben:"Protection et hydratation combinées.",app:"Le matin.",moment:"AM",ben_en:"Combined protection and hydration."},

  // ── ONAGRINE ─────────────────────────────────────────────────────────────────
  "ona-soin-quotidien": {nom:"Soin Quotidien Visage",marque:"Onagrine",prix:"24€",link:"https://www.easypara.fr/onagrine.html",yuka:84,yl:"Excellent",usage:"Soin visage quotidien à l'huile d'onagre",texture:"Crème",ak:["Huile d'onagre","Acide hyaluronique","Vitamine E"],comp:["Evening Primrose Oil","Hyaluronic Acid","Vitamin E"],clean:false,vegan:true,pq:"Peaux normales à sèches.",ben:"Nourrit et redensifie la peau.",app:"Matin et soir.",moment:"AM+PM",ben_en:"Nourishes and redensifies skin."},
  "ona-huile": {nom:"Huile d'Onagre Pure",marque:"Onagrine",prix:"18€",link:"https://www.easypara.fr/onagrine-huile.html",yuka:86,yl:"Excellent",usage:"Huile végétale pure d'onagre",texture:"Huile",ak:["Huile d'onagre","Oméga 6","Gamma-linolénique"],comp:["Evening Primrose Oil","Omega 6","GLA"],clean:true,vegan:true,pq:"Peaux sèches et matures.",ben:"Régénère et assouplit la peau.",app:"Soir quelques gouttes.",moment:"PM",ben_en:"Regenerates and softens skin."}

};

// ─── ROUTING ──────────────────────────────────────────────────────────────────
const ROUTE = {
  net:{
    seche:   {low:"av-lait",    mid:"uri-eau-thermale", high:"cs-mousse"},
    grasse:  {low:"cv-gel",     mid:"vic-normaderm",    high:"lrp-effgel"},
    mixte:   {low:"svr-sebiaclear",mid:"bd-sebgel",     high:"lrp-effgel"},
    sensible:{low:"bd-sens",    mid:"ader-dermalibour",  high:"cs-mousse"},
    normale: {low:"cv-mou",     mid:"bd-sens",          high:"cs-mousse"},
  },
  hyd:{
    seche:   {low:"euc-urearepair", mid:"ader-epitheliale", high:"skc-age"},
    grasse:  {low:"lrp-effduo",    mid:"svr-hydra",        high:"cs-crev"},
    mixte:   {low:"cv-crem",       mid:"lie-hydragenist",  high:"skc-met"},
    sensible:{low:"lrp-cica",      mid:"uri-roseliane",    high:"skc-phy"},
    normale: {low:"cv-crem",       mid:"nux-creme-fraiche",high:"skc-met"},
  },
  ser:{
    acne:          {low:"ng-bha",      mid:"lrp-effduo",   high:"cs-skin2"},
    taches:        {low:"cv-vitc",     mid:"cau-vinoperfect",high:"skc-dis"},
    rides:         {low:"cv-ret",      mid:"vic-liftactiv", high:"lan-renergie"},
    eclat:         {low:"pay-serum-eclat",mid:"cs-culte",   high:"skc-cef"},
    deshydratation:{low:"lrp-hyalu",   mid:"vic-minral89",  high:"skc-ha"},
    rougeurs:      {low:"lrp-cica",    mid:"uri-roseliane", high:"skc-phy"},
    pores:         {low:"lie-sebologie",mid:"bd-sebser",    high:"skc-bl"},
    imperfections: {low:"gar-potion-magique",mid:"bd-sebser",high:"skc-sil"},
    sensibilite:   {low:"lrp-cica",    mid:"av-tol",        high:"cs-bleu"},
    cernes:        {low:"cv-eye",      mid:"tal-eye-therapy",high:"cs-eye"},
  },
  spf:{low:"ng-spf",mid:"lrp-anth",high:"cla-spf"}
};
