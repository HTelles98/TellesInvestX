// Navegação móvel
const navToggleButton = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const themeToggle = document.getElementById('themeToggle');
// Número de WhatsApp destino no formato E.164 (ex.: 55DDDNUMERO)
const WHATSAPP_PHONE = '55061993534794';

if (navToggleButton && navMenu) {
  navToggleButton.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    navToggleButton.setAttribute('aria-expanded', String(isOpen));
  });
}

// Header reativo ao scroll
const onScrollHeader = () => {
  const scrolled = window.scrollY > 8;
  document.body.classList.toggle('scrolled', scrolled);
};
onScrollHeader();
window.addEventListener('scroll', onScrollHeader, { passive: true });

// Tema claro/escuro com persistência
const root = document.documentElement;
const userPref = localStorage.getItem('theme');
const systemPrefDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
if (userPref === 'dark' || (!userPref && systemPrefDark)) {
  root.setAttribute('data-theme', 'dark');
}
themeToggle?.addEventListener('click', () => {
  const isDark = root.getAttribute('data-theme') === 'dark';
  const next = isDark ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

// Scroll suave para âncoras
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', event => {
    const href = anchor.getAttribute('href');
    if (!href) return;
    const target = document.querySelector(href);
    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      navMenu?.classList.remove('open');
      navToggleButton?.setAttribute('aria-expanded', 'false');
    }
  });
});

// Highlighter da navegação por seção visível
const sectionIds = ['inicio','beneficios','sobre','solucoes','planos','depoimentos','contato'];
const navLinks = sectionIds
  .map(id => document.querySelector(`a[href="#${id}"]`))
  .filter(Boolean);

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const id = entry.target.id;
    const link = document.querySelector(`a[href="#${id}"]`);
    if (!link) return;
    if (entry.isIntersecting) {
      navLinks.forEach(l => l.classList?.remove('active'));
      link.classList.add('active');
    }
  });
}, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

sectionIds.forEach(id => {
  const el = document.getElementById(id);
  if (el) sectionObserver.observe(el);
});

// Ano atual no rodapé
const yearEl = document.getElementById('currentYear');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

// Interseção: revelar elementos on-scroll
const revealObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  }
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

// Aplica atraso escalonado em elementos revelados
document.querySelectorAll('.reveal').forEach((el, index) => {
  const delay = Math.min(index * 60, 420);
  el.style.transitionDelay = `${delay}ms`;
});

// Validação simples do formulário e simulação de envio
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!(contactForm instanceof HTMLFormElement)) return;

    const formData = new FormData(contactForm);
    const nome = String(formData.get('nome') || '').trim();
    const email = String(formData.get('email') || '').trim();

    if (!nome || !email) {
      setStatus('Por favor, informe nome e e-mail.', true);
      return;
    }

    const submitButton = contactForm.querySelector('button[type="submit"]');
    submitButton?.classList.add('loading');

    const telefone = String(formData.get('telefone') || '').trim();
    const mensagem = String(formData.get('mensagem') || '').trim();
    const prefixo = encodeURIComponent('[Lead TellesInvestX] ');
    const text = `${prefixo}Olá, sou ${encodeURIComponent(nome)}.%0A%0A${encodeURIComponent(mensagem) || encodeURIComponent('Gostaria de falar com um especialista.')}`;
   

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const waWebUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${text}`;
    const waAppUrl = `whatsapp://send?phone=${WHATSAPP_PHONE}&text=${text}`;

    setStatus('Abrindo WhatsApp…', false);
    try {
      const targetUrl = isMobile ? waAppUrl : waWebUrl;
      const newWindow = window.open(targetUrl, '_blank');
      if (!newWindow) {
        window.location.href = targetUrl;
      }
      contactForm.reset();
    } finally {
      submitButton?.classList.remove('loading');
    }
  });
}

function setStatus(message, isError) {
  if (!formStatus) return;
  formStatus.textContent = message;
  formStatus.style.color = isError ? '#b91c1c' : '#065f46';
}

function wait(ms) { return new Promise(res => setTimeout(res, ms)); }


