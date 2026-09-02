// Shared behaviour for ImmobilierEnCrete.fr subpages (visite-proxy, pack-installation,
// simulateur, exemple-rapport, zones/*). The homepage keeps its own inline copy.

// ---------- Paiement direct — Stripe Payment Links ----------
// Remplacez chaque valeur par le Payment Link Stripe correspondant (Stripe
// Dashboard > Payment Links). Tant qu'une valeur reste vide, le
// bouton continue de renvoyer vers le formulaire de contact (aucune rupture
// de parcours en attendant les liens réels). Une fois le lien renseigné, TOUS
// les boutons portant ce data-cta-intent, sur TOUTES les pages, pointent
// directement vers Stripe.
var STRIPE_PAYMENT_LINKS = {
  'Guide Acheter en Crète': '',
  'Crète Insider': ''
};
document.querySelectorAll('[data-cta-intent]').forEach(function(el){
  var intent = el.getAttribute('data-cta-intent');
  var link = STRIPE_PAYMENT_LINKS[intent];
  if (link && /^https:\/\//.test(link)){
    el.setAttribute('href', link);
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
    el.setAttribute('data-stripe-wired', '1');
  } else if (intent === 'Guide Acheter en Crète') {
    el.setAttribute('href', 'contact.html?objet=Guide%20Acheter%20en%20Cr%C3%A8te#contact');
    el.setAttribute('data-payment-pending', '1');
  }
});

// Le CTA principal reste fixe. Un libellé qui change pendant la lecture peut
// surprendre l'utilisateur et affaiblir la priorité donnée à la Visite Proxy.

// ---------- Google Analytics 4 — événements clés ----------
// Envoie un événement gtag si GA est chargé (silencieux sinon), pour suivre
// clics WhatsApp, intentions de CTA et soumissions de formulaire par page/zone.
function trackEvent(name, params){
  if (typeof window.ieTrack === 'function'){
    window.ieTrack(name, params || {});
  } else if (typeof gtag === 'function'){
    gtag('event', name, params || {});
  }
}
document.querySelectorAll('[data-cta-intent]').forEach(function(el){
  el.addEventListener('click', function(){
    trackEvent('cta_click', { intent: this.getAttribute('data-cta-intent'), page: location.pathname });
  });
});
document.querySelectorAll('#waHeaderBtn, #waStickyBtn, #waMobileLink, #waFab').forEach(function(el){
  el.addEventListener('click', function(){ trackEvent('whatsapp_click', { page: location.pathname }); });
});

// Mesure des principaux chemins de conversion, sans dépendre du libellé du bouton.
document.addEventListener('click', function(event){
  var link = event.target.closest && event.target.closest('a[href]');
  if (!link || link.hasAttribute('data-cta-intent')) return;
  var href = link.getAttribute('href') || '';
  if (/wa\.me|whatsapp/i.test(href) && !/^wa(HeaderBtn|StickyBtn|MobileLink|Fab)$/.test(link.id || '')){
    trackEvent('whatsapp_click', { page: location.pathname, placement: link.id || link.className || 'link' });
  } else if (href === '#contact' || /contact\.html/.test(href)){
    trackEvent('contact_click', { page: location.pathname, destination: href });
  } else if (/simulateur\.html|#simulateur|#calculateur/.test(href)){
    trackEvent('simulator_click', { page: location.pathname, destination: href });
  } else if (/\.pdf(?:$|\?)/i.test(href) || /exemple-rapport/.test(href)){
    trackEvent('report_view', { page: location.pathname, destination: href });
  } else if (/guide-|blog\.html/.test(href)){
    trackEvent('content_click', { page: location.pathname, destination: href });
  }
});

// Ouvertures de FAQ : indicateur utile des objections avant conversion.
document.querySelectorAll('details.faq-item').forEach(function(item){
  item.addEventListener('toggle', function(){
    if (!item.open) return;
    var summary = item.querySelector('summary');
    trackEvent('faq_open', { page: location.pathname, question: summary ? summary.textContent.trim().slice(0, 120) : '' });
  });
});

// Profondeur de lecture : une seule mesure par seuil et par page.
(function(){
  var sent = {};
  var ticking = false;
  function measureDepth(){
    ticking = false;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (max <= 0) return;
    var depth = Math.round((window.scrollY / max) * 100);
    [25, 50, 75, 90].forEach(function(mark){
      if (depth >= mark && !sent[mark]){
        sent[mark] = true;
        trackEvent('scroll_depth', { page: location.pathname, percent: mark });
      }
    });
  }
  window.addEventListener('scroll', function(){
    if (!ticking){ ticking = true; window.requestAnimationFrame(measureDepth); }
  }, { passive: true });
})();

