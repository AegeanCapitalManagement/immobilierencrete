// Shared behaviour for ImmobilierEnCrete.fr subpages (visite-proxy, pack-installation,
// simulateur, exemple-rapport, zones/*). The homepage keeps its own inline copy.

// ---------- Offre de lancement — échéance calendaire (source unique) ----------
// Remplace l'ancien compteur de "places restantes" (invérifiable, donc trompeur) par
// une date de fin réelle : simple à honorer, pas de stock à suivre manuellement.
// Changez UNIQUEMENT cette date pour prolonger ou arrêter l'offre — passé cette date,
// tous les éléments marqués data-launch (bandeau, badges, CTA) disparaissent
// automatiquement sur TOUTES les pages.
var LAUNCH_OFFER_DEADLINE = new Date('2026-08-31T23:59:59+03:00');
var LAUNCH_OFFER_ACTIVE = new Date() < LAUNCH_OFFER_DEADLINE;
if (!LAUNCH_OFFER_ACTIVE){
  document.querySelectorAll('[data-launch]').forEach(function(el){ el.remove(); });
  document.querySelectorAll('.tier-price-fallback').forEach(function(el){ el.style.display = ''; });
} else {
  var LAUNCH_DEADLINE_LABEL = LAUNCH_OFFER_DEADLINE.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  document.querySelectorAll('[data-launch-deadline]').forEach(function(el){ el.textContent = LAUNCH_DEADLINE_LABEL; });
}

// ---------- Paiement direct — Stripe Payment Links ----------
// Remplacez chaque valeur par le Payment Link Stripe correspondant (Stripe
// Dashboard > Payment Links). Tant qu'une valeur commence par "REPLACE_", le
// bouton continue de renvoyer vers le formulaire de contact (aucune rupture
// de parcours en attendant les liens réels). Une fois le lien renseigné, TOUS
// les boutons portant ce data-cta-intent, sur TOUTES les pages, pointent
// directement vers Stripe.
var STRIPE_PAYMENT_LINKS = {
  'Guide Acheter en Crète': 'REPLACE_STRIPE_LINK_GUIDE',
  'Crète Insider': 'REPLACE_STRIPE_LINK_INSIDER'
};
document.querySelectorAll('[data-cta-intent]').forEach(function(el){
  var intent = el.getAttribute('data-cta-intent');
  var link = STRIPE_PAYMENT_LINKS[intent];
  if (link && link.indexOf('REPLACE_') !== 0){
    el.setAttribute('href', link);
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
    el.setAttribute('data-stripe-wired', '1');
  }
});

// ---------- Header/sticky CTA alternator ----------
// Rotates the primary CTA (header, mobile nav, sticky bar) between the two
// flagship offers so Installation Facilitée gets equal top-of-page visibility
// alongside Visite Proxy / Tarif de Lancement. Only runs while the launch
// offer is active (those buttons carry data-launch and get removed above
// once it ends — nothing left to rotate at that point).
(function(){
  var rotators = document.querySelectorAll('.cta-rotate');
  if (!rotators.length) return;
  var states = LAUNCH_OFFER_ACTIVE ? [
    { href: '#tarif-lancement', label: '🚀 Offre de lancement — 299€', intent: 'Offre de lancement' },
    { href: '#installation', label: 'Installation Facilitée — 349€ TTC', intent: 'Installation Facilitée' }
  ] : [
    { href: '#visite-proxy', label: 'Envoyer le lien du bien', intent: 'Visite Proxy' },
    { href: '#installation', label: 'Installation Facilitée — 349€ TTC', intent: 'Installation Facilitée' }
  ];
  var i = 0;
  function apply(){
    var s = states[i];
    rotators.forEach(function(el){
      el.style.opacity = '0';
      setTimeout(function(){
        el.setAttribute('href', s.href);
        el.setAttribute('data-cta-intent', s.intent);
        var label = el.querySelector('.cta-label');
        if (label){ label.textContent = s.label; }
        el.style.opacity = '1';
      }, 200);
    });
  }
  setInterval(function(){ i = (i + 1) % states.length; apply(); }, 6000);
})();

