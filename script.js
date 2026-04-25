// ===== THEME TOGGLE =====
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme') || 'dark';
document.body.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
  const current = document.body.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.body.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  themeToggle.style.transform = 'rotate(360deg) scale(1.1)';
  setTimeout(() => { themeToggle.style.transform = ''; }, 400);
});

// ===== HERO PARTICLES =====
function createParticles() {
  const container = document.getElementById('heroParticles');
  if (!container) return;
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('span');
    const size = Math.random() * 4 + 2;
    const left = Math.random() * 100;
    const delay = Math.random() * 12;
    const duration = Math.random() * 8 + 8;
    const opacity = Math.random() * 0.5 + 0.1;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${left}%; bottom:-10px;
      animation-duration:${duration}s;
      animation-delay:${delay}s;
      opacity:${opacity};
    `;
    container.appendChild(p);
  }
}
createParticles();

// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
  updateActiveNav();
});


// ===== HAMBURGER MENU =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  const spans = hamburger.querySelectorAll('span');
  if (navLinks.classList.contains('open')) {
    spans[0].style.transform = 'translateY(7px) rotate(45deg)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
  } else {
    spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }
});

// Close menu on link click
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    const spans = hamburger.querySelectorAll('span');
    spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  });
});

// ===== ACTIVE NAV LINK =====
function updateActiveNav() {
  const sections = ['home','about','education','skills','projects','internship','contact'];
  let current = 'home';
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el && window.scrollY >= el.offsetTop - 120) current = id;
  });
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) link.classList.add('active');
  });
}

// Scroll reveal handled by the CSS class-based system below (stagger-child / reveal classes)

// ===== EDUCATION SCORE BARS ANIMATE =====
const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const bar = entry.target;
      const pct = bar.getAttribute('data-pct');
      setTimeout(() => { bar.style.width = pct + '%'; }, 200);
      barObserver.unobserve(bar);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.edu-score-bar').forEach(bar => barObserver.observe(bar));

// ===== EMAILJS CONFIG =====
// Sign up free at https://emailjs.com → Add Gmail service → Create template → paste IDs below
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';   // Account → API Keys
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';   // Email Services tab
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';  // Email Templates tab

try { emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY }); } catch(e) {}

// ===== CONTACT FORM =====
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
const sendBtn     = document.getElementById('sendMsgBtn');

// Field references
const fieldName  = document.getElementById('senderName');
const fieldEmail = document.getElementById('senderEmail');
const fieldSubj  = document.getElementById('subject');
const fieldMsg   = document.getElementById('message');

// Live validation helpers
function setFieldError(el, msg) {
  el.style.borderColor = '#ef4444';
  el.style.boxShadow  = '0 0 0 3px rgba(239,68,68,0.15)';
  let tip = el.parentElement.querySelector('.field-tip');
  if (!tip) { tip = document.createElement('span'); tip.className = 'field-tip'; el.parentElement.appendChild(tip); }
  tip.textContent = msg;
  tip.style.cssText = 'display:block;color:#ef4444;font-size:0.75rem;margin-top:4px;';
}
function clearFieldError(el) {
  el.style.borderColor = '';
  el.style.boxShadow   = '';
  const tip = el.parentElement.querySelector('.field-tip');
  if (tip) tip.remove();
}
[fieldName, fieldEmail, fieldSubj, fieldMsg].forEach(el => {
  el.addEventListener('input', () => clearFieldError(el));
});

function isValidEmail(email) {
  // Strong RFC-5322-inspired regex
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/.test(email);
}

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name  = fieldName.value.trim();
  const email = fieldEmail.value.trim();
  const subj  = fieldSubj.value.trim();
  const msg   = fieldMsg.value.trim();

  // Per-field validation
  let hasError = false;
  if (!name)  { setFieldError(fieldName, 'Please enter your name.'); hasError = true; }
  if (!email) { setFieldError(fieldEmail, 'Please enter your email.'); hasError = true; }
  else if (!isValidEmail(email)) { setFieldError(fieldEmail, 'Please enter a valid email address (e.g. user@gmail.com).'); hasError = true; }
  if (!subj)  { setFieldError(fieldSubj, 'Please enter a subject.'); hasError = true; }
  if (!msg)   { setFieldError(fieldMsg, 'Please write your message.'); hasError = true; }
  if (hasError) { shakeForm(); return; }

  sendBtn.querySelector('.btn-text').textContent = 'Sending...';
  sendBtn.disabled = true;

  const templateParams = {
    from_name:    name,
    from_email:   email,
    subject:      subj,
    message:      msg,
    to_email:     'pvrgroupp@gmail.com',
    reply_to:     email,
  };

  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
    contactForm.reset();
    showFormMsg('✅ Message sent! I\'ll get back to you soon.', '#22c55e');
  } catch (err) {
    console.error('EmailJS error:', err);
    // Fallback: open default mail client
    const mailBody = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${msg}`);
    window.open(`mailto:pvrgroupp@gmail.com?subject=${encodeURIComponent(subj)}&body=${mailBody}`);
    showFormMsg('📧 Opening your email app as fallback. Please send manually.', '#f59e0b');
  } finally {
    sendBtn.querySelector('.btn-text').textContent = 'Send Message';
    sendBtn.disabled = false;
  }
});

