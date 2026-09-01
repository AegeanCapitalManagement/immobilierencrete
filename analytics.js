// Configuration Google Analytics 4 — SOURCE UNIQUE pour tout le site.
// Remplacez UNIQUEMENT G-XXXXXXXXXX ci-dessous par votre Measurement ID réel
// (Google Analytics > Admin > Flux de données) : un seul édit ici suffit,
// toutes les pages (qui chargent ce fichier) se mettent à jour automatiquement.
window.GA_MEASUREMENT_ID = 'G-FGM6MNNPTZ';
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
if (window.GA_MEASUREMENT_ID.indexOf('XXXX') === -1){
  var gaScript = document.createElement('script');
  gaScript.async = true;
  gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + window.GA_MEASUREMENT_ID;
  document.head.appendChild(gaScript);
  gtag('config', window.GA_MEASUREMENT_ID);
}
