// Suivi de conversion respectueux du consentement — ImmobilierEnCrete.fr
// Identifiant de mesure GA4 de la propriété ImmobilierEnCrete.fr.
(function(){
  'use strict';

  var MEASUREMENT_ID = window.IEC_GA4_ID || 'G-FGM6MNNPTZ';
  var CONSENT_KEY = 'iec_analytics_consent';
  var loaded = false;
  var pendingEvents = [];

  function hasRealId(){ return /^G-[A-Z0-9]{6,}$/.test(MEASUREMENT_ID) && MEASUREMENT_ID !== 'G-XXXXXXXXXX'; }
  function getConsent(){
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }
  function setConsent(value){
    try { localStorage.setItem(CONSENT_KEY, value); } catch (e) {}
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };
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
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(MEASUREMENT_ID);
    document.head.appendChild(script);
    window.gtag('js', new Date());
    window.gtag('config', MEASUREMENT_ID, {
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_flags: 'SameSite=Lax;Secure'
    });
    pendingEvents.splice(0).forEach(function(event){ window.gtag('event', event.name, event.params); });
  }

  window.ieTrack = function(name, params){
    var event = { name: name, params: params || {} };
    if (getConsent() === 'granted' && hasRealId()) {
      loadAnalytics();
      window.gtag('event', event.name, event.params);
    } else if (getConsent() === null) {
      pendingEvents.push(event);
    }
  };

  function removeBanner(){
    var banner = document.getElementById('analyticsConsent');
    if (banner) banner.remove();
  }

  window.iecSetAnalyticsConsent = function(value){
    setConsent(value === 'granted' ? 'granted' : 'denied');
    removeBanner();
    if (value === 'granted') loadAnalytics();
    else pendingEvents.length = 0;
  };

  function showBanner(){
    if (!hasRealId() || getConsent() !== null || document.getElementById('analyticsConsent')) return;
    var banner = document.createElement('aside');
    banner.id = 'analyticsConsent';
    banner.className = 'analytics-consent';
    banner.setAttribute('aria-label', 'Choix de mesure d’audience');
    banner.innerHTML = '<div><div class="analytics-consent-title">Mesure d’audience facultative</div>' +
      '<p class="analytics-consent-text">Avec votre accord, des statistiques anonymisées nous aident à améliorer le parcours. Aucun suivi publicitaire.</p></div>' +
      '<div class="analytics-consent-actions"><button class="btn analytics-refuse" type="button" data-consent="denied">Refuser</button>' +
      '<button class="btn btn-primary" type="button" data-consent="granted">Accepter</button></div>';
    document.body.appendChild(banner);
    banner.querySelectorAll('[data-consent]').forEach(function(button){
      button.addEventListener('click', function(){ window.iecSetAnalyticsConsent(button.getAttribute('data-consent')); });
    });
  }

  if (getConsent() === 'granted') loadAnalytics();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', showBanner);
  else showBanner();
})();
