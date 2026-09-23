document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const isDesktop = () => window.innerWidth > 900;

  const header = document.getElementById('siteHeader');
  const navToggle = document.getElementById('navToggle');
  const navList = document.getElementById('navList');
  const preloader = document.getElementById('sitePreloader');

  /* =====================================================
     PRELOADER
  ===================================================== */

  const finishLoading = () => {
    document.body.classList.add('site-loaded');

    window.setTimeout(() => {
      preloader?.remove();
    }, reduceMotion ? 0 : 850);
  };

  if (document.readyState === 'complete') {
    window.setTimeout(finishLoading, 300);
  } else {
    window.addEventListener('load', () => {
      window.setTimeout(finishLoading, 450);
    }, { once: true });

    // Garante que o site nunca fique preso no loading.
    window.setTimeout(finishLoading, 2500);
  }

  /* =====================================================
     HEADER E PROGRESSO DE ROLAGEM
  ===================================================== */

  const scrollProgress = document.createElement('div');
  scrollProgress.className = 'scroll-progress';
  scrollProgress.setAttribute('aria-hidden', 'true');
  document.body.appendChild(scrollProgress);

  const updateScrollUI = () => {
    header?.classList.toggle('scrolled', window.scrollY > 40);

    const scrollable =
      document.documentElement.scrollHeight - window.innerHeight;

    const progress = scrollable > 0
      ? Math.min((window.scrollY / scrollable) * 100, 100)
      : 0;

    scrollProgress.style.transform = `scaleX(${progress / 100})`;
  };

  window.addEventListener('scroll', updateScrollUI, { passive: true });
  updateScrollUI();

  /* =====================================================
     MENU MOBILE
  ===================================================== */

  const closeMenu = () => {
    navList?.classList.remove('open');
    navToggle?.classList.remove('active');
    navToggle?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  };

  navToggle?.addEventListener('click', () => {
    const open = !navList?.classList.contains('open');

    navList?.classList.toggle('open', open);
    navToggle.classList.toggle('active', open);
    navToggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
  });

  navList?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  /* =====================================================
     ROLAGEM SUAVE COM COMPENSAÇÃO DO HEADER
  ===================================================== */

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');

      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();

      const headerHeight = header?.offsetHeight || 0;
      const destination =
        target.getBoundingClientRect().top +
        window.scrollY -
        headerHeight +
        1;

      window.scrollTo({
        top: destination,
        behavior: reduceMotion ? 'auto' : 'smooth'
      });
    });
  });

  /* =====================================================
     TEXTO DIVIDIDO EM PALAVRAS E LETRAS
  ===================================================== */

  const splitTitle = (element) => {
    if (!element || element.dataset.splitReady === 'true') return;

    const walk = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        const fragment = document.createDocumentFragment();

        text.split(/(\s+)/).forEach((piece) => {
          if (!piece) return;

          if (/^\s+$/.test(piece)) {
            fragment.appendChild(document.createTextNode(piece));
            return;
          }

          const word = document.createElement('span');
          word.className = 'motion-word';

          Array.from(piece).forEach((char) => {
            const letter = document.createElement('span');
            letter.className = 'motion-letter';
            letter.textContent = char;
            word.appendChild(letter);
          });

          fragment.appendChild(word);
        });

        node.replaceWith(fragment);
        return;
      }

      Array.from(node.childNodes).forEach(walk);
    };

    Array.from(element.childNodes).forEach(walk);
    element.dataset.splitReady = 'true';
    element.classList.add('split-ready');
  };

  const titles = document.querySelectorAll('.hero-headline, .section-title');
  titles.forEach(splitTitle);

  const revealLetters = (element, speed = 18) => {
    if (!element || element.dataset.lettersAnimated === 'true') return;

    element.dataset.lettersAnimated = 'true';

    const letters = element.querySelectorAll('.motion-letter');

    letters.forEach((letter, index) => {
      letter.style.setProperty('--letter-delay', `${index * speed}ms`);
      letter.classList.add('letter-visible');
    });
  };

  /* =====================================================
     ABERTURA CINEMATOGRÁFICA DO HERO
  ===================================================== */

  const heroItems = [
    document.querySelector('.hero .eyebrow'),
    document.querySelector('.hero-headline'),
    document.querySelector('.hero-sub'),
    document.querySelector('.hero-actions'),
    document.querySelector('.hero-right'),
    document.querySelector('.hero-side-note')
  ].filter(Boolean);

  heroItems.forEach((item) => item.classList.add('hero-intro'));

  const startHero = () => {
    if (reduceMotion) {
      heroItems.forEach((item) => item.classList.add('intro-visible'));
      revealLetters(document.querySelector('.hero-headline'), 0);
      return;
    }

    const sequence = [
      ['.hero .eyebrow', 80],
      ['.hero-headline', 180],
      ['.hero-sub', 650],
      ['.hero-actions', 820],
      ['.hero-right', 240],
      ['.hero-side-note', 900]
    ];

    sequence.forEach(([selector, delay]) => {
      window.setTimeout(() => {
        const element = document.querySelector(selector);
        element?.classList.add('intro-visible');

        if (selector === '.hero-headline') {
          revealLetters(element, 22);
        }
      }, delay);
    });
  };

  if (document.body.classList.contains('site-loaded')) {
    startHero();
  } else {
    const loadingObserver = new MutationObserver(() => {
      if (!document.body.classList.contains('site-loaded')) return;
      loadingObserver.disconnect();
      startHero();
    });

    loadingObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  /* =====================================================
     REVEAL DAS SEÇÕES
  ===================================================== */

  const revealElements = new Set([
    ...document.querySelectorAll('[data-reveal]'),
    ...document.querySelectorAll(
      '.about-photo, .about-text, .contact-info, .contact-photo, ' +
      '.contact-form-wrap, .footer-brand, .footer-col'
    )
  ]);

  revealElements.forEach((element) => {
    element.classList.add('motion-reveal');

    if (element.matches('.about-photo, .contact-photo')) {
      element.classList.add('reveal-left');
    }

    if (element.matches('.about-text, .contact-info, .contact-form-wrap')) {
      element.classList.add('reveal-right');
    }

    if (element.matches('.footer-brand, .footer-col')) {
      element.classList.add('reveal-up');
    }
  });

  const revealElement = (element) => {
    element.classList.add('is-visible');

    const title = element.matches('.section-title')
      ? element
      : element.querySelector('.section-title');

    revealLetters(title, 15);

    if (element.dataset.reveal === 'stagger') {
      Array.from(element.children).forEach((child, index) => {
        child.style.setProperty('--item-delay', `${index * 110}ms`);
        child.classList.add('stagger-visible');
      });
    }

    element.querySelectorAll('.quality, .contact-channel').forEach((child, index) => {
      child.style.setProperty('--item-delay', `${index * 90}ms`);
      child.classList.add('micro-visible');
    });
  };

  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        revealElement(entry.target);
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.13,
      rootMargin: '0px 0px -70px 0px'
    });

    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach(revealElement);
  }

  /* =====================================================
     NAVEGAÇÃO ATIVA
  ===================================================== */

  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('nav a[href^="#"]');

  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        navLinks.forEach((link) => link.classList.remove('active'));

        document
          .querySelector(`nav a[href="#${entry.target.id}"]`)
          ?.classList.add('active');
      });
    }, {
      rootMargin: '-42% 0px -52% 0px'
    });

    sections.forEach((section) => sectionObserver.observe(section));
  }

  /* =====================================================
     CARDS COM PROFUNDIDADE E LUZ
  ===================================================== */

  const interactiveCards = document.querySelectorAll('.area-card, .dif-card');

  interactiveCards.forEach((card) => {
    card.classList.add('interactive-card');

    card.addEventListener('pointermove', (event) => {
      if (reduceMotion || !finePointer || !isDesktop()) return;

      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const rotateY = ((x / rect.width) - 0.5) * 4;
      const rotateX = ((y / rect.height) - 0.5) * -4;

      card.style.setProperty('--pointer-x', `${x}px`);
      card.style.setProperty('--pointer-y', `${y}px`);
      card.style.setProperty('--card-rx', `${rotateX}deg`);
      card.style.setProperty('--card-ry', `${rotateY}deg`);
      card.classList.add('card-hovered');
    });

    card.addEventListener('pointerleave', () => {
      card.classList.remove('card-hovered');
      card.style.removeProperty('--card-rx');
      card.style.removeProperty('--card-ry');
    });
  });

  /* =====================================================
     BOTÕES MAGNÉTICOS
  ===================================================== */

  document.querySelectorAll('.btn').forEach((button) => {
    button.classList.add('magnetic-button');

    button.addEventListener('pointermove', (event) => {
      if (reduceMotion || !finePointer || !isDesktop()) return;

      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;

      button.style.setProperty('--magnet-x', `${x * 0.08}px`);
      button.style.setProperty('--magnet-y', `${y * 0.12}px`);
    });

    button.addEventListener('pointerleave', () => {
      button.style.removeProperty('--magnet-x');
      button.style.removeProperty('--magnet-y');
    });
  });

  /* =====================================================
     PARALLAX SUAVE DAS IMAGENS
  ===================================================== */

  const parallaxImages = document.querySelectorAll('.parallax-image');
  let parallaxFrame = null;

  const updateParallax = () => {
    parallaxFrame = null;

    if (reduceMotion || !isDesktop()) {
      parallaxImages.forEach((image) => {
        image.style.removeProperty('--parallax-y');
      });
      return;
    }

    const viewportCenter = window.innerHeight / 2;

    parallaxImages.forEach((image) => {
      const container = image.parentElement;
      if (!container) return;

      const rect = container.getBoundingClientRect();

      if (rect.bottom < -100 || rect.top > window.innerHeight + 100) {
        return;
      }

      const elementCenter = rect.top + rect.height / 2;
      const speed = Number(image.dataset.parallaxSpeed || 0.02);
      const movement = (elementCenter - viewportCenter) * -speed;

      image.style.setProperty('--parallax-y', `${movement}px`);
    });
  };

  const requestParallax = () => {
    if (parallaxFrame !== null) return;
    parallaxFrame = window.requestAnimationFrame(updateParallax);
  };

  window.addEventListener('scroll', requestParallax, { passive: true });
  window.addEventListener('resize', requestParallax);
  requestParallax();

  /* =====================================================
     MONOGRAMA E HERO ACOMPANHANDO O CURSOR
  ===================================================== */

  const monogram = document.querySelector('.hero-monogram');
  const heroImageFrame = document.querySelector('.hero-right .photo-layered');

  window.addEventListener('pointermove', (event) => {
    if (reduceMotion || !finePointer || !isDesktop()) return;

    const normalizedX = event.clientX / window.innerWidth - 0.5;
    const normalizedY = event.clientY / window.innerHeight - 0.5;

    monogram?.style.setProperty('--mono-x', `${normalizedX * 22}px`);
    monogram?.style.setProperty('--mono-y', `${normalizedY * 18}px`);

    heroImageFrame?.style.setProperty('--hero-x', `${normalizedX * -9}px`);
    heroImageFrame?.style.setProperty('--hero-y', `${normalizedY * -7}px`);
  }, { passive: true });

  /* =====================================================
     CURSOR PERSONALIZADO
  ===================================================== */

  const cursorDot = document.querySelector('.cursor-dot');
  const cursorRing = document.querySelector('.cursor-ring');

  if (finePointer && !reduceMotion && cursorDot && cursorRing) {
    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;

    window.addEventListener('pointermove', (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;

      cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      document.body.classList.add('cursor-ready');
    }, { passive: true });

    const animateCursor = () => {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;

      cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      window.requestAnimationFrame(animateCursor);
    };

    animateCursor();

    document.querySelectorAll('a, button, input, select, textarea, .area-card').forEach((target) => {
      target.addEventListener('pointerenter', () => {
        document.body.classList.add('cursor-interactive');
      });

      target.addEventListener('pointerleave', () => {
        document.body.classList.remove('cursor-interactive');
      });
    });
  } else {
    cursorDot?.remove();
    cursorRing?.remove();
  }

  /* =====================================================
     BOTÃO VOLTAR AO TOPO
  ===================================================== */

  const backToTop = document.createElement('button');
  backToTop.type = 'button';
  backToTop.className = 'back-to-top';
  backToTop.setAttribute('aria-label', 'Voltar ao início da página');
  backToTop.innerHTML = `
    <svg viewBox="0 0 24 24" width="19" height="19"
      fill="none" stroke="currentColor" stroke-width="1.7"
      aria-hidden="true">
      <path d="M6 15l6-6 6 6"/>
    </svg>
  `;

  document.body.appendChild(backToTop);

  const updateBackToTop = () => {
    backToTop.classList.toggle('visible', window.scrollY > 650);
  };

  window.addEventListener('scroll', updateBackToTop, { passive: true });

  backToTop.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: reduceMotion ? 'auto' : 'smooth'
    });
  });

  updateBackToTop();

  /* =====================================================
     FORMULÁRIO PARA WHATSAPP
  ===================================================== */

  const contactForm = document.querySelector('.contact-form-wrap form');

  contactForm?.addEventListener('submit', () => {
    const button = contactForm.querySelector('button[type="submit"]');
    if (!button) return;

    button.classList.add('form-sent');
    window.setTimeout(() => button.classList.remove('form-sent'), 1600);
  });

  /* =====================================================
     LIMPEZA NO RESPONSIVO
  ===================================================== */

  window.addEventListener('resize', () => {
    if (isDesktop()) return;

    interactiveCards.forEach((card) => {
      card.classList.remove('card-hovered');
      card.style.removeProperty('--card-rx');
      card.style.removeProperty('--card-ry');
    });

    document.querySelectorAll('.magnetic-button').forEach((button) => {
      button.style.removeProperty('--magnet-x');
      button.style.removeProperty('--magnet-y');
    });

    monogram?.style.removeProperty('--mono-x');
    monogram?.style.removeProperty('--mono-y');
    heroImageFrame?.style.removeProperty('--hero-x');
    heroImageFrame?.style.removeProperty('--hero-y');
  });


  /* =====================================================
     REVEAL SEGURO DAS FOTOS SOBRE E CONTATO
  ===================================================== */
  const safeRevealPhotos = document.querySelectorAll('.reveal-photo');

  const showPhoto = (photo) => {
    photo.classList.add('photo-visible');
  };

  if ('IntersectionObserver' in window && !reduceMotion) {
    const safePhotoObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        showPhoto(entry.target);
        const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {

    if (entry.isIntersecting) {

      entry.target.classList.add("is-visible");

      // anima as letras novamente
      entry.target.querySelectorAll(".motion-letter").forEach((letter, i) => {
        letter.classList.remove("letter-visible");

        setTimeout(() => {
          letter.classList.add("letter-visible");
        }, i * 18);
      });

      // anima os filhos novamente
      entry.target.querySelectorAll(".stagger-visible").forEach(el => {
        el.classList.remove("stagger-visible");

        requestAnimationFrame(() => {
          el.classList.add("stagger-visible");
        });
      });

    } else {

      entry.target.classList.remove("is-visible");

      entry.target.querySelectorAll(".motion-letter").forEach(letter => {
        letter.classList.remove("letter-visible");
      });

      entry.target.querySelectorAll(".stagger-visible").forEach(el => {
        el.classList.remove("stagger-visible");
      });

    }

  });

}, {
  threshold: 0.18
});
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -40px 0px'
    });

    safeRevealPhotos.forEach((photo) => safePhotoObserver.observe(photo));
  } else {
    safeRevealPhotos.forEach(showPhoto);
  }


  /* =====================================================
     ACESSIBILIDADE — BAIXA LUMINOSIDADE / FOTOfOBIA
  ===================================================== */
  const accessibilityToggle = document.getElementById('accessibilityToggle');
  const accessibilityPanel = document.getElementById('accessibilityPanel');
  const photophobiaToggle = document.getElementById('photophobiaToggle');
  const motionToggle = document.getElementById('motionToggle');

  const setPreference = (key, enabled) => {
    try { localStorage.setItem(key, enabled ? '1' : '0'); } catch (_) {}
  };

  const getPreference = (key) => {
    try { return localStorage.getItem(key) === '1'; } catch (_) { return false; }
  };

  const updateOption = (button, enabled) => {
    if (!button) return;
    button.setAttribute('aria-pressed', String(enabled));
    const status = button.querySelector('.option-status');
    if (status) status.textContent = enabled ? 'ON' : 'OFF';
  };

  const applyPhotophobiaMode = (enabled) => {
    document.documentElement.classList.toggle('photophobia-mode', enabled);
    document.body.classList.toggle('photophobia-mode', enabled);
    updateOption(photophobiaToggle, enabled);
    setPreference('giovanna-photophobia-mode', enabled);
  };

  const applyMotionMode = (enabled) => {
    document.documentElement.classList.toggle('reduce-motion', enabled);
    updateOption(motionToggle, enabled);
    setPreference('giovanna-reduce-motion', enabled);
  };

  const savedPhotophobia = getPreference('giovanna-photophobia-mode');
  const savedMotion = getPreference('giovanna-reduce-motion');
  applyPhotophobiaMode(savedPhotophobia);
  applyMotionMode(savedMotion);

  accessibilityToggle?.addEventListener('click', () => {
    const willOpen = accessibilityPanel?.hasAttribute('hidden');
    if (!accessibilityPanel) return;

    if (willOpen) accessibilityPanel.removeAttribute('hidden');
    else accessibilityPanel.setAttribute('hidden', '');

    accessibilityToggle.setAttribute('aria-expanded', String(willOpen));
  });

  photophobiaToggle?.addEventListener('click', () => {
    applyPhotophobiaMode(!document.documentElement.classList.contains('photophobia-mode'));
  });

  motionToggle?.addEventListener('click', () => {
    applyMotionMode(!document.documentElement.classList.contains('reduce-motion'));
  });

  document.addEventListener('click', (event) => {
    if (!accessibilityPanel || accessibilityPanel.hasAttribute('hidden')) return;
    if (accessibilityPanel.contains(event.target) || accessibilityToggle?.contains(event.target)) return;
    accessibilityPanel.setAttribute('hidden', '');
    accessibilityToggle?.setAttribute('aria-expanded', 'false');
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    accessibilityPanel?.setAttribute('hidden', '');
    accessibilityToggle?.setAttribute('aria-expanded', 'false');
  });

});
