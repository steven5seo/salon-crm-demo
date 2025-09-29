import { fetchJson } from './utils.js';

function renderServices(services) {
  const container = document.getElementById('services-grid');
  if (!container) return;
  container.innerHTML = services
    .map(
      (service) => `
        <article id="${service.id}" class="bg-white rounded-3xl border border-sand-200 shadow-sm p-6 flex flex-col gap-4">
          <div>
            <h3 class="text-2xl font-semibold text-charcoal-900">${service.name}</h3>
            <p class="text-sm text-rose-600">${service.priceRange}</p>
          </div>
          <p class="text-charcoal-600">${service.description}</p>
          <div class="flex flex-wrap gap-2">
            ${service.tags.map((tag) => `<span class="px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-sm">${tag}</span>`).join('')}
          </div>
          <a href="index.html#lead" class="inline-flex items-center gap-2 font-semibold text-rose-600 hover:text-rose-700 mt-auto">Book consult<span class="material-symbols-rounded" aria-hidden="true">arrow_forward</span></a>
        </article>
      `
    )
    .join('');
}

export async function initServices() {
  const services = await fetchJson('data/services.json');
  renderServices(services);
}

document.addEventListener('DOMContentLoaded', initServices);