// Première interaction avec le calculateur, sans enregistrer les montants saisis.
(function(){
  var calculator = document.getElementById('calculateur') || document.querySelector('.calc-panel');
  if (!calculator) return;
  var started = false;
  calculator.addEventListener('input', function(){
    if (started) return;
    started = true;
    trackEvent('calculator_start', { page: location.pathname });
  });
})();

if (/\/merci-mission\.html$/.test(location.pathname)){
  trackEvent('lead_confirmation_view', { page: location.pathname });
}
if (/\/merci-guide\.html$/.test(location.pathname)){
  trackEvent('guide_confirmation_view', { page: location.pathname });
}

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
    if (!matched && objet === 'Guide Acheter en Crète'){
      var guideOption = document.createElement('option');
      guideOption.value = objet;
      guideOption.textContent = 'Guide Acheter en Crète — être prévenu';
      objetSelect.appendChild(guideOption);
      matched = true;
    }
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

// Les formulaires disposent aussi d'un POST HTML direct vers FormSubmit.co.
// Le JavaScript améliore l'expérience, mais l'envoi ne dépend plus entièrement
// de lui : en cas de script bloqué, aucune donnée n'est ajoutée à l'URL.
document.querySelectorAll('form').forEach(function(form){
  if (!form.getAttribute('method')) form.setAttribute('method', 'post');
  if (!form.getAttribute('action')) form.setAttribute('action', 'https://formsubmit.co/' + FORM_DESTINATION_EMAIL);
});

// Contact form: direct AJAX submission, with a native HTML POST fallback.
// The visitor never needs a configured e-mail application.
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

    function ensureHiddenField(name, value){
      var field = contactForm.querySelector('input[name="' + name + '"]');
      if (!field){
        field = document.createElement('input');
        field.type = 'hidden';
        field.name = name;
        contactForm.appendChild(field);
      }
      field.value = value;
    }

    function submitWithHtmlFallback(){
      ensureHiddenField('_subject', subject);
      ensureHiddenField('_next', 'https://www.immobilierencrete.fr/merci-mission.html');
      ensureHiddenField('_captcha', 'false');
      ensureHiddenField('_template', 'table');
      HTMLFormElement.prototype.submit.call(contactForm);
    }

    if (submitBtn){ submitBtn.disabled = true; }
    sendToFormSubmit({
      _subject: subject,
      _captcha: 'false',
      _template: 'table',
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
        trackEvent('generate_lead', { intent: data.get('objet') || 'Contact', page: location.pathname });
        contactForm.reset();
      } else {
        submitWithHtmlFallback();
      }
    }).catch(function(){
      submitWithHtmlFallback();
    });
  });
}

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
  // Pas de relance d'achat avant l'ouverture réelle des ventes.
  if (!STRIPE_PAYMENT_LINKS['Guide Acheter en Crète']) return;
  if (sessionStorage.getItem('exitPopupShown')) return;
  var shown = false;
  function show(){
    if (shown) return;
    shown = true;
    sessionStorage.setItem('exitPopupShown', '1');
    var overlay = document.createElement('div');
    overlay.id = 'exitPopupOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(13,36,56,.55);z-index:500;display:flex;align-items:center;justify-content:center;padding:20px;';
    var guideHref = /(?:\/index\.html|\/)$/.test(location.pathname) ? '#guide' : '/#guide';
    var reportPdfHref = 'assets/exemple-rapport-visite-proxy.pdf';
    overlay.innerHTML = '<div style="background:#fff;border-radius:20px;max-width:460px;width:100%;padding:36px 34px;position:relative;box-shadow:0 40px 80px -20px rgba(0,0,0,.35);">' +
      '<button id="exitPopupClose" aria-label="Fermer" style="position:absolute;top:14px;right:14px;width:32px;height:32px;border-radius:50%;border:1px solid var(--border);background:#fff;font-size:16px;cursor:pointer;">\u2715</button>' +
      '<div style="font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--green-d);margin-bottom:12px;">Avant de partir</div>' +
      '<h3 style="font-size:22px;font-weight:800;color:var(--ink);letter-spacing:-.01em;line-height:1.25;">Commencez par le Guide Acheter en Cr\u00e8te.</h3>' +
      '<p style="font-size:14px;color:var(--muted);line-height:1.6;margin-top:10px;">Zones, prix, d\u00e9marches et pi\u00e8ges \u00e0 \u00e9viter \u2014 l\u2019essentiel pour d\u00e9marrer votre projet. Le paiement sera ouvert prochainement.</p>' +
      '<div style="margin-top:22px;">' +
      '<a href="' + guideHref + '" class="btn btn-primary" style="justify-content:center;width:100%;" data-cta-intent="Guide exit-intent">Voir le guide et être prévenu \u2192</a>' +
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
