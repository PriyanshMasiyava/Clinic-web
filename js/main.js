/* =============================================================
   SUJAL PHYSIO — Main Website JavaScript
   File: js/main.js
   Covers:
     - Mobile navigation toggle (hamburger)
     - Active nav link highlight on scroll
     - Scroll-to-top button
     - IntersectionObserver fade-in animations
     - FAQ accordion
     - Enquiry form validation → WhatsApp redirect
   ============================================================= */

'use strict';

/* ============================================================
   MOBILE NAV TOGGLE
   ============================================================ */
const navToggle  = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');

navToggle.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  navToggle.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', open);
});

/* Close mobile menu when any link is tapped */
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

/* ============================================================
   ACTIVE NAV LINK ON SCROLL
   ============================================================ */
const sections = document.querySelectorAll('section[id]');
const navAs    = document.querySelectorAll('.nav-links a, .mobile-menu a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 100) current = sec.id;
  });
  navAs.forEach(a => {
    a.style.color = a.getAttribute('href') === '#' + current
      ? 'var(--white)'
      : '';
  });
}, { passive: true });

/* ============================================================
   SCROLL-TO-TOP BUTTON
   ============================================================ */
const scrollTopBtn = document.getElementById('scrollTop');

window.addEventListener('scroll', () => {
  scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
}, { passive: true });

scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ============================================================
   FADE-IN ANIMATION (IntersectionObserver)
   ============================================================ */
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));

/* ============================================================
   FAQ ACCORDION
   One item open at a time; toggle on re-click.
   ============================================================ */
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item   = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');

    /* Close all open items */
    document.querySelectorAll('.faq-item.open').forEach(el => {
      el.classList.remove('open');
      el.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
    });

    /* Open clicked item if it was closed */
    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

/* ============================================================
   ENQUIRY FORM → WHATSAPP REDIRECT
   Validates name (min 2 chars) and Indian mobile number
   (10 digits starting with 6-9), then builds a pre-filled
   WhatsApp message and opens it in a new tab.
   ============================================================ */
const form       = document.getElementById('enquiryForm');
const formNotice = document.getElementById('formNotice');

/**
 * Toggle error state on a form field.
 * @param {string}  inputId  - id of the <input>/<textarea>/<select>
 * @param {string}  errId    - id of the error <span>
 * @param {boolean} show     - true = show error
 * @returns {boolean} show   - passthrough for hasError accumulation
 */
function showError(inputId, errId, show) {
  const input = document.getElementById(inputId);
  const err   = document.getElementById(errId);
  input.classList.toggle('error', show);
  err.classList.toggle('show', show);
  return show;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  let hasError = false;

  const fname    = document.getElementById('fname').value.trim();
  const fphone   = document.getElementById('fphone').value.trim();
  const fservice = document.getElementById('fservice').value;
  const fmsg     = document.getElementById('fmsg').value.trim();
  const phoneOk  = /^[6-9]\d{9}$/.test(fphone);

  if (showError('fname',  'fnameErr',  fname.length < 2)) hasError = true;
  if (showError('fphone', 'fphoneErr', !phoneOk))         hasError = true;

  if (!hasError) {
    /* Build a human-readable WhatsApp message from form data */
    const svc  = fservice ? '\nService: ' + fservice : '';
    const note = fmsg     ? '\nMessage: ' + fmsg     : '';
    const text = encodeURIComponent(
      'Hello Sujal, I would like to make an enquiry.\n\nName: ' + fname +
      '\nPhone: ' + fphone + svc + note
    );

    /* Show informational notice before redirecting */
    formNotice.classList.add('show');
    form.querySelector('[type=submit]').disabled = true;

    /* Open WhatsApp after a short pause so the user reads the notice */
    setTimeout(() => {
      window.open(
        'https://wa.me/918511057556?text=' + text,
        '_blank',
        'noopener,noreferrer'
      );
    }, 500);
  }
});

/* Clear error state when the user starts correcting a field */
['fname', 'fphone'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => {
    document.getElementById(id).classList.remove('error');
    const errEl = document.getElementById(id + 'Err');
    if (errEl) errEl.classList.remove('show');
    formNotice.classList.remove('show');
    form.querySelector('[type=submit]').disabled = false;
  });
});
