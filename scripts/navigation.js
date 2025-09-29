function setupKeyboardShortcut() {
  document.addEventListener('keydown', (event) => {
    if ((event.key === 'd' || event.key === 'D') && !event.altKey && !event.metaKey && !event.ctrlKey) {
      window.location.href = 'demo.html';
    }
  });
}

function setupMobileMenu() {
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', (!expanded).toString());
    menu.classList.toggle('hidden');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupKeyboardShortcut();
  setupMobileMenu();
});
