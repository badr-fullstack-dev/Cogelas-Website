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

if (hamburger && mobileNav) {
  hamburger.setAttribute('aria-controls', 'mobileNav');
  hamburger.setAttribute('aria-expanded', 'false');

  function setMobileNav(open) {
    hamburger.classList.toggle('active', open);
    mobileNav.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('nav-open', open);
  }

  hamburger.addEventListener('click', () => {
    setMobileNav(!mobileNav.classList.contains('open'));
  });

  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setMobileNav(false));
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
      setMobileNav(false);
      hamburger.focus();
    }
  });

  // Close when crossing back to desktop width / orientation change
  const desktopMQ = window.matchMedia('(min-width: 993px)');
  const closeOnDesktop = (e) => { if (e.matches) setMobileNav(false); };
  if (desktopMQ.addEventListener) desktopMQ.addEventListener('change', closeOnDesktop);
  else if (desktopMQ.addListener) desktopMQ.addListener(closeOnDesktop);
}

// Auto-expand mobile Expertises folder if current page is one of the sub-links
(function() {
  const toggle = document.querySelector('.mobile-folder-toggle');
  if (!toggle) return;
  const subLinks = document.querySelectorAll('.mobile-nav .mobile-sub-link');
  const hasActive = Array.from(subLinks).some(a => a.hasAttribute('aria-current'));
  if (hasActive) {
    toggle.setAttribute('aria-expanded', 'true');
    subLinks.forEach(l => l.classList.add('mobile-sub-visible'));
  }
})();

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

  // Clear any leaked inline styles when crossing back to mobile width
  const mobileMQ = window.matchMedia('(max-width: 992px)');
  const resetDropdown = function(e) {
    if (e.matches) {
      dropdownToggle.setAttribute('aria-expanded', 'false');
      menu.style.opacity = '';
      menu.style.visibility = '';
      menu.style.transform = '';
    }
  };
  if (mobileMQ.addEventListener) mobileMQ.addEventListener('change', resetDropdown);
  else if (mobileMQ.addListener) mobileMQ.addListener(resetDropdown);
})();

// Contact form: client-side validation + async POST to /api/contact
(function() {
  var form = document.getElementById('contactForm');
  if (!form) return;

  // Stamp form-load time so the server can reject instant bot submissions
  var ts = document.getElementById('contactTs');
  if (ts) ts.value = String(Date.now());

  var submitted = false;
  var submitting = false;

  function validateField(group) {
    var input = group.querySelector('input, textarea');
    if (!input || input.type === 'hidden') return true;
    var valid = true;
    if (input.hasAttribute('required') && !input.value.trim()) {
      valid = false;
    }
    if (input.type === 'email' && input.value.trim()) {
      valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
    }
    if (valid) group.classList.remove('has-error');
    else group.classList.add('has-error');
    return valid;
  }

  function showSuccess() {
    var wrapper = document.getElementById('contactFormWrapper');
    if (!wrapper) return;
    while (wrapper.firstChild) wrapper.removeChild(wrapper.firstChild);
    var box = document.createElement('div');
    box.className = 'form-success';
    box.setAttribute('role', 'status');
    box.setAttribute('aria-live', 'polite');
    var p1 = document.createElement('p');
    p1.textContent = 'Votre message a \u00e9t\u00e9 envoy\u00e9 avec succ\u00e8s !';
    var p2 = document.createElement('p');
    p2.style.fontSize = '14px';
    p2.style.fontWeight = '400';
    p2.style.color = 'var(--gray-600)';
    p2.style.marginTop = '8px';
    p2.textContent = 'Nous vous r\u00e9pondrons dans les plus brefs d\u00e9lais.';
    box.appendChild(p1);
    box.appendChild(p2);
    wrapper.appendChild(box);
    wrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function showError(msg) {
    var existing = form.querySelector('.form-error-banner');
    if (existing) existing.remove();
    var banner = document.createElement('div');
    banner.className = 'form-error-banner';
    banner.setAttribute('role', 'alert');
    banner.textContent = msg;
    form.insertBefore(banner, form.firstChild);
  }

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    if (submitting) return;
    submitted = true;

    var groups = form.querySelectorAll('.form-group');
    var allValid = true;
    groups.forEach(function(g) { if (!validateField(g)) allValid = false; });
    if (!allValid) {
      var firstError = form.querySelector('.form-group.has-error input, .form-group.has-error textarea');
      if (firstError) firstError.focus();
      return;
    }

    var submitBtn = form.querySelector('.form-submit');
    var originalLabel = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Envoi en cours...';
    }
    submitting = true;

    var payload = {};
    new FormData(form).forEach(function(v, k) { payload[k] = v; });

    try {
      var resp = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });
      var data = {};
      try { data = await resp.json(); } catch (_) {}
      if (resp.ok && data.ok) {
        showSuccess();
        return;
      }
      var msg = (data && data.error) || 'Une erreur est survenue. Reessayez plus tard.';
      showError(msg);
    } catch (err) {
      showError('Connexion impossible. Verifiez votre reseau et reessayez.');
    } finally {
      submitting = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      }
    }
  });

  form.addEventListener('focusout', function(e) {
    if (!submitted) return;
    var group = e.target.closest('.form-group');
    if (group) validateField(group);
  });
})();

