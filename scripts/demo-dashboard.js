import { fetchJson, getStoredLeads, obfuscateEmail, formatDate, fireAnalytics, loadConfig } from './utils.js';

let leads = [];
let segmentsFilters = {
  location: [],
  interest: [],
  membership: [],
  lastVisit: 'any'
};
let templates = [];

function updateSegmentSizeDisplay(text) {
  document.querySelectorAll('[data-segment-size]').forEach((element) => {
    element.textContent = text;
  });
}

function combineLeads(seed, stored) {
  const map = new Map();
  [...seed, ...stored].forEach((lead) => {
    map.set(lead.id || `${lead.email}-${lead.createdAt}`, lead);
  });
  return Array.from(map.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function renderLeadsTable() {
  const tbody = document.getElementById('leads-table-body');
  const emptyState = document.getElementById('leads-empty');
  if (!tbody || !emptyState) return;
  if (leads.length === 0) {
    emptyState.classList.remove('hidden');
    tbody.innerHTML = '';
    return;
  }
  emptyState.classList.add('hidden');
  tbody.innerHTML = leads
    .map(
      (lead) => `
        <tr class="border-b border-sand-100 last:border-none">
          <td class="py-3 px-4 font-medium text-charcoal-900">${lead.firstName} ${lead.lastName}</td>
          <td class="py-3 px-4 text-charcoal-600">${obfuscateEmail(lead.email)}</td>
          <td class="py-3 px-4 text-charcoal-600">${lead.preferredLocation}</td>
          <td class="py-3 px-4 text-charcoal-600">${lead.interestedServices.join(', ')}</td>
          <td class="py-3 px-4 text-charcoal-600">${lead.membership || 'New'}</td>
          <td class="py-3 px-4 text-charcoal-500">${formatDate(lead.createdAt)}</td>
        </tr>
      `
    )
    .join('');
}

function renderSegmentResults(results) {
  const container = document.getElementById('segment-results');
  if (!container) return;
  if (results.length === 0) {
    container.innerHTML = `<p class="text-charcoal-600">No leads match the selected filters yet. Adjust filters or capture a new lead to demo reactivation.</p>`;
    return;
  }
  container.innerHTML = `
    <ul class="space-y-3">
      ${results
        .map(
          (lead) => `
            <li class="flex items-center justify-between bg-white/70 border border-sand-200 rounded-2xl px-4 py-3">
              <span class="font-medium text-charcoal-900">${lead.firstName} ${lead.lastName}</span>
              <span class="text-sm text-charcoal-500">${lead.preferredLocation} • ${lead.interestedServices.join(', ')}</span>
            </li>
          `
        )
        .join('')}
    </ul>
  `;
}

function applySegmentFilters(shouldFire = true) {
  let filtered = [...leads];
  if (segmentsFilters.location.length) {
    filtered = filtered.filter((lead) => segmentsFilters.location.includes(lead.preferredLocation));
  }
  if (segmentsFilters.interest?.length) {
    filtered = filtered.filter((lead) => lead.interestedServices.some((service) => segmentsFilters.interest.includes(service)));
  }
  if (segmentsFilters.membership?.length) {
    filtered = filtered.filter((lead) => segmentsFilters.membership.includes(lead.membership || 'New'));
  }
  if (segmentsFilters.lastVisit && segmentsFilters.lastVisit !== 'any') {
    const now = new Date();
    filtered = filtered.filter((lead) => {
      if (!lead.lastVisit) return segmentsFilters.lastVisit === 'never';
      if (segmentsFilters.lastVisit === 'never') return false;
      const daysSinceVisit = (now - new Date(lead.lastVisit)) / (1000 * 60 * 60 * 24);
      if (segmentsFilters.lastVisit === '30+') {
        return daysSinceVisit >= 30;
      }
      if (segmentsFilters.lastVisit === '60+') {
        return daysSinceVisit >= 60;
      }
      if (segmentsFilters.lastVisit === '90+') {
        return daysSinceVisit >= 90;
      }
      return true;
    });
  }
  const segmentText = `${filtered.length} lead${filtered.length === 1 ? '' : 's'}`;
  updateSegmentSizeDisplay(segmentText);
  renderSegmentResults(filtered);
  if (shouldFire) {
    fireAnalytics('segment_apply', {
      filters_applied: Object.entries(segmentsFilters)
        .filter(([, value]) => (Array.isArray(value) ? value.length : value && value !== 'any'))
        .map(([key, value]) => `${key}:${Array.isArray(value) ? value.join('|') : value}`)
        .join(',')
    });
  }
  return filtered;
}

function setupSegmentFilters(locations) {
  const locationContainer = document.getElementById('filter-location');
  const interestContainer = document.getElementById('filter-interest');
  const membershipContainer = document.getElementById('filter-membership');
  const lastVisitSelect = document.getElementById('filter-last-visit');

  if (locationContainer) {
    locations.forEach((loc) => {
      const option = document.createElement('label');
      option.className = 'flex items-center gap-2';
      option.innerHTML = `<input type="checkbox" value="${loc.name}" class="accent-rose-500"> <span>${loc.name}</span>`;
      locationContainer.appendChild(option);
    });
    locationContainer.addEventListener('change', (event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement) {
        if (target.checked) {
          segmentsFilters.location.push(target.value);
        } else {
          segmentsFilters.location = segmentsFilters.location.filter((value) => value !== target.value);
        }
        applySegmentFilters();
      }
    });
  }

  const interests = new Set();
  leads.forEach((lead) => lead.interestedServices.forEach((service) => interests.add(service)));
  if (interestContainer) {
    interests.forEach((interest) => {
      const option = document.createElement('label');
      option.className = 'flex items-center gap-2';
      option.innerHTML = `<input type="checkbox" value="${interest}" class="accent-rose-500"> <span>${interest}</span>`;
      interestContainer.appendChild(option);
    });
    interestContainer.addEventListener('change', (event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement) {
        if (target.checked) {
          segmentsFilters.interest.push(target.value);
        } else {
          segmentsFilters.interest = segmentsFilters.interest.filter((value) => value !== target.value);
        }
        applySegmentFilters();
      }
    });
  }

  const memberships = new Set(leads.map((lead) => lead.membership || 'New'));
  if (membershipContainer) {
    memberships.forEach((membership) => {
      const option = document.createElement('label');
      option.className = 'flex items-center gap-2';
      option.innerHTML = `<input type="checkbox" value="${membership}" class="accent-rose-500"> <span>${membership}</span>`;
      membershipContainer.appendChild(option);
    });
    membershipContainer.addEventListener('change', (event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement) {
        if (target.checked) {
          segmentsFilters.membership.push(target.value);
        } else {
          segmentsFilters.membership = segmentsFilters.membership.filter((value) => value !== target.value);
        }
        applySegmentFilters();
      }
    });
  }

  if (lastVisitSelect) {
    lastVisitSelect.addEventListener('change', (event) => {
      segmentsFilters.lastVisit = event.target.value;
      applySegmentFilters();
    });
  }
}

