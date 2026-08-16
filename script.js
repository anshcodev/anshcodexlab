const menuBtn = document.querySelector('.menu-btn');
const nav = document.querySelector('.nav');

menuBtn?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
});

nav?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuBtn?.setAttribute('aria-expanded', 'false');
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const loadScript = (src) => new Promise((resolve, reject) => {
  const s = document.createElement('script');
  s.src = src;
  s.onload = resolve;
  s.onerror = reject;
  document.head.appendChild(s);
});

async function setupQuoteForm() {
  const form = document.getElementById('quoteForm');
  const status = document.getElementById('formStatus');
  if (!form || !status) return;

  try {
    await loadScript('supabase-config.js');
    await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
  } catch (error) {
    console.error('Could not load Supabase:', error);
    status.textContent = 'Form service is temporarily unavailable.';
    return;
  }

  const client = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const payload = {
      name: String(data.get('name') || '').trim(),
      business: String(data.get('business') || '').trim(),
      email: String(data.get('email') || '').trim(),
      service: String(data.get('service') || '').trim(),
      budget: String(data.get('budget') || '').trim(),
      message: String(data.get('message') || '').trim()
    };

    status.textContent = 'Sending your project brief...';

    const { error } = await client.from('leads').insert(payload);

    if (error) {
      console.error('Lead submission failed:', error);
      status.textContent = 'Could not send your brief right now. Please try again.';
      return;
    }

    status.textContent = `Thanks, ${payload.name || 'there'}! Your project brief has been received.`;
    form.reset();
  });
}

setupQuoteForm();