function showFormMsg(text, color) {
  formSuccess.textContent = text;
  formSuccess.style.color = color;
  formSuccess.style.borderColor = color.replace(')', ',0.3)').replace('rgb','rgba');
  formSuccess.style.background  = color.replace(')', ',0.1)').replace('rgb','rgba');
  formSuccess.classList.add('show');
  setTimeout(() => formSuccess.classList.remove('show'), 7000);
}

function shakeForm() {
  contactForm.style.animation = 'shake 0.4s ease';
  setTimeout(() => { contactForm.style.animation = ''; }, 500);
}

// Add shake keyframe dynamically
const style = document.createElement('style');
style.textContent = '@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-8px)} 75%{transform:translateX(8px)} }';
document.head.appendChild(style);

// ===== SMOOTH SCROLL for all anchor links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ===== HERO NAME TYPEWRITER EFFECT =====
window.addEventListener('load', () => {
  document.querySelector('.hero-content').style.animation = 'slideUp 0.8s ease forwards';
});

// ===== SKILL CARDS – ripple effect on click =====
document.querySelectorAll('.skill-card').forEach(card => {
  card.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    const rect = card.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.cssText = `
      position:absolute;width:${size}px;height:${size}px;
      border-radius:50%;background:rgba(124,58,237,0.25);
      top:${e.clientY - rect.top - size/2}px;
      left:${e.clientX - rect.left - size/2}px;
      transform:scale(0);animation:rippleAnim 0.5s ease forwards;
      pointer-events:none;
    `;
    card.style.position = 'relative';
    card.style.overflow = 'hidden';
    card.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

const rippleStyle = document.createElement('style');
rippleStyle.textContent = '@keyframes rippleAnim{to{transform:scale(2.5);opacity:0;}}';
document.head.appendChild(rippleStyle);

console.log('%c PVSP Portfolio Loaded ✅', 'color:#a855f7;font-weight:bold;font-size:16px;');



// ===== SCROLL PROGRESS BAR =====
(function() {
  const bar = document.getElementById('scrollProgress');
  function updateBar() {
    if (!bar) return;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const pct = total > 0 ? (window.scrollY / total) * 100 : 0;
    bar.style.width = Math.min(pct, 100) + '%';
  }
  window.addEventListener('scroll', updateBar, { passive: true });
  updateBar();
})();

// ===== CUSTOM CURSOR =====
(function() {
  const cur = document.getElementById('cursor');
  const ring = document.getElementById('cursorRing');
  if (!cur || !ring) return;
  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', function(e) {
    mx = e.clientX; my = e.clientY;
    cur.style.left = mx + 'px';
    cur.style.top  = my + 'px';
  }, { passive: true });
  function animRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animRing);
  }
  animRing();
  document.querySelectorAll('a,button,.skill-card,.project-card,.stat-card').forEach(function(el) {
    el.addEventListener('mouseenter', function() { cur.classList.add('cursor-hover'); ring.classList.add('cursor-hover'); });
    el.addEventListener('mouseleave', function() { cur.classList.remove('cursor-hover'); ring.classList.remove('cursor-hover'); });
  });
})();

