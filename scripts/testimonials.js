import { fetchJson } from './utils.js';

let intervalId;

function renderTestimonials(testimonials) {
  const container = document.getElementById('testimonial-track');
  const indicators = document.getElementById('testimonial-indicators');
  if (!container || !indicators) return;
  container.innerHTML = testimonials
    .map(
      (testimonial, index) => `
        <div class="min-w-full transition-opacity duration-500" role="group" aria-roledescription="slide" aria-label="Testimonial ${index + 1} of ${testimonials.length}">
          <div class="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-8 border border-sand-200">
            <p class="text-lg md:text-xl text-charcoal-700">“${testimonial.quote}”</p>
            <p class="mt-6 font-semibold text-charcoal-900">${testimonial.name}</p>
            <p class="text-sm text-charcoal-500">${testimonial.title}</p>
          </div>
        </div>
      `
    )
    .join('');
  indicators.innerHTML = testimonials
    .map(
      (_, index) => `
        <button type="button" class="w-2.5 h-2.5 rounded-full bg-sand-400" aria-label="Go to testimonial ${index + 1}" data-index="${index}"></button>
      `
    )
    .join('');
}

function setActiveSlide(index) {
  const slides = document.querySelectorAll('#testimonial-track > div');
  const dots = document.querySelectorAll('#testimonial-indicators > button');
  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle('opacity-100', slideIndex === index);
    slide.classList.toggle('opacity-0', slideIndex !== index);
    slide.setAttribute('tabindex', slideIndex === index ? '0' : '-1');
    slide.setAttribute('aria-hidden', slideIndex === index ? 'false' : 'true');
  });
  dots.forEach((dot, dotIndex) => {
    dot.classList.toggle('bg-rose-500', dotIndex === index);
    dot.classList.toggle('bg-sand-400', dotIndex !== index);
  });
  const wrapper = document.getElementById('testimonial-track');
  wrapper.style.transform = `translateX(-${index * 100}%)`;
  wrapper.dataset.activeIndex = index.toString();
}

function startAutoRotate() {
  stopAutoRotate();
  intervalId = window.setInterval(() => {
    const wrapper = document.getElementById('testimonial-track');
    if (!wrapper) return;
    const total = wrapper.children.length;
    const current = Number(wrapper.dataset.activeIndex || '0');
    const next = (current + 1) % total;
    setActiveSlide(next);
  }, 6000);
}

function stopAutoRotate() {
  if (intervalId) window.clearInterval(intervalId);
}

export async function initTestimonials() {
  const testimonials = await fetchJson('data/testimonials.json');
  renderTestimonials(testimonials);
  const wrapper = document.getElementById('testimonial-wrapper');
  const indicators = document.getElementById('testimonial-indicators');
  if (!wrapper || !indicators) return;
  setActiveSlide(0);
  startAutoRotate();
  wrapper.addEventListener('mouseenter', stopAutoRotate);
  wrapper.addEventListener('mouseleave', startAutoRotate);
  indicators.addEventListener('click', (event) => {
    const target = event.target;
    if (target instanceof HTMLButtonElement && target.dataset.index) {
      stopAutoRotate();
      setActiveSlide(Number(target.dataset.index));
    }
  });
}

document.addEventListener('DOMContentLoaded', initTestimonials);
