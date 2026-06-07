document.addEventListener('DOMContentLoaded', function() {

  // Scroll indicator
  var indicator = document.getElementById('scrollIndicator');
  window.addEventListener('scroll', function() {
    var s = document.body.scrollTop || document.documentElement.scrollTop;
    var h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    indicator.style.width = (s / h) * 100 + '%';
  });

  // Header
  var header = document.getElementById('header');
  var backTop = document.getElementById('backTop');
  window.addEventListener('scroll', function() {
    if (window.scrollY > 80) { header.classList.add('scrolled'); } else { header.classList.remove('scrolled'); }
    if (window.scrollY > 500) { backTop.classList.add('visible'); } else { backTop.classList.remove('visible'); }
  });
  backTop.addEventListener('click', function() { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  // Hamburger
  var hamburger = document.getElementById('hamburger');
  var navMenu = document.getElementById('navMenu');
  hamburger.addEventListener('click', function() {
    this.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  // Nav links
  document.querySelectorAll('.nav-link').forEach(function(link) {
    link.addEventListener('click', function() {
      document.querySelectorAll('.nav-link').forEach(function(l) { l.classList.remove('active'); });
      this.classList.add('active');
      navMenu.classList.remove('active');
      hamburger.classList.remove('active');
    });
  });

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(function(a) {
    a.addEventListener('click', function(e) {
      var t = document.querySelector(this.getAttribute('href'));
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });

  // ---- ANIMATED COUNTERS ----
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function animateCounters() {
    document.querySelectorAll('[data-count]').forEach(function(el) {
      if (el.dataset.counted) return;
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 80 && rect.bottom > 0) {
        el.dataset.counted = 'true';
        var target = parseInt(el.getAttribute('data-count'));
        var duration = 1800;
        var start = null;
        function step(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / duration, 1);
          el.textContent = Math.round(easeOutCubic(p) * target);
          if (p < 1) { requestAnimationFrame(step); } else { el.textContent = target; }
        }
        requestAnimationFrame(step);
      }
    });
  }
  window.addEventListener('scroll', animateCounters);
  animateCounters();

  // ---- SCROLL REVEAL ----
  var revealObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(function(el) { revealObs.observe(el); });

  // ---- TIMELINE REVEAL ----
  var tlObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) { e.target.classList.add('revealed'); tlObs.unobserve(e.target); }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.tl-item').forEach(function(el) { tlObs.observe(el); });

  // ---- TESTIMONIALS FLOAT (duplicate for seamless loop) ----
  var testiTrack = document.getElementById('testiTrack');
  if (testiTrack) {
    var cards = testiTrack.querySelectorAll('.testi-float-card');
    if (cards.length > 0) {
      var clone = testiTrack.innerHTML;
      testiTrack.innerHTML = clone + clone;
    }
  }

  // Gallery and lightbox code removed — photos will be added later

  // ---- CONTACT FORM ----
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var btn = this.querySelector('.btn');
      var orig = btn.innerHTML;
      btn.innerHTML = 'Sending... <i class="fas fa-spinner fa-spin"></i>';
      btn.disabled = true;

      setTimeout(function() {
        alert('Thank you! We will get back to you shortly.');
        contactForm.reset();
        btn.innerHTML = orig;
        btn.disabled = false;
      }, 1200);
    });
  }

  // ---- PARALLAX HOVER ON HERO ----
  window.addEventListener('mousemove', function(e) {
    var circles = document.querySelectorAll('.hero-circle');
    var x = e.clientX / window.innerWidth;
    var y = e.clientY / window.innerHeight;
    circles.forEach(function(c, i) {
      var s = (i + 1) * 6;
      c.style.transform = 'translate(' + (x * s - s / 2) + 'px, ' + (y * s - s / 2) + 'px)';
    });
  });

  // ---- STAGGER CARD ENTRANCE ----
  document.querySelectorAll('.acad-card, .ach-card, .cs-item, .cs-featured, .pillar-card').forEach(function(card) {
    card.style.opacity = '0';
    card.style.transform = 'translateY(24px)';
    var obs = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting) {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
        card.style.transition = 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
        obs.unobserve(card);
      }
    }, { threshold: 0.1 });
    obs.observe(card);
  });

});

// Note: This is a static site. The contact form shows a success message
// but does not send data anywhere. To receive actual submissions, sign up
// at https://formspree.io and replace the form action in index.html.