// ===== TYPEWRITER EFFECT =====
(function() {
  var roles = ['Android Developer', 'Problem Solver', 'Tech Enthusiast', 'Kotlin Developer', 'App Creator'];
  var roleIdx = 0, charIdx = 0, deleting = false;
  var el = document.getElementById('typewriter');
  if (!el) return;
  function type() {
    var current = roles[roleIdx];
    if (!deleting) {
      charIdx++;
      el.textContent = current.slice(0, charIdx);
      if (charIdx === current.length) {
        deleting = true;
        setTimeout(type, 2000);
        return;
      }
    } else {
      charIdx--;
      el.textContent = current.slice(0, charIdx);
      if (charIdx === 0) {
        deleting = false;
        roleIdx = (roleIdx + 1) % roles.length;
      }
    }
    setTimeout(type, deleting ? 50 : 90);
  }
  setTimeout(type, 1600);
})();

// ===== COUNTER ANIMATION =====
(function() {
  var counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;
  var done = false;
  var statsEl = counters[0].closest('.hero-stats');
  if (!statsEl) return;
  var obs = new IntersectionObserver(function(entries) {
    if (entries[0].isIntersecting && !done) {
      done = true;
      counters.forEach(function(el) {
        var target   = parseFloat(el.dataset.count);
        var decimals = parseInt(el.dataset.decimal || '0');
        var suffix   = el.dataset.suffix || '';
        var start    = performance.now();
        var dur      = 1800;
        function step(now) {
          var p    = Math.min((now - start) / dur, 1);
          var ease = 1 - Math.pow(1 - p, 4);
          el.textContent = (target * ease).toFixed(decimals) + suffix;
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = target.toFixed(decimals) + suffix;
        }
        requestAnimationFrame(step);
      });
    }
  }, { threshold: 0.5 });
  obs.observe(statsEl);
})();

// ===== PROJECT CARD 3D TILT =====
document.querySelectorAll('.project-card').forEach(function(card) {
  card.addEventListener('mousemove', function(e) {
    var r    = card.getBoundingClientRect();
    var x    = e.clientX - r.left;
    var y    = e.clientY - r.top;
    var cx   = r.width  / 2;
    var cy   = r.height / 2;
    var rotX = ((y - cy) / cy) * -8;
    var rotY = ((x - cx) / cx) *  8;
    card.style.transform = 'perspective(800px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) translateZ(8px)';
  });
  card.addEventListener('mouseleave', function() {
    card.style.transform = '';
  });
});

// ===== STAGGER REVEAL on scroll =====
(function() {
  // Skill cards - staggered cascade
  document.querySelectorAll('.skill-card').forEach(function(el, i) {
    el.classList.add('stagger-child');
    el.style.transitionDelay = (i * 0.07) + 's';
  });
  // Project cards - staggered cascade
  document.querySelectorAll('.project-card').forEach(function(el, i) {
    el.classList.add('stagger-child');
    el.style.transitionDelay = (i * 0.12) + 's';
  });
  // Education cards - slide in from left
  document.querySelectorAll('.edu-card').forEach(function(el, i) {
    el.classList.add('reveal-left');
    el.style.transitionDelay = (i * 0.1) + 's';
  });
  // Section headers
  document.querySelectorAll('.section-header').forEach(function(el) {
    el.classList.add('reveal');
  });
  // About section
  document.querySelectorAll('.about-text-wrap').forEach(function(el) {
    el.classList.add('reveal-right');
  });
  document.querySelectorAll('.about-avatar-wrap').forEach(function(el) {
    el.classList.add('reveal-left');
  });
  // Internship card
  document.querySelectorAll('.intern-card').forEach(function(el) {
    el.classList.add('reveal');
  });
  // Contact wrapper
  document.querySelectorAll('.contact-wrapper').forEach(function(el) {
    el.classList.add('reveal');
  });

  // Observe all reveal elements
  var allReveal = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .stagger-child');
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
  allReveal.forEach(function(el) { obs.observe(el); });
})();

