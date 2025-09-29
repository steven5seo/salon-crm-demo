export async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }
  return response.json();
}

export function obfuscateEmail(email) {
  if (!email) return '';
  const [user, domain] = email.split('@');
  if (!user || !domain) return email;
  const maskedUser = user.length <= 2 ? user[0] + '*' : user[0] + '*'.repeat(Math.max(1, user.length - 2)) + user[user.length - 1];
  return `${maskedUser}@${domain}`;
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function getStoredLeads() {
  const raw = localStorage.getItem('demo_leads');
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Unable to parse stored leads', error);
    return [];
  }
}

export function storeLead(lead) {
  const existing = getStoredLeads();
  existing.push(lead);
  localStorage.setItem('demo_leads', JSON.stringify(existing));
}

export function fireAnalytics(eventName, params = {}) {
  if (window.demoConfig?.features?.enableAnalytics && typeof gtag === 'function') {
    gtag('event', eventName, params);
  }
}

export async function loadConfig() {
  if (window.demoConfig) return window.demoConfig;
  try {
    const config = await fetchJson('data/config.json');
    window.demoConfig = config;
    if (config.features?.enableAnalytics && config.ga4MeasurementId && !window.__gaLoaded) {
      injectGA(config.ga4MeasurementId);
    }
    return config;
  } catch (error) {
    console.warn('Unable to load config', error);
    return {
      ga4MeasurementId: '',
      features: {
        enableAnalytics: false,
        enableSmsPreview: true
      }
    };
  }
}

function injectGA(measurementId) {
  window.__gaLoaded = true;
  window.dataLayer = window.dataLayer || [];
  function gtag(){window.dataLayer.push(arguments);} // eslint-disable-line
  window.gtag = window.gtag || gtag;
  gtag('js', new Date());
  gtag('config', measurementId);
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);
}
