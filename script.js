/* Tailwind landing interactions */

const navShell = document.getElementById('nav-shell');
const navToggle = document.getElementById('nav-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const scrollProgress = document.getElementById('scroll-progress');

const setNavState = () => {
  if (!navShell) return;

  if (window.scrollY > 18) {
    navShell.classList.remove('border-white/10', 'bg-slate-950/70');
    navShell.classList.add('border-blue-400/40', 'bg-slate-950/95', 'shadow-2xl', 'shadow-blue-950/40');
  } else {
    navShell.classList.add('border-white/10', 'bg-slate-950/70');
    navShell.classList.remove('border-blue-400/40', 'bg-slate-950/95', 'shadow-2xl', 'shadow-blue-950/40');
  }
};

const updateScrollProgress = () => {
  if (!scrollProgress) return;

  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollHeight > 0 ? (window.scrollY / scrollHeight) * 100 : 0;
  scrollProgress.style.width = `${Math.min(100, Math.max(0, progress))}%`;
};

const handleScrollEffects = () => {
  setNavState();
  updateScrollProgress();
};

handleScrollEffects();
window.addEventListener('scroll', handleScrollEffects, { passive: true });

if (navToggle && mobileMenu) {
  navToggle.addEventListener('click', () => {
    const isHidden = mobileMenu.classList.toggle('hidden');
    navToggle.setAttribute('aria-expanded', String(!isHidden));
  });

  document.querySelectorAll('[data-mobile-link]').forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) {
      mobileMenu.classList.add('hidden');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// FAQ accordion
const faqButtons = document.querySelectorAll('[data-faq-trigger]');
faqButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const targetId = button.getAttribute('data-faq-target');
    if (!targetId) return;

    const target = document.getElementById(targetId);
    if (!target) return;

    const isOpen = !target.classList.contains('hidden');

    faqButtons.forEach((btn) => {
      const id = btn.getAttribute('data-faq-target');
      if (!id) return;
      const panel = document.getElementById(id);
      if (!panel) return;

      btn.setAttribute('aria-expanded', 'false');
      panel.classList.add('hidden');
      const icon = btn.querySelector('span:last-child');
      if (icon) icon.textContent = '+';
    });

    if (!isOpen) {
      target.classList.remove('hidden');
      button.setAttribute('aria-expanded', 'true');
      const icon = button.querySelector('span:last-child');
      if (icon) icon.textContent = '-';
    }
  });
});

// Smooth scroll for section links
const navLinks = document.querySelectorAll('a[href^="#"]');
navLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const href = link.getAttribute('href');
    if (!href || href === '#') return;

    const target = document.querySelector(href);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// Scroll reveal
const revealElements = document.querySelectorAll('[data-reveal]');
if (revealElements.length > 0) {
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.remove('opacity-0', 'translate-y-6');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15 }
    );

    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => {
      element.classList.remove('opacity-0', 'translate-y-6');
    });
  }
}

// Counter animation
const countElements = document.querySelectorAll('[data-count-target]');
const animateCount = (element) => {
  const target = Number(element.getAttribute('data-count-target')) || 0;
  const suffix = element.getAttribute('data-count-suffix') || '';
  const duration = 1300;
  const startTime = performance.now();

  const tick = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(1, elapsed / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(target * eased);
    element.textContent = `${current.toLocaleString('en-US')}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
};

if (countElements.length > 0) {
  if ('IntersectionObserver' in window) {
    const countObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCount(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.4 }
    );

    countElements.forEach((element) => countObserver.observe(element));
  } else {
    countElements.forEach((element) => animateCount(element));
  }
}

// Interactive use-case tabs
const usecaseButtons = document.querySelectorAll('[data-usecase-btn]');
const usecasePanels = document.querySelectorAll('[data-usecase-panel]');

const setUsecase = (activeId) => {
  usecaseButtons.forEach((button) => {
    const isActive = button.getAttribute('data-usecase-btn') === activeId;
    button.setAttribute('aria-selected', String(isActive));
    button.classList.toggle('border-blue-300/50', isActive);
    button.classList.toggle('bg-blue-400/15', isActive);
    button.classList.toggle('text-blue-100', isActive);
    button.classList.toggle('border-white/10', !isActive);
    button.classList.toggle('text-slate-300', !isActive);
  });

  usecasePanels.forEach((panel) => {
    const matches = panel.getAttribute('data-usecase-panel') === activeId;
    panel.classList.toggle('hidden', !matches);
  });
};

if (usecaseButtons.length > 0 && usecasePanels.length > 0) {
  usecaseButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.getAttribute('data-usecase-btn');
      if (!target) return;
      setUsecase(target);
    });
  });
}

// Impact estimator
const meetingRange = document.getElementById('meeting-range');
const meetingOutput = document.getElementById('meeting-output');
const paperSavedOutput = document.getElementById('paper-saved-output');
const co2Output = document.getElementById('co2-output');
const costOutput = document.getElementById('cost-output');
const impactBar = document.getElementById('impact-bar');

const formatNumber = (value) => value.toLocaleString('en-US');

const updateImpactEstimator = () => {
  if (!meetingRange) return;

  const monthlyMeetings = Number(meetingRange.value) || 0;
  const yearlyConnections = monthlyMeetings * 12;
  const paperCardsAvoided = yearlyConnections;
  const estimatedCo2 = paperCardsAvoided * 0.004;
  const estimatedCostSaved = paperCardsAvoided * 0.28;

  if (meetingOutput) meetingOutput.textContent = formatNumber(monthlyMeetings);
  if (paperSavedOutput) paperSavedOutput.textContent = formatNumber(paperCardsAvoided);
  if (co2Output) co2Output.textContent = `${estimatedCo2.toFixed(1)} kg`;
  if (costOutput) costOutput.textContent = `${formatNumber(Math.round(estimatedCostSaved))} TND`;

  if (impactBar) {
    const widthPercent = ((monthlyMeetings - 20) / (600 - 20)) * 100;
    impactBar.style.width = `${Math.min(100, Math.max(0, widthPercent))}%`;
  }
};

if (meetingRange) {
  meetingRange.addEventListener('input', updateImpactEstimator);
  updateImpactEstimator();
}

// Story rail controls
const storyScroll = document.getElementById('story-scroll');
const storyPrev = document.getElementById('story-prev');
const storyNext = document.getElementById('story-next');

if (storyScroll) {
  const getStep = () => Math.max(240, Math.round(storyScroll.clientWidth * 0.82));

  if (storyPrev) {
    storyPrev.addEventListener('click', () => {
      storyScroll.scrollBy({ left: -getStep(), behavior: 'smooth' });
    });
  }

  if (storyNext) {
    storyNext.addEventListener('click', () => {
      storyScroll.scrollBy({ left: getStep(), behavior: 'smooth' });
    });
  }
}
