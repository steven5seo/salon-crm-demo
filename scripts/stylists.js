import { fetchJson } from './utils.js';

function renderStylists(stylists) {
  const container = document.getElementById('stylists-grid');
  if (!container) return;
  if (stylists.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center p-10 bg-white/70 rounded-xl shadow-inner border border-sand-200">
        <p class="text-lg text-charcoal-600">No stylists match the selected filters. Adjust your selection to explore the franchise talent.</p>
      </div>
    `;
    return;
  }
  container.innerHTML = stylists
    .map(
      (stylist) => `
        <article class="bg-white rounded-3xl border border-sand-200 shadow-md overflow-hidden flex flex-col">
          <img src="${stylist.photo}" alt="${stylist.name}" class="h-56 w-full object-cover" loading="lazy" width="400" height="320">
          <div class="p-6 flex flex-col gap-4 flex-1">
            <div>
              <h3 class="text-xl font-semibold text-charcoal-900">${stylist.name}</h3>
              <p class="text-sm text-charcoal-500">${stylist.locations.join(', ')}</p>
            </div>
            <p class="text-charcoal-700">${stylist.bio}</p>
            <div class="flex flex-wrap gap-2">
              ${stylist.specialties
                .map((spec) => `<span class="inline-flex items-center px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-sm">${spec}</span>`)
                .join('')}
            </div>
            <div class="mt-auto flex items-center justify-between text-sm text-charcoal-500">
              <span>${stylist.yearsExperience} yrs experience</span>
              <div class="flex gap-2">
                ${stylist.badges
                  .map((badge) => `<span class="px-2.5 py-1 bg-sand-100 text-sand-700 rounded-full">${badge}</span>`)
                  .join('')}
              </div>
            </div>
          </div>
        </article>
      `
    )
    .join('');
}

function applyFilters(stylists) {
  const location = document.getElementById('stylist-location').value;
  const specialty = document.getElementById('stylist-specialty').value;
  return stylists.filter((stylist) => {
    const matchesLocation = location ? stylist.locations.includes(location) : true;
    const matchesSpecialty = specialty ? stylist.specialties.includes(specialty) : true;
    return matchesLocation && matchesSpecialty;
  });
}

function populateFilters(stylists) {
  const locationsSelect = document.getElementById('stylist-location');
  const specialtySelect = document.getElementById('stylist-specialty');
  if (!locationsSelect || !specialtySelect) return;
  const locations = new Set();
  const specialties = new Set();
  stylists.forEach((stylist) => {
    stylist.locations.forEach((loc) => locations.add(loc));
    stylist.specialties.forEach((spec) => specialties.add(spec));
  });
  locations.forEach((loc) => {
    const option = document.createElement('option');
    option.value = loc;
    option.textContent = loc;
    locationsSelect.appendChild(option);
  });
  specialties.forEach((spec) => {
    const option = document.createElement('option');
    option.value = spec;
    option.textContent = spec;
    specialtySelect.appendChild(option);
  });
}

export async function initStylists() {
  const stylists = await fetchJson('data/stylists.json');
  populateFilters(stylists);
  renderStylists(stylists);
  const filters = document.querySelectorAll('[data-stylist-filter]');
  filters.forEach((filter) =>
    filter.addEventListener('change', () => {
      const filtered = applyFilters(stylists);
      renderStylists(filtered);
    })
  );
}

document.addEventListener('DOMContentLoaded', initStylists);