/* Pause partners marquee when offscreen or tab hidden — saves CPU/battery on mobile. */
(function() {
  const track = document.querySelector('.partners-track');
  if (!track) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return; // already disabled by CSS
  const setPaused = (paused) => track.setAttribute('data-paused', String(paused));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(([entry]) => {
      setPaused(!entry.isIntersecting);
    }, { threshold: 0 });
    io.observe(track);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) setPaused(true);
    else {
      // Resume only if track is in view
      const rect = track.getBoundingClientRect();
      const onScreen = rect.bottom > 0 && rect.top < window.innerHeight;
      setPaused(!onScreen);
    }
  });
})();

/* Background videos (hero + planchers): keep them playing when in view, pause
   when offscreen, and auto-resume when the browser/OS pauses us against our
   will (iOS Safari sometimes pauses background videos on scroll, tab return,
   or under Low Power Mode — once paused, Safari shows a big play-button
   overlay we can't reliably hide via CSS, so the fix is to never stay paused
   while visible). */
(function setupBackgroundVideos() {
  function setup(video, container) {
    if (!video || !container) return;
    var manualPause = false;
    var retries = 0;

    function visible() {
      var r = container.getBoundingClientRect();
      return r.bottom > 0 && r.top < window.innerHeight;
    }

    function tryPlay() {
      if (document.hidden || !visible()) return;
      manualPause = false;
      var p = video.play();
      if (p && p.then) {
        p.then(function () { retries = 0; })
         .catch(function () { retries++; }); // browser refused (Low Power Mode etc.)
      }
    }

    function pause() {
      manualPause = true;
      video.pause();
    }

    // Try to start playback as soon as the browser has data
    video.addEventListener('loadedmetadata', tryPlay);
    video.addEventListener('canplay', tryPlay);

    // If the browser/OS pauses against our wishes, retry (cap at 3 to avoid loops)
    video.addEventListener('pause', function () {
      if (manualPause || video.ended || retries >= 3) return;
      setTimeout(tryPlay, 200);
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting && !document.hidden) tryPlay();
        else pause();
      }, { threshold: 0 }).observe(container);
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) pause();
      else tryPlay();
    });

    // Best-effort initial kick (covers cases where autoplay was blocked
    // before our handlers attached)
    tryPlay();
  }

  setup(document.getElementById('hero-video'), document.querySelector('.hero'));
  setup(
    document.querySelector('.planchers-highlight-img video'),
    document.querySelector('.planchers-highlight')
  );
})();
