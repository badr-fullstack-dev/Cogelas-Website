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

/* Hero video: auto-resume if YouTube ever enters a paused state (kills stray pause-button flash).
   Also pauses when offscreen / tab hidden — saves CPU/battery once the user has scrolled past. */
(function heroVideoAutoplay() {
  var iframe = document.getElementById('hero-video-iframe');
  if (!iframe) return;
  if (!document.querySelector('script[data-yt-api]')) {
    var tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.setAttribute('data-yt-api', '');
    document.head.appendChild(tag);
  }
  window.onYouTubeIframeAPIReady = function () {
    var inView = true;
    var player = new YT.Player('hero-video-iframe', {
      events: {
        onReady: function (e) { e.target.mute(); e.target.playVideo(); },
        onStateChange: function (e) {
          if (inView && !document.hidden &&
              (e.data === YT.PlayerState.PAUSED || e.data === YT.PlayerState.ENDED)) {
            e.target.playVideo();
          }
        }
      }
    });
    var hero = document.querySelector('.hero');
    if (hero && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        if (player && player.pauseVideo && player.playVideo) {
          if (inView && !document.hidden) player.playVideo();
          else player.pauseVideo();
        }
      }, { threshold: 0 }).observe(hero);
    }
    document.addEventListener('visibilitychange', function () {
      if (!player) return;
      if (document.hidden) { if (player.pauseVideo) player.pauseVideo(); }
      else if (inView && player.playVideo) player.playVideo();
    });
  };
})();
