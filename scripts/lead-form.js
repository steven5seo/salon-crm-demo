import { fetchJson, storeLead, fireAnalytics, loadConfig } from './utils.js';

function generateId(prefix = 'ld') {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

function getFormData(form) {
  const formData = new FormData(form);
  const interestedServices = formData.getAll('interestedServices');
  return {
    id: generateId(),
    firstName: formData.get('firstName').trim(),
    lastName: formData.get('lastName').trim(),
    email: formData.get('email').trim(),
    phone: formData.get('phone').trim(),
    preferredLocation: formData.get('preferredLocation'),
    interestedServices,
    marketingConsent: formData.get('marketingConsent') === 'on',
    membership: 'New',
    lastVisit: null,
    createdAt: new Date().toISOString()
  };
}

function showSuccessState(form, lead) {
  const success = document.getElementById('lead-success');
  const summary = document.getElementById('lead-summary');
  if (success && summary) {
    success.classList.remove('hidden');
    summary.innerHTML = `Thanks ${lead.firstName}! Our team from <span class="font-semibold">${lead.preferredLocation}</span> will reach out within one business day.`;
  }
  form.classList.add('hidden');
  document.getElementById('lead-next-steps')?.classList.remove('hidden');
}

function displayErrors(errors) {
  const container = document.getElementById('lead-errors');
  if (!container) return;
  if (errors.length === 0) {
    container.classList.add('hidden');
    container.innerHTML = '';
    return;
  }
  container.classList.remove('hidden');
  container.innerHTML = `<ul class="list-disc pl-5">${errors.map((err) => `<li>${err}</li>`).join('')}</ul>`;
}

function validate(form) {
  const errors = [];
  const firstName = form.firstName.value.trim();
  const lastName = form.lastName.value.trim();
  const email = form.email.value.trim();
  const preferredLocation = form.preferredLocation.value;
  if (!firstName) errors.push('First name is required.');
  if (!lastName) errors.push('Last name is required.');
  if (!email) {
    errors.push('Email is required.');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Enter a valid email address.');
  }
  if (!preferredLocation) errors.push('Select a preferred location.');
  return errors;
}

async function populateServices() {
  const services = await fetchJson('data/services.json');
  const select = document.getElementById('interestedServices');
  if (!select) return;
  services.forEach((service) => {
    const option = document.createElement('option');
    option.value = service.name;
    option.textContent = service.name;
    select.appendChild(option);
  });
}

async function populateLocations() {
  const locations = await fetchJson('data/locations.json');
  const select = document.getElementById('preferredLocation');
  if (!select) return;
  locations.forEach((loc) => {
    const option = document.createElement('option');
    option.value = loc.name;
    option.textContent = loc.name;
    select.appendChild(option);
  });
}

export async function initLeadForm() {
  await loadConfig();
  await Promise.all([populateServices(), populateLocations()]);
  const form = document.getElementById('lead-form');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const errors = validate(form);
    displayErrors(errors);
    if (errors.length > 0) {
      return;
    }
    const lead = getFormData(form);
    storeLead(lead);
    fireAnalytics('lead_submit', {
      interests_count: lead.interestedServices.length,
      location_selected: lead.preferredLocation
    });
    showSuccessState(form, lead);
  });
}

document.addEventListener('DOMContentLoaded', initLeadForm);
