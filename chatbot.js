/* ImmobilierEnCrete.fr — chatbot de qualification (boutons uniquement, pas d'IA générative).
   Oriente le visiteur vers Visite Proxy / Installation Facilitée / Guide / Simulateur,
   puis termine vers WhatsApp (pré-rempli) ou le formulaire de contact (objet pré-sélectionné). */
(function () {
  var WHATSAPP_NUMBER = '306955717183';

  function waLink(message) {
    return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);
  }
  function formLink(objet) {
    // contact.html is present in the nav of every page; ?objet= is read by site.js
    // to pre-select the dropdown and scroll the form into view.
    return 'contact.html?objet=' + encodeURIComponent(objet);
  }

  function endOptions(objet, waMessage) {
    return [
      { label: 'Continuer sur WhatsApp', action: 'link', href: waLink(waMessage), style: 'wa' },
      { label: 'Remplir le formulaire', action: 'link', href: formLink(objet), style: 'primary' }
    ];
  }

  var SCREENS = {
    start: {
      title: 'Bonjour 👋',
      text: "Dites-moi où vous en êtes, je vous oriente en quelques secondes.",
      options: [
        { label: "J'ai un bien en tête à faire vérifier", next: 'zone' },
        { label: 'Je cherche encore, je veux estimer mon budget', next: 'budget' },
        { label: 'Je suis déjà propriétaire, je veux m\u2019installer', next: 'installation' },
        { label: 'Une question rapide', next: 'faq' }
      ]
    },
    zone: {
      title: 'Le bien se trouve dans quelle zone ?',
      back: 'start',
      options: [
        { label: 'Chania, Akrotiri, Souda ou Stavros', next: 'zoneCoeur' },
        { label: 'Apokoronas, Kalyves, Almyrida, Platanias ou Kissamos', next: 'zoneEtendue' },
        { label: 'Réthymnon', next: 'zoneRethymnon' },
        { label: 'Héraklion ou plus à l\u2019est', next: 'zoneDevis' }
      ]
    },
    zoneCoeur: {
      title: 'Zone Cœur — 399€ TTC',
      text: 'Offre de lancement en cours : 299€ TTC jusqu\'au 30 septembre 2026 (formule Essentiel). Vous envoyez l\u2019annonce, un rapport terrain (accès, environnement, points de vigilance) vous est livré sous 48h.',
      back: 'start',
      options: endOptions('Visite Proxy', 'Bonjour, j\u2019ai un bien à Chania/Akrotiri/Souda/Stavros à faire vérifier (Visite Proxy).')
    },
    zoneEtendue: {
      title: 'Zone Étendue — 449€ TTC',
      text: 'Vous envoyez l\u2019annonce, un rapport terrain (accès, environnement, points de vigilance) vous est livré sous 48h.',
      back: 'start',
      options: endOptions('Visite Proxy', 'Bonjour, j\u2019ai un bien en zone Étendue (Apokoronas/Kalyves/Platanias/Kissamos...) à faire vérifier (Visite Proxy).')
    },
    zoneRethymnon: {
      title: 'Réthymnon — 499€ TTC',
      text: 'Vous envoyez l\u2019annonce, un rapport terrain (accès, environnement, points de vigilance) vous est livré sous 48h.',
      back: 'start',
      options: endOptions('Visite Proxy', 'Bonjour, j\u2019ai un bien à Réthymnon à faire vérifier (Visite Proxy).')
    },
    zoneDevis: {
      title: 'Héraklion et au-delà',
      text: 'Zone hors périmètre habituel : envoyez l\u2019annonce, la faisabilité et le tarif sont étudiés au cas par cas, sur devis.',
      back: 'start',
      options: endOptions('Visite Proxy', 'Bonjour, j\u2019ai un bien du côté d\u2019Héraklion / l\u2019est de la Crète — est-ce faisable sur devis ?')
    },
    budget: {
      title: 'Estimer votre budget réel',
      text: 'Le simulateur gratuit calcule frais d\u2019acquisition et marge de sécurité en quelques secondes. Le Guide "Acheter en Crète" (9€) détaille aussi les étapes et pièges à éviter.',
      back: 'start',
      options: [
        { label: 'Ouvrir le simulateur', action: 'link', href: 'simulateur.html', style: 'primary' },
        { label: 'Voir le Guide (9€)', action: 'link', href: 'index.html#guide', style: 'ghost' }
      ]
    },
    installation: {
      title: 'Installation Facilitée — 349€ TTC',
      text: 'AFM, ouverture de compte, AMKA/EFKA, traductions : préparez votre dossier avant l\u2019arrivée et soyez mis en relation avec des professionnels indépendants, francophones quand c\u2019est possible.',
      back: 'start',
      options: endOptions('Pack Installation', 'Bonjour, je suis propriétaire en Crète et je souhaite préparer mon installation (AFM, banque, AMKA...).')
    },
    faq: {
      title: 'Une question rapide',
      back: 'start',
      options: [
        { label: 'Combien coûte une Visite Proxy ?', next: 'faqPrix' },
        { label: 'Dans quelles zones intervenez-vous ?', next: 'faqZones' },
        { label: 'Sous quel délai je reçois le rapport ?', next: 'faqDelai' },
        { label: 'Êtes-vous une agence immobilière ?', next: 'faqAgence' }
      ]
    },
    faqPrix: {
      title: 'Tarifs Visite Proxy',
      text: '399€ TTC en zone Cœur (299€ pendant l\'offre de lancement, jusqu\'au 30/09/2026), 449€ TTC en zone Étendue, 499€ TTC à Réthymnon, option drone +49€ TTC. Au-delà : sur devis.',
      back: 'faq',
      options: [{ label: 'Voir le détail complet', action: 'link', href: 'visite-proxy.html', style: 'primary' }]
    },
    faqZones: {
      title: 'Zones desservies',
      text: 'Intervention directe à Chania et dans tout l\u2019ouest de la Crète, jusqu\u2019à Réthymnon. Héraklion, le sud de la Crète ou plus loin vers l\u2019est : étudié au cas par cas, sur devis.',
      back: 'faq',
      options: [{ label: 'Voir toutes les zones', action: 'link', href: 'index.html#zones', style: 'primary' }]
    },
    faqDelai: {
      title: 'Délai du rapport',
      text: 'La visite terrain dure 60 à 75 minutes ; le rapport PDF structuré, avec photos et vidéos, est livré sous 48h.',
      back: 'faq',
      options: [{ label: 'Voir le détail de la Visite Proxy', action: 'link', href: 'visite-proxy.html', style: 'primary' }]
    },
    faqAgence: {
      title: 'Pas une agence immobilière',
      text: 'ImmobilierEnCrete.fr ne vend aucun bien et ne perçoit aucune commission de vente. Le service est un reporting terrain indépendant, une aide à la décision et une coordination acheteur — vous gardez toujours la décision finale.',
      back: 'faq',
      options: [{ label: 'En savoir plus', action: 'link', href: 'about.html', style: 'primary' }]
    }
  };

  var STYLE = '\n    #cb-root *{box-sizing:border-box;font-family:var(--fs,\'Plus Jakarta Sans\',-apple-system,BlinkMacSystemFont,sans-serif);}\n    #cb-fab{position:fixed;right:22px;bottom:86px;z-index:195;width:56px;height:56px;border-radius:50%;background:var(--blue,#1B547E);display:flex;align-items:center;justify-content:center;box-shadow:0 14px 30px -10px rgba(27,84,126,.55);border:none;cursor:pointer;transition:transform .18s ease;}\n    #cb-fab:hover{transform:translateY(-2px);}\n    #cb-fab svg{width:26px;height:26px;}\n    #cb-fab .cb-dot{position:absolute;top:-2px;right:-2px;width:14px;height:14px;border-radius:50%;background:var(--green,#1E9E6D);border:2px solid #fff;}\n    @media (max-width:900px){ #cb-fab{right:16px;bottom:160px;width:46px;height:46px;} #cb-fab svg{width:20px;height:20px;} }\n    @media (max-width:700px){ #cb-fab{display:none;} }\n    #cb-panel{position:fixed;right:22px;bottom:154px;z-index:195;width:340px;max-width:calc(100vw - 32px);max-height:min(560px,calc(100vh - 190px));background:#fff;border-radius:20px;box-shadow:0 30px 70px -20px rgba(15,27,36,.35);border:1px solid var(--border,#E4E9ED);display:none;flex-direction:column;overflow:hidden;}\n    #cb-panel.open{display:flex;}\n    @media (max-width:900px){ #cb-panel{right:16px;left:16px;width:auto;bottom:214px;max-height:min(60vh,460px);} }\n    #cb-head{background:var(--blue,#1B547E);color:#fff;padding:16px 18px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}\n    #cb-head-t{font-size:14.5px;font-weight:800;}\n    #cb-head-s{font-size:11.5px;color:rgba(255,255,255,.8);margin-top:2px;}\n    #cb-close{background:rgba(255,255,255,.16);border:none;width:28px;height:28px;border-radius:50%;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;}\n    #cb-body{padding:18px;overflow-y:auto;flex:1;}\n    #cb-title{font-size:15.5px;font-weight:800;color:var(--ink,#0F1B24);margin-bottom:6px;line-height:1.35;}\n    #cb-text{font-size:13px;color:var(--muted,#5B6672);line-height:1.6;margin-bottom:14px;}\n    #cb-opts{display:flex;flex-direction:column;gap:8px;}\n    .cb-opt{text-align:left;border-radius:12px;border:1.5px solid var(--border,#E4E9ED);background:#fff;color:var(--ink,#0F1B24);font-size:13px;font-weight:700;padding:11px 14px;cursor:pointer;transition:border-color .15s,background .15s;text-decoration:none;display:block;}\n    .cb-opt:hover{border-color:var(--blue,#1B547E);background:var(--bg-soft,#F6F8FA);}\n    .cb-opt.primary{background:var(--blue,#1B547E);border-color:var(--blue,#1B547E);color:#fff;}\n    .cb-opt.primary:hover{background:var(--blue-l,#2E86C1);border-color:var(--blue-l,#2E86C1);}\n    .cb-opt.wa{background:#25D366;border-color:#25D366;color:#fff;}\n    .cb-opt.wa:hover{background:#20BD5A;border-color:#20BD5A;}\n    #cb-back{background:none;border:none;color:var(--muted2,#7A8390);font-size:12px;font-weight:700;cursor:pointer;padding:0 0 12px;display:flex;align-items:center;gap:4px;}\n  ';

  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) { if (k === 'text') e.textContent = attrs[k]; else e.setAttribute(k, attrs[k]); }
    (children || []).forEach(function (c) { if (c) e.appendChild(c); });
    return e;
  }

  var history = ['start'];

  function render(screenKey) {
    var s = SCREENS[screenKey];
    var body = document.getElementById('cb-body');
    body.innerHTML = '';
    if (s.back) {
      var back = el('button', { id: 'cb-back' });
      back.innerHTML = '← Retour';
      back.addEventListener('click', function () {
        history.pop();
        render(history[history.length - 1] || 'start');
      });
      body.appendChild(back);
    }
    body.appendChild(el('div', { id: 'cb-title', text: s.title }));
    if (s.text) body.appendChild(el('div', { id: 'cb-text', text: s.text }));
    var opts = el('div', { id: 'cb-opts' });
    s.options.forEach(function (o) {
      var node;
      if (o.action === 'link') {
        node = el('a', { href: o.href, class: 'cb-opt ' + (o.style || ''), text: o.label });
        if (o.href.indexOf('http') === 0) node.setAttribute('target', '_blank');
        node.addEventListener('click', function () { trackChat(screenKey, o.label); });
      } else {
        node = el('button', { class: 'cb-opt', text: o.label });
        node.addEventListener('click', function () {
          trackChat(screenKey, o.label);
          history.push(o.next);
          render(o.next);
        });
      }
      opts.appendChild(node);
    });
    body.appendChild(opts);
  }

  function trackChat(from, label) {
    if (typeof gtag === 'function') { gtag('event', 'chatbot_step', { from: from, choice: label, page: location.pathname }); }
  }

  function init() {
    var style = document.createElement('style');
    style.textContent = STYLE;
    document.head.appendChild(style);

    var root = el('div', { id: 'cb-root' });
    var fab = el('button', { id: 'cb-fab', 'aria-label': 'Ouvrir l\u2019assistant' });
    fab.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><path d="M4 5.5A2.5 2.5 0 016.5 3h11A2.5 2.5 0 0120 5.5v8A2.5 2.5 0 0117.5 16H10l-4.5 4v-4h-1A2.5 2.5 0 012 13.5v-8z" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/></svg><span class="cb-dot"></span>';

    var panel = el('div', { id: 'cb-panel' });
    var head = el('div', { id: 'cb-head' }, [
      el('div', {}, [el('div', { id: 'cb-head-t', text: 'Assistant ImmobilierEnCrete.fr' }), el('div', { id: 'cb-head-s', text: 'Réponse en quelques secondes' })])
    ]);
    var close = el('button', { id: 'cb-close', 'aria-label': 'Fermer' });
    close.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>';
    head.appendChild(close);
    panel.appendChild(head);
    panel.appendChild(el('div', { id: 'cb-body' }));

    root.appendChild(fab);
    root.appendChild(panel);
    document.body.appendChild(root);

    fab.addEventListener('click', function () {
      var isOpen = panel.classList.toggle('open');
      if (isOpen) {
        trackChat('fab', 'open');
        if (history.length === 1) render('start');
      }
    });
    close.addEventListener('click', function () { panel.classList.remove('open'); });
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
})();
