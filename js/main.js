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

  // ---- GALLERY FILTER ----
  var filterBtns = document.querySelectorAll('.gallery-filter button');
  var galleryItems = document.querySelectorAll('.g-item');

  filterBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      filterBtns.forEach(function(b) { b.classList.remove('active'); });
      this.classList.add('active');
      var filter = this.getAttribute('data-filter');
      galleryItems.forEach(function(item) {
        item.style.display = (filter === 'all' || item.getAttribute('data-category') === filter) ? 'block' : 'none';
      });
    });
  });

  // ---- LIGHTBOX ----
  var lightbox = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbTitle = document.getElementById('lbTitle');
  var lbCategory = document.getElementById('lbCategory');
  var lbCounter = document.getElementById('lbCounter');
  var lbClose = document.getElementById('lbClose');
  var lbPrev = document.getElementById('lbPrev');
  var lbNext = document.getElementById('lbNext');
  var currentIndex = 0;

  var galleryData = [];

  function buildGalleryData() {
    galleryData = [];
    galleryItems.forEach(function(item) {
      if (item.style.display !== 'none') {
        var labelEl = item.querySelector('.g-overlay span');
        galleryData.push({
          img: item.getAttribute('data-img') || '',
          title: labelEl ? labelEl.textContent : 'Photo',
          category: item.getAttribute('data-category') || 'general'
        });
      }
    });
  }

  function openLightbox(index) {
    buildGalleryData();
    if (galleryData.length === 0) return;
    if (index < 0) index = galleryData.length - 1;
    if (index >= galleryData.length) index = 0;
    currentIndex = index;
    var data = galleryData[currentIndex];
    lbImg.src = data.img;
    lbImg.alt = data.title;
    lbTitle.textContent = data.title;
    lbCategory.textContent = data.category.charAt(0).toUpperCase() + data.category.slice(1);
    lbCounter.textContent = (currentIndex + 1) + ' / ' + galleryData.length;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  galleryItems.forEach(function(item, i) {
    item.addEventListener('click', function() {
      galleryItems.forEach(function(g) { g.style.display = 'block'; });
      filterBtns.forEach(function(b) { b.classList.remove('active'); });
      document.querySelector('.gallery-filter button[data-filter="all"]').classList.add('active');
      openLightbox(i);
    });
  });

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', function() { openLightbox(currentIndex - 1); });
  lbNext.addEventListener('click', function() { openLightbox(currentIndex + 1); });
  document.addEventListener('keydown', function(e) {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') openLightbox(currentIndex - 1);
    if (e.key === 'ArrowRight') openLightbox(currentIndex + 1);
  });
  lightbox.addEventListener('click', function(e) {
    if (e.target === this) closeLightbox();
  });

  // ---- CONTACT FORM ----
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var btn = this.querySelector('.btn');
      var orig = btn.innerHTML;
      btn.innerHTML = 'Sending... <i class="fas fa-spinner fa-spin"></i>';
      btn.disabled = true;

      var inputs = this.querySelectorAll('input, textarea');
      var msg = { id: Date.now().toString(36) + Math.random().toString(36).substr(2,4), date: new Date().toLocaleDateString() };
      if (inputs[0]) msg.name = inputs[0].value;
      if (inputs[1]) msg.email = inputs[1].value;
      if (inputs[2]) msg.subject = inputs[2].value;
      if (inputs[3]) msg.message = inputs[3].value;

      setTimeout(function() {
        try {
          fetch(API_BASE + '/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(msg)
          }).catch(function() {});
        } catch(e) {}
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

  // ---- DYNAMIC CONTENT FROM API ----
  var API_BASE = (function() {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
    return window.location.origin + '/api';
  })();

  function apiAvailable() {
    return fetch(API_BASE + '/gallery', { method: 'HEAD' }).then(function() { return true; }).catch(function() { return false; });
  }

  function loadGallery() {
    fetch(API_BASE + '/gallery').then(function(r) { return r.json(); }).then(function(items) {
      if (!items || !items.length) return;
      var grid = document.getElementById('galleryGrid');
      if (!grid) return;
      grid.innerHTML = '';
      var cats = { campus: 'Campus', facilities: 'Facilities', events: 'Events' };
      items.forEach(function(item) {
        var div = document.createElement('div');
        div.className = 'g-item';
        var cat = item.category || 'campus';
        div.setAttribute('data-category', cat);
        // Determine image path
        var imgPath;
        if (item.file && item.file.indexOf('.') > -1) {
          imgPath = 'assets/uploads/' + item.file;
        } else {
          imgPath = (item.file || 'library') + '.jpg';
        }
        div.setAttribute('data-img', imgPath);
        var catLabel = cats[cat] || cat;
        div.innerHTML = '<div class="g-bg"><i class="fas fa-image"></i></div><div class="g-thumb" style="background-image:url(' + imgPath + ');background-size:cover;background-position:center;"></div><div class="g-overlay"><span>' + item.title + '</span></div>';
        grid.appendChild(div);
      });
      // Rebind gallery click events
      var newItems = document.querySelectorAll('.g-item');
      galleryItems = newItems;
      newItems.forEach(function(item, i) {
        item.addEventListener('click', function() {
          document.querySelectorAll('.g-item').forEach(function(g) { g.style.display = 'block'; });
          document.querySelectorAll('.gallery-filter button').forEach(function(b) { b.classList.remove('active'); });
          var allBtn = document.querySelector('.gallery-filter button[data-filter="all"]');
          if (allBtn) allBtn.classList.add('active');
          var visible = Array.from(document.querySelectorAll('.g-item'));
          var idx = visible.indexOf(item);
          openLightbox(idx);
        });
      });
    }).catch(function() {});
  }

  function loadTestimonials() {
    fetch(API_BASE + '/testimonials').then(function(r) { return r.json(); }).then(function(items) {
      if (!items || !items.length) return;
      var track = document.getElementById('testiTrack');
      if (!track) return;
      track.innerHTML = '';
      items.forEach(function(item) {
        var initial = (item.name || '?').charAt(0).toUpperCase();
        var card = document.createElement('div');
        card.className = 'testi-float-card';
        card.innerHTML =
          '<div class="tfc-icon">' + initial + '</div>' +
          '<div class="tfc-text"><p>"' + item.text + '"</p><strong>' + item.name + '</strong><span>' + (item.role || '') + '</span></div>';
        track.appendChild(card);
      });
      var clone = track.innerHTML;
      track.innerHTML = track.innerHTML + clone;
    }).catch(function() {});
  }

  function loadNotices() {
    fetch(API_BASE + '/notices').then(function(r) { return r.json(); }).then(function(items) {
      if (!items || !items.length) return;
      var active = items.filter(function(n) { return n.status === 'active'; });
      if (!active.length) return;
      // Header bar (only create once)
      if (header && !document.getElementById('noticeBar')) {
        var bar = document.createElement('div');
        bar.id = 'noticeBar';
        bar.style.cssText = 'background:var(--primary-500);color:var(--white);text-align:center;padding:6px 16px;font-size:0.78rem;font-weight:500;position:relative;z-index:999;';
        bar.innerHTML = '<i class="fas fa-bullhorn" style="margin-right:8px;"></i> ' +
          active.map(function(n) { return n.title + (n.date ? ' (' + n.date + ')' : ''); }).join(' &nbsp;·&nbsp; ');
        header.parentNode.insertBefore(bar, header);
      }
      // Notices section
      var section = document.getElementById('notices');
      var list = document.getElementById('noticesList');
      if (section && list) {
        section.style.display = '';
        list.innerHTML = active.map(function(n) {
          return '<div class="notice-item"><div class="notice-date">' + (n.date || '') + '</div><div class="notice-content"><h4>' + n.title + '</h4></div></div>';
        }).join('');
      }
    }).catch(function() {});
  }

  setTimeout(function() {
    apiAvailable().then(function(available) {
      if (available) {
        loadGallery(); loadTestimonials(); loadNotices();
        // Auto-refresh every 15 seconds (silent update)
        setInterval(function() {
          loadGallery(); loadTestimonials(); loadNotices();
        }, 15000);
      }
    });
  }, 500);

});
