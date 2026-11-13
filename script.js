(() => {
  'use strict';

  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nav = document.querySelector('#primary-nav');
  const navToggle = document.querySelector('.nav-toggle');
  const themeToggle = document.querySelector('.theme-toggle');
  const themeIcon = document.querySelector('.theme-toggle-icon');
  const themeLabel = document.querySelector('.theme-toggle-label');
  const themeMeta = document.querySelector('#theme-color-meta');
  const backToTop = document.querySelector('.back-to-top-floating');
  const siteFavicon = document.querySelector('#site-favicon');
  const brandLogos = document.querySelectorAll('.who img, .wordmark img');
  const siteHeaders = document.querySelectorAll('.site-header, .top');
  let lenis = null;

  // Initialize Lenis smooth scrolling when reduced motion is not requested.
  if (!REDUCED_MOTION && window.Lenis) {
    lenis = new Lenis({ lerp: .09 });

    (function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    })();
  }

  // Mobile navigation.
  function closeNav() {
    if (!nav || !navToggle) return;

    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open navigation');
    document.body.classList.remove('nav-open');
  }

  navToggle?.addEventListener('click', () => {
    const open = navToggle.getAttribute('aria-expanded') === 'true';

    navToggle.setAttribute('aria-expanded', String(!open));
    navToggle.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
    nav.classList.toggle('is-open', !open);
    document.body.classList.toggle('nav-open', !open);
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeNav();
  });

  // Theme handling.
  const getSavedTheme = () => {
    try {
      return localStorage.getItem('portfolio-theme');
    } catch (_) {
      return null;
    }
  };

  function applyTheme(theme, persist = false) {
    const light = theme === 'light';

    document.documentElement.dataset.theme = light ? 'light' : 'dark';

    themeToggle?.setAttribute('aria-pressed', String(light));
    themeToggle?.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');

    if (themeIcon) themeIcon.textContent = light ? '☾' : '☼';
    if (themeLabel) themeLabel.textContent = light ? 'Dark mode' : 'Light mode';

    themeMeta?.setAttribute('content', light ? '#F4F4F0' : '#0A0B09');

    // Update favicon and header/footer logos.
    const logoPath = light
      ? 'assets/logo-light.svg'
      : 'assets/logo-dark.svg';

    brandLogos.forEach(logo => {
      logo.src = logoPath;
    });

    if (persist) {
      try {
        localStorage.setItem('portfolio-theme', light ? 'light' : 'dark');
      } catch (_) {}
    }
  }

  applyTheme(getSavedTheme() === 'light' ? 'light' : 'dark');

  themeToggle?.addEventListener('click', () => {
    applyTheme(
      document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark',
      true
    );
  });

  // Same-page anchor navigation.
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    if (anchor === backToTop) return;

    anchor.addEventListener('click', event => {
      const hash = anchor.getAttribute('href');

      if (!hash || hash === '#') return;

      const target = document.getElementById(decodeURIComponent(hash.slice(1)));

      if (!target) return;

      event.preventDefault();
      closeNav();

      if (lenis && !REDUCED_MOTION) {
        lenis.scrollTo(target, { offset: -12 });
      } else {
        target.scrollIntoView({
          behavior: REDUCED_MOTION ? 'auto' : 'smooth',
          block: 'start'
        });
      }

      if (history.replaceState) {
        history.replaceState(null, '', hash);
      }
    });
  });

  // Active navigation section.
  const sectionLinks = [...document.querySelectorAll('.primary-nav a[href^="#"]')];
  const homeSection = document.querySelector('#home');

  function clearActiveSection() {
    sectionLinks.forEach(link => {
      link.classList.remove('is-active');
      link.removeAttribute('aria-current');
    });
  }

  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        // The hero is the introduction, not a dedicated navigation section.
        if (entry.target.id === 'home') {
          clearActiveSection();
          return;
        }

        sectionLinks.forEach(link => {
          const active = link.getAttribute('href') === `#${entry.target.id}`;

          link.classList.toggle('is-active', active);

          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-25% 0px -60% 0px', threshold: 0 });

    sectionLinks.forEach(link => {
      const section = document.getElementById(link.hash.slice(1));
      if (section) sectionObserver.observe(section);
    });

    // Also observe the hero so the active navigation line disappears at the top.
    if (homeSection) sectionObserver.observe(homeSection);
  }

  // Header border and back-to-top visibility.
  function updateScrollControls(scrollPosition = window.scrollY) {
    const isScrolled = scrollPosition > 0;

    siteHeaders.forEach(header => {
      header.classList.toggle('is-scrolled', isScrolled);
    });

    backToTop?.classList.toggle('is-visible', scrollPosition > 420);
  }

  window.addEventListener(
    'scroll',
    () => updateScrollControls(window.scrollY),
    { passive: true }
  );

  lenis?.on('scroll', ({ scroll }) => updateScrollControls(scroll));

  updateScrollControls();

  // Back-to-top control.
  backToTop?.addEventListener('click', event => {
    event.preventDefault();
    closeNav();

    if (lenis && !REDUCED_MOTION) {
      lenis.scrollTo(0, { immediate: false });
    } else {
      window.scrollTo({
        top: 0,
        behavior: REDUCED_MOTION ? 'auto' : 'smooth'
      });
    }

    if (history.replaceState) {
      history.replaceState(null, '', '#top');
    }
  });

  // Reset mobile navigation when switching to desktop.
  const desktopQuery = window.matchMedia('(min-width: 901px)');

  desktopQuery.addEventListener?.('change', event => {
    if (event.matches) closeNav();
  });
})();