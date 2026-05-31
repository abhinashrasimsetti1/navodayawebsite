var API_BASE = (function() {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  return window.location.origin + '/api';
})();

// ─── HELPERS ─────────────────────────────────────────────────

function getToken() { return localStorage.getItem('jnv_admin_token'); }

function apiHeaders() {
  var h = { 'Content-Type': 'application/json' };
  var t = getToken();
  if (t) h['Authorization'] = 'Bearer ' + t;
  return h;
}

function api(path, method, body) {
  var opts = { method: method || 'GET', headers: apiHeaders() };
  if (body) opts.body = JSON.stringify(body);
  return fetch(API_BASE + path, opts).then(function(r) {
    if (r.status === 401) { doLogout(); throw new Error('Session expired'); }
    return r.json().then(function(d) { if (!r.ok) throw new Error(d.error || 'Request failed'); return d; });
  }).catch(function(e) {
    if (e.message === 'Session expired') throw e;
    throw new Error('Cannot connect to backend. Make sure Flask is running: python backend/app.py');
  });
}

function showToast(msg, type) {
  type = type || 'success';
  var c = document.getElementById('toastContainer');
  var t = document.createElement('div');
  t.className = 'toast toast-' + type;
  var icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-exclamation-triangle';
  t.innerHTML = '<i class="fas ' + icon + '"></i> ' + msg;
  c.appendChild(t);
  setTimeout(function() { t.style.opacity = '0'; t.style.transform = 'translateX(100%)'; t.style.transition = 'all 0.3s'; setTimeout(function() { c.removeChild(t); }, 300); }, 3000);
}

function showLoginError(msg) {
  var err = document.getElementById('loginError');
  var errText = document.getElementById('loginErrorText');
  if (err && errText) { err.classList.add('show'); errText.textContent = msg; }
}

// ─── AUTH ────────────────────────────────────────────────────

function doLogin(user, pass) {
  return api('/login', 'POST', { username: user, password: pass }).then(function(d) {
    localStorage.setItem('jnv_admin_token', d.token);
    localStorage.setItem('jnv_admin_user', d.username);
    return true;
  }).catch(function() { return false; });
}

function checkSession() { return getToken() ? localStorage.getItem('jnv_admin_user') : null; }

function doLogout() {
  var token = getToken();
  if (token) { try { api('/logout', 'POST'); } catch(e) {} }
  localStorage.removeItem('jnv_admin_token');
  localStorage.removeItem('jnv_admin_user');
  window.location.href = 'index.html';
}

// ─── MODAL HELPERS ───────────────────────────────────────────

function openModal(title, bodyHTML, actionsHTML) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = bodyHTML;
  document.querySelector('.modal-actions').innerHTML = actionsHTML || '';
  document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
}

// ─── PAGE-SPECIFIC ───────────────────────────────────────────

