import { fetchJson } from './utils.js';

function renderLocations(locations) {
  const container = document.getElementById('locations-list');
  if (!container) return;
  if (locations.length === 0) {
    container.innerHTML = `
      <div class="text-center bg-white/70 p-8 rounded-3xl border border-sand-200">
        <p class="text-lg text-charcoal-600">No locations match your filters. Try expanding your search to see the franchise reach.</p>
      </div>
    `;
    return;
  }
  container.innerHTML = locations
    .map(
      (loc) => `
        <article class="bg-white rounded-3xl border border-sand-200 shadow-sm p-6 flex flex-col gap-4">
          <div>
            <h3 class="text-2xl font-semibold text-charcoal-900">${loc.name}</h3>
            <p class="text-charcoal-500">${loc.address}</p>
          </div>
          <div class="flex flex-wrap gap-3 text-sm text-charcoal-600">
            <span class="inline-flex items-center gap-2"><span class="material-symbols-rounded text-rose-500" aria-hidden="true">call</span>${loc.phone}</span>
            <span class="inline-flex items-center gap-2"><span class="material-symbols-rounded text-rose-500" aria-hidden="true">schedule</span>${loc.hours}</span>
          </div>
          <div class="flex flex-wrap gap-2">
            ${loc.services
              .map((service) => `<span class="px-3 py-1 bg-sand-100 text-sand-700 rounded-full text-sm">${service}</span>`)
              .join('')}
          </div>
          <a href="index.html#lead" class="text-rose-600 font-medium inline-flex items-center gap-2 hover:text-rose-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500">Book a consultation<span class="material-symbols-rounded" aria-hidden="true">arrow_forward</span></a>
        </article>
      `
    )
    .join('');
}

function applyFilters(locations) {
  const city = document.getElementById('filter-city').value.trim().toLowerCase();
  const state = document.getElementById('filter-state').value.trim().toLowerCase();
  const zip = document.getElementById('filter-zip').value.trim();
  return locations.filter((loc) => {
    const matchesCity = city ? loc.city.toLowerCase().includes(city) : true;
    const matchesState = state ? loc.state.toLowerCase().includes(state) : true;
    const matchesZip = zip ? loc.zip.startsWith(zip) : true;
    return matchesCity && matchesState && matchesZip;
  });
}

export async function initLocations() {
  const locations = await fetchJson('data/locations.json');
  renderLocations(locations);
  const inputs = document.querySelectorAll('[data-location-filter]');
  inputs.forEach((input) =>
    input.addEventListener('input', () => {
      const filtered = applyFilters(locations);
      renderLocations(filtered);
    })
  );
}

document.addEventListener('DOMContentLoaded', initLocations);