// ---------- Google Analytics 4 — événements clés ----------
// Envoie un événement gtag si GA est chargé (silencieux sinon), pour suivre
// clics WhatsApp, intentions de CTA et soumissions de formulaire par page/zone.
function trackEvent(name, params){
  if (typeof gtag === 'function'){ gtag('event', name, params || {}); }
}
document.querySelectorAll('[data-cta-intent]').forEach(function(el){
  el.addEventListener('click', function(){
    trackEvent('cta_click', { intent: this.getAttribute('data-cta-intent'), page: location.pathname });
  });
});
document.querySelectorAll('#waHeaderBtn, #waStickyBtn, #waMobileLink, #waFab').forEach(function(el){
  el.addEventListener('click', function(){ trackEvent('whatsapp_click', { page: location.pathname }); });
});

// header shadow on scroll + sticky mobile CTA reveal
var header = document.getElementById('header');
var stickyCta = document.getElementById('stickyCta');
var heroEl = document.querySelector('.hero');
var backToTop = document.getElementById('backToTop');
if (backToTop){
  backToTop.addEventListener('click', function(){
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
window.addEventListener('scroll', function(){
  if (header) header.classList.toggle('scrolled', window.scrollY > 8);
  if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 700);
  if (stickyCta && heroEl){
    var pastHero = window.scrollY > heroEl.offsetHeight * 0.6;
    stickyCta.classList.toggle('visible', pastHero);
  }
});

// mobile menu toggle
var menuBtn = document.getElementById('menuBtn');
var mobileNav = document.getElementById('mobileNav');
if (menuBtn && mobileNav){
  menuBtn.addEventListener('click', function(){
    var open = mobileNav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  mobileNav.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){
      mobileNav.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

// scroll reveal (with safety fallback so content is never stuck hidden)
var els = document.querySelectorAll('.reveal');
function revealAll(){ els.forEach(function(el){ el.classList.add('in'); }); }
if ('IntersectionObserver' in window){
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, {threshold:0, rootMargin:'0px 0px -10% 0px'});
  els.forEach(function(el){ io.observe(el); });
} else {
  revealAll();
}
window.addEventListener('load', function(){ setTimeout(revealAll, 900); });
setTimeout(revealAll, 2500);

// pre-select the contact form's "objet" field based on which CTA was clicked
var objetSelect = document.getElementById('contact-objet');
document.querySelectorAll('[data-cta-intent]').forEach(function(el){
  el.addEventListener('click', function(){
    if (objetSelect){ objetSelect.value = this.getAttribute('data-cta-intent'); }
  });
});

// pre-select + scroll to the "objet" field when arriving via ?objet=... (used by chatbot.js)
(function(){
  var params = new URLSearchParams(location.search);
  var objet = params.get('objet');
  if (objet && objetSelect){
    var matched = Array.prototype.some.call(objetSelect.options, function(opt){ return opt.value === objet; });
    if (matched){ objetSelect.value = objet; }
    window.addEventListener('load', function(){
      setTimeout(function(){
        objetSelect.scrollIntoView({ block: 'center' });
        objetSelect.style.outline = '2px solid var(--blue, #1B547E)';
        objetSelect.style.outlineOffset = '2px';
      }, 300);
    });
  }
})();

// Contact form backend via FormSubmit.co — no signup, no API key.
// First submission triggers a one-time confirmation e-mail to the destination address below;
// clicking the link in that e-mail (once) activates the form permanently. Every submission after that just works.
var FORM_DESTINATION_EMAIL = 'contact@immobilierencrete.fr';

function sendToFormSubmit(payload){
  return fetch('https://formsubmit.co/ajax/' + encodeURIComponent(FORM_DESTINATION_EMAIL), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload)
  }).then(function(r){ return r.json(); });
}

// contact form: sends via FormSubmit.co, falls back to a pre-filled mailto if the request fails
var contactForm = document.getElementById('contact-form');
if (contactForm){
  contactForm.addEventListener('submit', function(e){
    e.preventDefault();
    var data = new FormData(contactForm);
    // Anti-spam honeypot: bots fill hidden fields, humans never see them.
    if (data.get('_hp_website')){ return; }
    var subject = 'Demande ImmobilierEnCrete.fr \u2014 ' + (data.get('objet') || 'Contact');
    var lines = [
      'Nom : ' + (data.get('nom') || ''),
      'E-mail : ' + (data.get('email') || ''),
      'T\u00e9l\u00e9phone : ' + (data.get('telephone') || '\u2014'),
      'Objet : ' + (data.get('objet') || ''),
      'Lien annonce : ' + (data.get('url') || '\u2014')
    ];
    if (data.has('ville')) lines.push('Ville / village du bien : ' + (data.get('ville') || '\u2014'));
    if (data.has('secteur')) lines.push('Secteur : ' + (data.get('secteur') || '\u2014'));
    if (data.has('source')) lines.push('Agence ou propri\u00e9taire direct : ' + (data.get('source') || '\u2014'));
    lines.push('', 'Message :', (data.get('message') || '\u2014'));
    var submitBtn = contactForm.querySelector('.contact-submit');
    var confirmEl = document.getElementById('contact-confirm');

    function fallbackError(){
      if (confirmEl){
        confirmEl.textContent = 'Une erreur est survenue lors de l\u2019envoi. R\u00e9essayez, ou \u00e9crivez-nous directement sur WhatsApp.';
        confirmEl.style.color = '#B3261E';
        confirmEl.hidden = false;
      }
    }

    if (submitBtn){ submitBtn.disabled = true; }
    sendToFormSubmit({
      _subject: subject,
      name: data.get('nom') || 'Visiteur ImmobilierEnCrete.fr',
      email: data.get('email') || '',
      message: lines.join('\n')
    }).then(function(res){
      if (submitBtn){ submitBtn.disabled = false; }
      if (res && res.success){
        if (confirmEl){
          confirmEl.style.color = '';
          confirmEl.textContent = 'Merci, votre demande a bien été envoyée. Réponse en français sous 48h ouvrées.';
          confirmEl.hidden = false;
        }
        trackEvent('lead_submit', { intent: data.get('objet') || 'Contact', page: location.pathname });
        contactForm.reset();
      } else {
        fallbackError();
      }
    }).catch(function(){
      if (submitBtn){ submitBtn.disabled = false; }
      fallbackError();
    });
  });
}

// ---------- Checkbox l\u00e9gale obligatoire avant paiement (droit de r\u00e9tractation) ----------
// Inject\u00e9e automatiquement avant CHAQUE bouton .contact-submit, sur toutes les pages :
// une seule source de v\u00e9rit\u00e9 pour ce texte, pas besoin d'\u00e9diter chaque formulaire.
document.querySelectorAll('.contact-submit').forEach(function(btn){
  if (btn.dataset.retractAdded) return;
  btn.dataset.retractAdded = '1';
  var id = 'retract-' + Math.random().toString(36).slice(2);
  var field = document.createElement('div');
  field.className = 'field full retract-field';
  field.style.cssText = 'display:flex;gap:10px;align-items:flex-start;margin:2px 0 4px;';
  field.innerHTML = '<input type="checkbox" required id="' + id + '" style="margin-top:3px;flex-shrink:0;width:16px;height:16px;">' +
    '<label for="' + id + '" style="font-size:12.5px;color:var(--muted);line-height:1.6;font-weight:500;">Je demande express\u00e9ment que l\u2019ex\u00e9cution de la prestation commence avant la fin du d\u00e9lai l\u00e9gal de r\u00e9tractation. Je reconnais qu\u2019en cas d\u2019ex\u00e9cution compl\u00e8te de la prestation, je perds mon droit de r\u00e9tractation conform\u00e9ment aux r\u00e8gles applicables.</label>';
  btn.parentElement.insertBefore(field, btn);
});

// ---------- Formulaires "lead magnet" g\u00e9n\u00e9riques (exemple de rapport, newsletter...) ----------
document.querySelectorAll('form[data-lead]').forEach(function(form){
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var emailInput = form.querySelector('input[type="email"]');
    var email = emailInput ? emailInput.value : '';
    var lead = form.getAttribute('data-lead');
    var note = form.parentElement.querySelector('.lead-note');
    var btn = form.querySelector('button');
    if (btn) btn.disabled = true;
    sendToFormSubmit({
      _subject: 'ImmobilierEnCrete.fr \u2014 demande : ' + lead,
      name: 'Lead magnet (' + lead + ')',
      email: email,
      message: 'Demande de : ' + lead + ' | E-mail : ' + email + ' | Page : ' + location.pathname
    }).then(function(res){
      if (btn) btn.disabled = false;
      if (note){ note.textContent = res && res.success ? 'Merci ! Vous recevrez cela par e-mail sous peu.' : 'Bien re\u00e7u \u2014 nous revenons vers vous par e-mail.'; }
      form.reset();
      trackEvent('lead_magnet_submit', { lead: lead, page: location.pathname });
    }).catch(function(){
      if (btn) btn.disabled = false;
      if (note){ note.textContent = 'Une erreur est survenue — réessayez, ou écrivez-nous sur WhatsApp.'; note.style.color = '#B3261E'; }
    });
  });
});