(function() {
  var page = window.location.pathname.split('/').pop();

  // ──── LOGIN PAGE ────
  if (page === 'index.html' || page === '' || page === 'admin' || page === 'admin/') {
    var loginForm = document.getElementById('loginForm');
    if (loginForm) {
      if (checkSession()) { window.location.href = 'dashboard.html'; return; }

      loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        var user = document.getElementById('loginUser').value.trim();
        var pass = document.getElementById('loginPass').value;
        var btn = document.getElementById('loginBtn');

        if (!user || !pass) { showLoginError('Please enter both username and password.'); return; }

        btn.disabled = true; btn.innerHTML = 'Signing In... <i class="fas fa-spinner fa-spin"></i>';

        doLogin(user, pass).then(function(ok) {
          if (ok) { window.location.href = 'dashboard.html'; }
          else {
            btn.disabled = false; btn.innerHTML = 'Sign In <i class="fas fa-arrow-right"></i>';
            showLoginError('Invalid username or password. Make sure the backend is running (python backend/app.py).');
          }
        });
      });
    }
    return;
  }

  // ──── DASHBOARD PAGE ────
  if (page === 'dashboard.html' || page === 'dashboard') {
    var session = checkSession();
    if (!session) { window.location.href = 'index.html'; return; }

    document.getElementById('sidebarUser').textContent = 'Welcome, ' + session;
    document.getElementById('headerUser').textContent = session;

    function handleLogout() { if (confirm('Are you sure you want to logout?')) doLogout(); }
    document.getElementById('sidebarLogout').addEventListener('click', handleLogout);
    document.getElementById('headerLogout').addEventListener('click', handleLogout);

    // ──── PANEL SWITCHING ────
    window.switchPanel = function(name) {
      document.querySelectorAll('.panel').forEach(function(p) { p.classList.remove('active'); });
      document.querySelectorAll('.sidebar-nav a').forEach(function(a) { a.classList.remove('active'); });
      var panel = document.getElementById('panel-' + name);
      if (panel) panel.classList.add('active');
      var navLink = document.querySelector('.sidebar-nav a[data-panel="' + name + '"]');
      if (navLink) navLink.classList.add('active');
      var titles = { overview: 'Overview', gallery: 'Gallery Manager', testimonials: 'Testimonials Manager', notices: 'Notices & Announcements', messages: 'Contact Messages', settings: 'Settings' };
      document.getElementById('pageTitle').textContent = titles[name] || 'Dashboard';
      if (name === 'overview') refreshStats();
      if (name === 'gallery') renderGallery();
      if (name === 'testimonials') renderTestimonials();
      if (name === 'notices') renderNotices();
      if (name === 'messages') renderMessages();
    };

    document.querySelectorAll('.sidebar-nav a[data-panel]').forEach(function(a) {
      a.addEventListener('click', function() { switchPanel(this.getAttribute('data-panel')); });
    });

    // ──── STATS ────
    function refreshStats() {
      api('/stats').then(function(d) {
        document.getElementById('statGallery').textContent = d.gallery;
        document.getElementById('statTestimonials').textContent = d.testimonials;
        document.getElementById('statNotices').textContent = d.notices;
        document.getElementById('statMessages').textContent = d.messages;
      }).catch(function(e) { showToast(e.message, 'error'); });
    }

    // ──── GALLERY ────
    function renderGallery() {
      api('/gallery').then(function(items) {
        var tbody = document.getElementById('galleryTableBody');
        if (items.length === 0) {
          tbody.innerHTML = '<tr><td colspan="4"><div class="empty-state"><i class="fas fa-images"></i>No gallery items yet.</div></td></tr>';
          return;
        }
        var cats = { campus: 'Campus', facilities: 'Facilities', events: 'Events' };
        tbody.innerHTML = items.map(function(item) {
          return '<tr><td><i class="fas fa-image" style="font-size:1.4rem;color:var(--primary-200);"></i></td><td>' + item.title + '</td><td><span class="badge badge-primary">' + (cats[item.category] || item.category) + '</span></td><td class="actions"><button class="btn btn-sm btn-danger" onclick="deleteGallery(\'' + item.id + '\')"><i class="fas fa-trash"></i></button></td></tr>';
        }).join('');
        refreshStats();
      }).catch(function(e) { showToast(e.message, 'error'); });
    }

    window.deleteGallery = function(id) {
      if (!confirm('Delete this photo?')) return;
      api('/gallery/' + id, 'DELETE').then(function() {
        renderGallery();
        showToast('Photo deleted successfully.', 'success');
      }).catch(function(e) { showToast(e.message, 'error'); });
    };

    window.openGalleryModal = function() {
      openModal(
        'Add Photo',
        '<div class="form-group"><label>Title</label><input type="text" id="gTitle" placeholder="Photo title"></div>' +
        '<div class="form-group"><label>Category</label><select id="gCategory"><option value="campus">Campus</option><option value="facilities">Facilities</option><option value="events">Events</option></select></div>' +
        '<div class="form-group"><label>Upload Image</label><input type="file" id="gFile" accept="image/*"></div>' +
        '<div id="gPreview" style="margin-top:8px;max-width:100%;max-height:140px;border-radius:8px;overflow:hidden;display:none;"><img id="gPreviewImg" style="width:100%;height:auto;display:block;"></div>',
        '<button class="btn btn-outline" onclick="closeModal()">Cancel</button>' +
        '<button class="btn btn-primary" onclick="saveGalleryItem()"><i class="fas fa-upload"></i> Upload & Save</button>'
      );
      document.getElementById('gFile').addEventListener('change', function() {
        var preview = document.getElementById('gPreview');
        var img = document.getElementById('gPreviewImg');
        if (this.files && this.files[0]) {
          var reader = new FileReader();
          reader.onload = function(e) { img.src = e.target.result; preview.style.display = 'block'; };
          reader.readAsDataURL(this.files[0]);
        } else { preview.style.display = 'none'; }
      });
    };

    window.saveGalleryItem = function() {
      var title = document.getElementById('gTitle').value.trim();
      var category = document.getElementById('gCategory').value;
      var fileInput = document.getElementById('gFile');
      if (!title || !fileInput.files.length) { showToast('Title and image file are required.', 'error'); return; }

      var btn = document.querySelector('.modal-actions .btn-primary');
      btn.disabled = true; btn.innerHTML = 'Uploading... <i class="fas fa-spinner fa-spin"></i>';

      var formData = new FormData();
      formData.append('file', fileInput.files[0]);

      fetch(API_BASE + '/upload', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + getToken() },
        body: formData
      }).then(function(r) { return r.json().then(function(d) { if (!r.ok) throw new Error(d.error); return d; }); })
      .then(function(uploadResult) {
        return api('/gallery', 'POST', { title: title, category: category, file: uploadResult.filename });
      })
      .then(function() {
        closeModal();
        renderGallery();
        showToast('Photo added successfully.', 'success');
      })
      .catch(function(e) {
        btn.disabled = false; btn.innerHTML = '<i class="fas fa-upload"></i> Upload & Save';
        showToast(e.message, 'error');
      });
    };

    // ──── TESTIMONIALS ────
    function renderTestimonials() {
      api('/testimonials').then(function(items) {
        var tbody = document.getElementById('testiTableBody');
        if (items.length === 0) {
          tbody.innerHTML = '<tr><td colspan="4"><div class="empty-state"><i class="fas fa-quote-right"></i>No testimonials yet.</div></td></tr>';
          return;
        }
        tbody.innerHTML = items.map(function(item) {
          return '<tr><td>' + item.name + '</td><td><span class="badge badge-primary">' + item.role + '</span></td><td style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + item.text + '</td><td class="actions"><button class="btn btn-sm btn-warning" onclick="editTesti(\'' + item.id + '\')"><i class="fas fa-edit"></i></button><button class="btn btn-sm btn-danger" onclick="deleteTesti(\'' + item.id + '\')"><i class="fas fa-trash"></i></button></td></tr>';
        }).join('');
        refreshStats();
      }).catch(function(e) { showToast(e.message, 'error'); });
    }

    window.deleteTesti = function(id) {
      if (!confirm('Delete this testimonial?')) return;
      api('/testimonials/' + id, 'DELETE').then(function() {
        renderTestimonials();
        showToast('Testimonial deleted.', 'success');
      }).catch(function(e) { showToast(e.message, 'error'); });
    };

    window.editTesti = function(id) {
      api('/testimonials').then(function(all) {
        var item = null;
        for (var i = 0; i < all.length; i++) { if (all[i].id === id) { item = all[i]; break; } }
        if (!item) return;
        openModal(
          'Edit Testimonial',
          '<div class="form-group"><label>Name</label><input type="text" id="tName" value="' + item.name.replace(/"/g, '&quot;') + '"></div>' +
          '<div class="form-group"><label>Role</label><input type="text" id="tRole" value="' + (item.role || '').replace(/"/g, '&quot;') + '"></div>' +
          '<div class="form-group"><label>Text</label><textarea id="tText" rows="3">' + item.text.replace(/"/g, '&quot;') + '</textarea></div>',
          '<button class="btn btn-outline" onclick="closeModal()">Cancel</button>' +
          '<button class="btn btn-primary" onclick="saveEditTesti(\'' + id + '\')"><i class="fas fa-save"></i> Update</button>'
        );
      }).catch(function(e) { showToast(e.message, 'error'); });
    };

    window.saveEditTesti = function(id) {
      var name = document.getElementById('tName').value.trim();
      var role = document.getElementById('tRole').value.trim();
      var text = document.getElementById('tText').value.trim();
      if (!name || !text) { showToast('Name and text required.', 'error'); return; }
      api('/testimonials/' + id, 'PUT', { name: name, role: role, text: text }).then(function() {
        closeModal();
        renderTestimonials();
        showToast('Testimonial updated.', 'success');
      }).catch(function(e) { showToast(e.message, 'error'); });
    };

    window.openTestiModal = function() {
      openModal(
        'Add Testimonial',
        '<div class="form-group"><label>Name</label><input type="text" id="tName" placeholder="Full name"></div>' +
        '<div class="form-group"><label>Role</label><input type="text" id="tRole" placeholder="e.g. Alumnus, Parent"></div>' +
        '<div class="form-group"><label>Text</label><textarea id="tText" rows="3" placeholder="Testimonial text"></textarea></div>',
        '<button class="btn btn-outline" onclick="closeModal()">Cancel</button>' +
        '<button class="btn btn-primary" onclick="saveTestiItem()"><i class="fas fa-plus"></i> Add</button>'
      );
    };

    window.saveTestiItem = function() {
      var name = document.getElementById('tName').value.trim();
      var role = document.getElementById('tRole').value.trim();
      var text = document.getElementById('tText').value.trim();
      if (!name || !text) { showToast('Name and text required.', 'error'); return; }
      api('/testimonials', 'POST', { name: name, role: role, text: text }).then(function() {
        closeModal();
        renderTestimonials();
        showToast('Testimonial added.', 'success');
      }).catch(function(e) { showToast(e.message, 'error'); });
    };

    // ──── NOTICES ────
    function renderNotices() {
      api('/notices').then(function(items) {
        var tbody = document.getElementById('noticeTableBody');
        if (items.length === 0) {
          tbody.innerHTML = '<tr><td colspan="4"><div class="empty-state"><i class="fas fa-bullhorn"></i>No notices yet.</div></td></tr>';
          return;
        }
        tbody.innerHTML = items.map(function(item) {
          var badge = item.status === 'active' ? 'badge-green' : 'badge-red';
          var label = item.status === 'active' ? 'Active' : 'Inactive';
          return '<tr><td>' + item.title + '</td><td>' + item.date + '</td><td><span class="badge ' + badge + '">' + label + '</span></td><td class="actions"><button class="btn btn-sm btn-warning" onclick="toggleNotice(\'' + item.id + '\')"><i class="fas fa-sync"></i></button><button class="btn btn-sm btn-danger" onclick="deleteNotice(\'' + item.id + '\')"><i class="fas fa-trash"></i></button></td></tr>';
        }).join('');
        refreshStats();
      }).catch(function(e) { showToast(e.message, 'error'); });
    }

    window.toggleNotice = function(id) {
      api('/notices/' + id, 'PUT', { status: 'toggled' }).then(function() {
        renderNotices();
        showToast('Notice status toggled.', 'success');
      }).catch(function(e) { showToast(e.message, 'error'); });
    };

    window.deleteNotice = function(id) {
      if (!confirm('Delete this notice?')) return;
      api('/notices/' + id, 'DELETE').then(function() {
        renderNotices();
        showToast('Notice deleted.', 'success');
      }).catch(function(e) { showToast(e.message, 'error'); });
    };

    window.openNoticeModal = function() {
      var today = new Date().toISOString().split('T')[0];
      openModal(
        'Add Notice',
        '<div class="form-group"><label>Title</label><input type="text" id="nTitle" placeholder="Notice title"></div>' +
        '<div class="form-group"><label>Date</label><input type="date" id="nDate" value="' + today + '"></div>',
        '<button class="btn btn-outline" onclick="closeModal()">Cancel</button>' +
        '<button class="btn btn-primary" onclick="saveNoticeItem()"><i class="fas fa-plus"></i> Add Notice</button>'
      );
    };

    window.saveNoticeItem = function() {
      var title = document.getElementById('nTitle').value.trim();
      var date = document.getElementById('nDate').value;
      if (!title) { showToast('Title is required.', 'error'); return; }
      api('/notices', 'POST', { title: title, date: date }).then(function() {
        closeModal();
        renderNotices();
        showToast('Notice added.', 'success');
      }).catch(function(e) { showToast(e.message, 'error'); });
    };

    // ──── MESSAGES ────
    function renderMessages() {
      api('/messages').then(function(items) {
        var tbody = document.getElementById('messageTableBody');
        if (items.length === 0) {
          tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><i class="fas fa-envelope"></i>No messages yet.</div></td></tr>';
          return;
        }
        tbody.innerHTML = items.map(function(item) {
          return '<tr><td>' + item.name + '</td><td>' + item.email + '</td><td style="max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + (item.subject || '—') + '</td><td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + item.message + '</td><td>' + (item.date || '—') + '</td><td class="actions"><button class="btn btn-sm btn-danger" onclick="deleteMessage(\'' + item.id + '\')"><i class="fas fa-trash"></i></button></td></tr>';
        }).join('');
        refreshStats();
      }).catch(function(e) { showToast(e.message, 'error'); });
    }

    window.deleteMessage = function(id) {
      if (!confirm('Delete this message?')) return;
      api('/messages/' + id, 'DELETE').then(function() {
        renderMessages();
        showToast('Message deleted.', 'success');
      }).catch(function(e) { showToast(e.message, 'error'); });
    };

    window.refreshMessages = function() { renderMessages(); showToast('Messages refreshed.', 'success'); };

    // ──── SETTINGS ────
    window.saveSettings = function() {
      var newUser = document.getElementById('settingsUser').value.trim();
      var newPass = document.getElementById('settingsPass').value.trim();
      if (!newUser) { showToast('Username cannot be empty.', 'error'); return; }
      var body = { username: newUser };
      if (newPass) body.password = newPass;
      api('/settings', 'PUT', body).then(function() {
        localStorage.setItem('jnv_admin_user', newUser);
        document.getElementById('sidebarUser').textContent = 'Welcome, ' + newUser;
        document.getElementById('headerUser').textContent = newUser;
        document.getElementById('settingsPass').value = '';
        showToast('Settings saved successfully.', 'success');
      }).catch(function(e) { showToast(e.message, 'error'); });
    };

    // ──── MODAL CLOSE ────
    document.getElementById('modalOverlay').addEventListener('click', function(e) {
      if (e.target === this) this.classList.remove('active');
    });

    // Make closeModal global for onclick
    window.closeModal = closeModal;

    // ──── BACKEND CHECK ────
    function checkBackend() {
      fetch(API_BASE + '/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'check', password: 'check' }) })
        .then(function() {})
        .catch(function() {
          var banner = document.createElement('div');
          banner.id = 'backendBanner';
          banner.style.cssText = 'background:#FEF2F2;color:var(--danger);padding:12px 20px;font-size:0.85rem;display:flex;align-items:center;gap:10px;border-bottom:1px solid #FECACA;';
          banner.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Backend server not running. Start it with: <code style="background:#FEE;padding:2px 8px;border-radius:4px;">python backend/app.py</code> <button onclick="this.parentElement.remove()" style="margin-left:auto;background:none;border:none;cursor:pointer;color:var(--danger);font-size:1.1rem;">&times;</button>';
          document.querySelector('.main-area').insertBefore(banner, document.querySelector('.main-content'));
        });
    }

    // ──── INIT ────
    checkBackend();
    refreshStats();
    renderGallery();
    renderTestimonials();
    renderNotices();
    renderMessages();
  }
})();