function renderTemplates(templatesData) {
  const select = document.getElementById('campaign-template');
  if (!select) return;
  select.innerHTML = templatesData
    .map((template) => `<option value="${template.id}">${template.name}</option>`)
    .join('');
}

function populateCampaignForm(template) {
  document.getElementById('campaign-headline').value = template.email.headline;
  document.getElementById('campaign-body').value = template.email.body;
  document.getElementById('campaign-offer').value = template.email.cta;
  document.getElementById('campaign-subject').value = template.email.subject;
  document.getElementById('campaign-sms').value = template.sms.text;
}

function renderPreviews(template) {
  const emailPreview = document.getElementById('email-preview');
  const smsPreview = document.getElementById('sms-preview');
  if (!emailPreview) return;
  const headline = document.getElementById('campaign-headline').value;
  const body = document.getElementById('campaign-body').value;
  const offer = document.getElementById('campaign-offer').value;
  const subject = document.getElementById('campaign-subject').value;
  const sms = document.getElementById('campaign-sms').value;
  emailPreview.innerHTML = `
    <div class="max-w-xl mx-auto bg-white shadow-lg rounded-3xl overflow-hidden border border-sand-200">
      <div class="bg-rose-500 text-white px-6 py-4">
        <p class="text-sm uppercase tracking-wide">${template.name}</p>
        <h3 class="text-2xl font-semibold">${headline}</h3>
      </div>
      <div class="px-6 py-6 space-y-4 text-charcoal-700">
        <p class="text-sm font-semibold uppercase text-rose-500">Subject: ${subject}</p>
        <p>${body}</p>
        <button class="bg-rose-500 text-white px-4 py-2 rounded-full font-medium" type="button">${offer}</button>
      </div>
    </div>
  `;
  if (smsPreview && window.demoConfig?.features?.enableSmsPreview !== false) {
    smsPreview.innerHTML = `
      <div class="bg-charcoal-900 text-white p-4 rounded-3xl max-w-xs mx-auto shadow-inner">
        <div class="bg-rose-500 text-white px-3 py-2 rounded-2xl rounded-bl-none inline-block">${sms}</div>
      </div>
    `;
  }
}

function handleTemplateChange(event) {
  const selectedId = event.target.value;
  const template = templates.find((item) => item.id === selectedId);
  if (!template) return;
  populateCampaignForm(template);
  renderPreviews(template);
}

function handlePreviewClick(template) {
  const segmentDisplay = document.querySelector('[data-segment-size]');
  const segmentSize = segmentDisplay ? segmentDisplay.textContent : '0 leads';
  renderPreviews(template);
  fireAnalytics('campaign_preview', {
    template_id: template.id,
    segment_size: segmentSize
  });
}

export async function initDemoDashboard() {
  await loadConfig();
  const [seedLeads, locations, campaignTemplates] = await Promise.all([
    fetchJson('data/leads.json'),
    fetchJson('data/locations.json'),
    fetchJson('data/campaigns.json')
  ]);
  const stored = getStoredLeads();
  leads = combineLeads(seedLeads, stored);
  templates = campaignTemplates;
  renderLeadsTable();
  setupSegmentFilters(locations);
  applySegmentFilters(false);
  renderTemplates(templates);

  document.getElementById('refresh-leads')?.addEventListener('click', () => {
    const updatedStored = getStoredLeads();
    leads = combineLeads(seedLeads, updatedStored);
    renderLeadsTable();
    applySegmentFilters(false);
  });

  const templateSelect = document.getElementById('campaign-template');
  templateSelect?.addEventListener('change', (event) => handleTemplateChange(event));
  if (templateSelect) {
    handleTemplateChange({ target: templateSelect });
  }

  document.getElementById('preview-campaign')?.addEventListener('click', () => {
    const selectedId = templateSelect?.value;
    const template = templates.find((item) => item.id === selectedId);
    if (!template) return;
    template.email.headline = document.getElementById('campaign-headline').value;
    template.email.body = document.getElementById('campaign-body').value;
    template.email.cta = document.getElementById('campaign-offer').value;
    template.email.subject = document.getElementById('campaign-subject').value;
    template.sms.text = document.getElementById('campaign-sms').value;
    handlePreviewClick(template);
  });
}

document.addEventListener('DOMContentLoaded', initDemoDashboard);
