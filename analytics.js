// Google Analytics 4 — consentement préalable, révocable et sans publicité.
(function(){
  'use strict';

  var MEASUREMENT_ID = window.IEC_GA4_ID || 'G-FGM6MNNPTZ';
  var CONSENT_KEY = 'iec_analytics_consent';
  var CONSENT_VERSION = 2;
  var CONSENT_TTL = 180 * 24 * 60 * 60 * 1000; // 6 mois, recommandation CNIL.
  var GA_COOKIE_LIFETIME_SECONDS = 395 * 24 * 60 * 60; // 13 mois maximum.
  var loaded = false;

  function hasRealId(){
    return /^G-[A-Z0-9]{6,}$/.test(MEASUREMENT_ID) && MEASUREMENT_ID !== 'G-XXXXXXXXXX';
  }

  function removeStoredConsent(){
    try { localStorage.removeItem(CONSENT_KEY); } catch (e) {}
  }

  function getConsent(){
    var raw;
    try { raw = localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
    if (!raw) return null;

    // Les anciennes valeurs simples sont volontairement invalidées : la nouvelle
    // version, révocable depuis le site, doit être présentée une fois à chacun.
    try {
      var record = JSON.parse(raw);
      var validChoice = record && (record.value === 'granted' || record.value === 'denied');
      var validDate = record && Number.isFinite(record.savedAt) && Date.now() - record.savedAt <= CONSENT_TTL;
      if (!record || record.version !== CONSENT_VERSION || !validChoice || !validDate){
        removeStoredConsent();
        return null;
      }
      return record.value;
    } catch (e) {
      removeStoredConsent();
      return null;
    }
  }

  function saveConsent(value){
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify({
        value: value,
        savedAt: Date.now(),
        version: CONSENT_VERSION
      }));
    } catch (e) {}
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };

  // Refus par défaut pour les quatre signaux Consent Mode v2. Le script Google
  // lui-même n'est pas chargé tant que la personne n'a pas accepté.
  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500
  });

  function loadAnalytics(){
    if (loaded || !hasRealId() || getConsent() !== 'granted') return;
    loaded = true;
    window.gtag('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });

    var script = document.createElement('script');
    script.id = 'iec-ga4-script';
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(MEASUREMENT_ID);
    document.head.appendChild(script);

    window.gtag('js', new Date());
    window.gtag('config', MEASUREMENT_ID, {
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_expires: GA_COOKIE_LIFETIME_SECONDS,
      cookie_update: false,
      cookie_flags: 'SameSite=Lax;Secure'
    });
  }

  // Aucun événement n'est mémorisé ni envoyé avant le consentement.
  window.ieTrack = function(name, params){
    if (getConsent() !== 'granted' || !hasRealId()) return;
    loadAnalytics();
    window.gtag('event', name, params || {});
  };

  function deleteAnalyticsCookies(){
    var names = document.cookie.split(';').map(function(cookie){
      return cookie.split('=')[0].trim();
    }).filter(function(name){
      return /^_ga(?:_|$)|^_gid$|^_gat(?:_|$)/.test(name);
    });
    var host = window.location.hostname;
    var parts = host.split('.');
    var root = parts.length > 1 ? parts.slice(-2).join('.') : host;
    var domains = ['', host, '.' + host, root, '.' + root];

    names.forEach(function(name){
      domains.forEach(function(domain){
        var domainPart = domain ? '; Domain=' + domain : '';
        document.cookie = name + '=; Max-Age=0; Path=/' + domainPart + '; SameSite=Lax; Secure';
      });
    });
  }

  function injectConsentStyles(){
    if (document.getElementById('iec-consent-styles')) return;
    var style = document.createElement('style');
    style.id = 'iec-consent-styles';
    style.textContent =
      '#analyticsConsent{position:fixed;z-index:10000;left:16px;right:16px;bottom:16px;max-width:820px;margin:auto;padding:20px;background:#fff;color:#0F1B24;border:1px solid #DCE4E9;border-radius:18px;box-shadow:0 22px 70px rgba(13,36,56,.25);display:grid;grid-template-columns:minmax(0,1fr) minmax(300px,auto);gap:20px;align-items:center;font-family:"Plus Jakarta Sans",Arial,sans-serif;text-align:left}' +
      '#analyticsConsent .analytics-consent-title{font-size:16px;line-height:1.3;font-weight:800;color:#0F1B24;margin:0 0 6px}' +
      '#analyticsConsent .analytics-consent-text{font-size:13px;line-height:1.55;color:#5B6672;margin:0}' +
      '#analyticsConsent .analytics-consent-link{display:inline-block;margin-top:7px;font-size:12.5px;font-weight:700;color:#1B6F9F;text-decoration:underline;text-underline-offset:2px}' +
      '#analyticsConsent .analytics-consent-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px}' +
      '#analyticsConsent .analytics-choice{min-height:46px;padding:10px 14px;border-radius:10px;font:700 13px/1.25 "Plus Jakarta Sans",Arial,sans-serif;cursor:pointer;white-space:normal}' +
      '#analyticsConsent .analytics-refuse{background:#fff;color:#0F1B24;border:1px solid #BFCBD3}' +
      '#analyticsConsent .analytics-accept{background:#188F67;color:#fff;border:1px solid #188F67}' +
      '#analyticsConsent .analytics-choice:hover{filter:brightness(.97)}' +
      '#analyticsConsent .analytics-choice:focus-visible,#analyticsManage:focus-visible{outline:3px solid #55BCE9;outline-offset:3px}' +
      '#analyticsManage{font:600 12.5px/1.3 "Plus Jakarta Sans",Arial,sans-serif;cursor:pointer}' +
      '.f-links #analyticsManage{padding:0;background:transparent;border:0;color:rgba(255,255,255,.76);text-decoration:underline;text-underline-offset:3px}' +
      'body>#analyticsManage{position:fixed;z-index:550;left:12px;bottom:12px;padding:9px 12px;background:#fff;color:#1B547E;border:1px solid #DCE4E9;border-radius:999px;box-shadow:0 5px 20px rgba(13,36,56,.14)}' +
      '@media(max-width:720px){#analyticsConsent{left:10px;right:10px;bottom:76px;padding:16px;grid-template-columns:1fr;gap:14px;max-height:calc(100vh - 96px);overflow:auto}#analyticsConsent .analytics-consent-actions{grid-template-columns:1fr}#analyticsConsent .analytics-choice{width:100%}body>#analyticsManage{bottom:82px}}' +
      '@media(prefers-reduced-motion:reduce){#analyticsConsent,#analyticsManage{scroll-behavior:auto}}';
    document.head.appendChild(style);
  }

  function removeBanner(){
    var banner = document.getElementById('analyticsConsent');
    if (banner) banner.remove();
    var manage = document.getElementById('analyticsManage');
    if (manage) manage.hidden = false;
  }

  function addManageButton(){
    if (!hasRealId() || document.getElementById('analyticsManage')) return;
    var button = document.createElement('button');
    button.id = 'analyticsManage';
    button.type = 'button';
    button.textContent = 'Gérer mes cookies';
    button.setAttribute('aria-controls', 'analyticsConsent');
    button.addEventListener('click', function(){ showBanner(true); });
    var footerLinks = document.querySelector('.f-links');
    (footerLinks || document.body).appendChild(button);
  }

  window.iecSetAnalyticsConsent = function(value){
    var granted = value === 'granted';
    var analyticsWasLoaded = loaded || Boolean(document.getElementById('iec-ga4-script'));
    saveConsent(granted ? 'granted' : 'denied');
    removeBanner();

    if (granted){
      loadAnalytics();
      return;
    }

    window.gtag('consent', 'update', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    deleteAnalyticsCookies();

    // Après un retrait en cours de page, un rechargement garantit qu'aucun code
    // Analytics déjà initialisé ne peut poursuivre la mesure.
    if (analyticsWasLoaded) window.setTimeout(function(){ window.location.reload(); }, 120);
  };

  function showBanner(force){
    if (!hasRealId() || (!force && getConsent() !== null)) return;
    var existing = document.getElementById('analyticsConsent');
    if (existing){
      existing.querySelector('.analytics-refuse').focus();
      return;
    }

    injectConsentStyles();
    var manage = document.getElementById('analyticsManage');
    if (manage) manage.hidden = true;

    var banner = document.createElement('aside');
    banner.id = 'analyticsConsent';
    banner.className = 'analytics-consent';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Choix concernant les cookies de mesure d’audience');
    banner.setAttribute('aria-live', 'polite');
    banner.innerHTML =
      '<div class="analytics-consent-copy">' +
        '<div class="analytics-consent-title">Votre choix de confidentialité</div>' +
        '<p class="analytics-consent-text">Avec votre accord, Google Analytics 4 nous aide à mesurer l’audience et les demandes envoyées. Il n’est jamais chargé avant votre accord, aucun usage publicitaire n’est activé et le refus ne change pas le fonctionnement du site.</p>' +
        '<a class="analytics-consent-link" href="/confidentialite.html#cookies">Politique et détail des traceurs</a>' +
      '</div>' +
      '<div class="analytics-consent-actions">' +
        '<button class="analytics-choice analytics-refuse" type="button" data-consent="denied">Tout refuser</button>' +
        '<button class="analytics-choice analytics-accept" type="button" data-consent="granted">Accepter les statistiques</button>' +
      '</div>';
    document.body.appendChild(banner);

    banner.querySelectorAll('[data-consent]').forEach(function(button){
      button.addEventListener('click', function(){
        window.iecSetAnalyticsConsent(button.getAttribute('data-consent'));
      });
    });
    if (force) banner.querySelector('.analytics-refuse').focus();
  }

  function init(){
    injectConsentStyles();
    addManageButton();
    if (getConsent() === 'granted') loadAnalytics();
    else if (getConsent() === null) showBanner(false);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