// ---------- Popup exit-intent (Guide Acheter en Cr\u00e8te 9\u20ac) ----------
(function(){
  if (sessionStorage.getItem('exitPopupShown')) return;
  var shown = false;
  function show(){
    if (shown) return;
    shown = true;
    sessionStorage.setItem('exitPopupShown', '1');
    var overlay = document.createElement('div');
    overlay.id = 'exitPopupOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(13,36,56,.55);z-index:500;display:flex;align-items:center;justify-content:center;padding:20px;';
    var guideHref = /index\.html$|\/$/.test(location.pathname) ? '#guide' : 'index.html#guide';
    var reportPdfHref = 'assets/exemple-rapport-visite-proxy.pdf';
    overlay.innerHTML = '<div style="background:#fff;border-radius:20px;max-width:460px;width:100%;padding:36px 34px;position:relative;box-shadow:0 40px 80px -20px rgba(0,0,0,.35);">' +
      '<button id="exitPopupClose" aria-label="Fermer" style="position:absolute;top:14px;right:14px;width:32px;height:32px;border-radius:50%;border:1px solid var(--border);background:#fff;font-size:16px;cursor:pointer;">\u2715</button>' +
      '<div style="font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--green-d);margin-bottom:12px;">Avant de partir</div>' +
      '<h3 style="font-size:22px;font-weight:800;color:var(--ink);letter-spacing:-.01em;line-height:1.25;">Commencez par le Guide Acheter en Cr\u00e8te.</h3>' +
      '<p style="font-size:14px;color:var(--muted);line-height:1.6;margin-top:10px;">Zones, prix, d\u00e9marches et pi\u00e8ges \u00e0 \u00e9viter \u2014 l\u2019essentiel pour d\u00e9marrer votre projet, pour 9\u20ac.</p>' +
      '<div style="margin-top:22px;">' +
      '<a href="' + guideHref + '" class="btn btn-primary" style="justify-content:center;width:100%;" data-cta-intent="Guide exit-intent">Voir le Guide \u00e0 9\u20ac \u2192</a>' +
      '</div>' +
      '<p style="text-align:center;margin-top:14px;font-size:12.5px;"><a href="' + reportPdfHref + '" target="_blank" rel="noopener" style="color:var(--blue-l);font-weight:700;" data-cta-intent="Exemple rapport exit-intent">Ou d\u00e9couvrez un exemple de rapport Visite Proxy (PDF) \u2197</a></p>' +
      '</div>';
    document.body.appendChild(overlay);
    overlay.querySelector('#exitPopupClose').addEventListener('click', function(){ overlay.remove(); });
    overlay.addEventListener('click', function(e){ if (e.target === overlay) overlay.remove(); });
    overlay.querySelector('a[data-cta-intent]').addEventListener('click', function(){
      trackEvent('cta_click', { intent: 'Guide exit-intent', page: location.pathname });
    });
    trackEvent('exit_intent_shown', { page: location.pathname });
  }
  document.addEventListener('mouseout', function(e){
    if (!e.relatedTarget && e.clientY < 10){ show(); }
  });
})();

// WhatsApp: same number as the homepage, wired to every entry point on the page.
var WHATSAPP_NUMBER = '306955717183';
var waMessage = encodeURIComponent("Bonjour, je souhaite \u00e9changer sur un projet immobilier en Cr\u00e8te.");
var waNodes = document.querySelectorAll('#waHeaderBtn, #waStickyBtn, #waMobileLink, #waFab');
if (WHATSAPP_NUMBER){
  var waHref = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + waMessage;
  waNodes.forEach(function(el){ el.setAttribute('href', waHref); });
} else {
  waNodes.forEach(function(el){ el.classList.add('wa-hidden'); });
}
