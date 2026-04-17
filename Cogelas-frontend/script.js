// Navbar scroll transition
const header = document.getElementById('header');
function updateHeader() {
  if (window.scrollY > 80) {
    header.classList.remove('transparent');
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
    header.classList.add('transparent');
  }
}
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

// Hamburger menu
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  mobileNav.classList.toggle('open');
});

mobileNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    mobileNav.classList.remove('open');
  });
});

// Scroll reveal
const revealElements = document.querySelectorAll('.reveal');
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReduced) {
  revealElements.forEach(el => el.classList.add('visible'));
} else {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealElements.forEach(el => revealObserver.observe(el));
}

// Counter animation
const counters = document.querySelectorAll('.number[data-target]');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.target);
      const duration = 1500;
      const start = performance.now();

      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased);
        if (progress < 1) requestAnimationFrame(tick);
      }

      if (prefersReduced) {
        el.textContent = target;
      } else {
        requestAnimationFrame(tick);
      }
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

counters.forEach(c => counterObserver.observe(c));

// === INNER PAGES ===

// Header: inner pages start with .scrolled, no transparent toggle
(function() {
  const hdr = document.getElementById('header');
  if (!hdr) return;
  const hasHeroSection = document.querySelector('.hero');
  if (!hasHeroSection) {
    // Inner page — always keep scrolled state, remove transparent
    hdr.classList.remove('transparent');
    hdr.classList.add('scrolled');
    // Prevent the existing scroll listener from re-adding transparent
    window.addEventListener('scroll', function() {
      hdr.classList.remove('transparent');
      hdr.classList.add('scrolled');
    }, { passive: true });
  }
})();

// Mobile folder toggle for Expertises sub-links
(function() {
  const toggle = document.querySelector('.mobile-folder-toggle');
  if (!toggle) return;
  const subLinks = document.querySelectorAll('.mobile-nav .mobile-sub-link');
  toggle.addEventListener('click', function() {
    const expanded = this.getAttribute('aria-expanded') === 'true';
    this.setAttribute('aria-expanded', String(!expanded));
    subLinks.forEach(function(link) {
      link.classList.toggle('mobile-sub-visible');
    });
  });
})();

// Keyboard-accessible dropdown (Expertises)
(function() {
  const dropdownToggle = document.querySelector('.nav-dropdown-toggle');
  if (!dropdownToggle) return;
  const dropdown = dropdownToggle.closest('.nav-dropdown');
  const menu = dropdown.querySelector('.nav-dropdown-menu');

  dropdownToggle.addEventListener('click', function() {
    const expanded = this.getAttribute('aria-expanded') === 'true';
    this.setAttribute('aria-expanded', String(!expanded));
    if (!expanded) {
      menu.style.opacity = '1';
      menu.style.visibility = 'visible';
      menu.style.transform = 'translateY(0)';
    } else {
      menu.style.opacity = '0';
      menu.style.visibility = 'hidden';
      menu.style.transform = 'translateY(8px)';
    }
  });

  // Close on click outside
  document.addEventListener('click', function(e) {
    if (!dropdown.contains(e.target)) {
      dropdownToggle.setAttribute('aria-expanded', 'false');
      menu.style.opacity = '';
      menu.style.visibility = '';
      menu.style.transform = '';
    }
  });

  // Close on Escape
  dropdown.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      dropdownToggle.setAttribute('aria-expanded', 'false');
      menu.style.opacity = '';
      menu.style.visibility = '';
      menu.style.transform = '';
      dropdownToggle.focus();
    }
  });
})();

// Contact form validation
(function() {
  var form = document.getElementById('contactForm');
  if (!form) return;

  // Check for success redirect
  if (window.location.search.indexOf('sent=1') !== -1) {
    var formWrapper = document.getElementById('contactFormWrapper');
    if (formWrapper) {
      formWrapper.innerHTML = '<div class="form-success"><p>Votre message a \u00e9t\u00e9 envoy\u00e9 avec succ\u00e8s !</p><p style="font-size:14px;font-weight:400;color:var(--gray-600);margin-top:8px;">Nous vous r\u00e9pondrons dans les plus brefs d\u00e9lais.</p></div>';
    }
    return;
  }

  var submitted = false;

  function validateField(group) {
    var input = group.querySelector('input, textarea');
    if (!input) return true;
    var valid = true;
    if (input.hasAttribute('required') && !input.value.trim()) {
      valid = false;
    }
    if (input.type === 'email' && input.value.trim()) {
      valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
    }
    if (valid) {
      group.classList.remove('has-error');
    } else {
      group.classList.add('has-error');
    }
    return valid;
  }

  form.addEventListener('submit', function(e) {
    submitted = true;
    var groups = form.querySelectorAll('.form-group');
    var allValid = true;
    groups.forEach(function(g) {
      if (!validateField(g)) allValid = false;
    });
    if (!allValid) {
      e.preventDefault();
    }
  });

  // Validate on blur after first submit attempt
  form.addEventListener('focusout', function(e) {
    if (!submitted) return;
    var group = e.target.closest('.form-group');
    if (group) validateField(group);
  });
})();
