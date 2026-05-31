import os, uuid, mimetypes, sys
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from database import get_db, init_db

app = Flask(__name__, static_folder=None)

# Project root — try multiple approaches
_PROJECT_ROOT = os.getcwd()
if not os.path.isfile(os.path.join(_PROJECT_ROOT, 'index.html')):
    _PROJECT_ROOT = os.path.dirname(os.path.dirname(__file__))
PROJECT_ROOT = _PROJECT_ROOT

UPLOAD_FOLDER = os.path.join(PROJECT_ROOT, 'assets', 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

try:
    init_db()
except Exception as e:
    print("DB init error:", e, file=sys.stderr)

# ─── AUTH HELPERS ───────────────────────────────────────────

def generate_token():
    return str(uuid.uuid4())

def login_required(f):
    def wrapper(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return jsonify({'error': 'No token provided'}), 401
        db = get_db()
        row = db.execute(
            'SELECT u.id, u.username FROM auth_tokens t JOIN users u ON t.user_id = u.id WHERE t.token = ?',
            (token,)
        ).fetchone()
        db.close()
        if not row:
            return jsonify({'error': 'Invalid or expired token'}), 401
        return f(*args, user={'id': row['id'], 'username': row['username']}, **kwargs)
    wrapper.__name__ = f.__name__
    return wrapper

# ─── AUTH ────────────────────────────────────────────────────

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '')

    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400

    db = get_db()
    user = db.execute('SELECT id, username, password FROM users WHERE username = ?', (username,)).fetchone()
    if not user or not check_password_hash(user['password'], password):
        db.close()
        return jsonify({'error': 'Invalid username or password'}), 401

    token = generate_token()
    db.execute('INSERT INTO auth_tokens (user_id, token) VALUES (?, ?)', (user['id'], token))
    db.commit()
    db.close()

    return jsonify({'token': token, 'username': user['username']})

@app.route('/api/logout', methods=['POST'])
@login_required
def api_logout(user):
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    db = get_db()
    db.execute('DELETE FROM auth_tokens WHERE token = ?', (token,))
    db.commit()
    db.close()
    return jsonify({'message': 'Logged out'})

@app.route('/api/me', methods=['GET'])
@login_required
def api_me(user):
    return jsonify(user)

# ─── SETTINGS ────────────────────────────────────────────────

@app.route('/api/settings', methods=['PUT'])
@login_required
def api_settings(user):
    data = request.get_json()
    db = get_db()
    if 'username' in data and data['username'].strip():
        db.execute('UPDATE users SET username = ? WHERE id = ?', (data['username'].strip(), user['id']))
    if 'password' in data and data['password'].strip():
        db.execute('UPDATE users SET password = ? WHERE id = ?', (generate_password_hash(data['password']), user['id']))
    db.commit()
    db.close()
    return jsonify({'message': 'Settings updated'})

# ─── GALLERY ────────────────────────────────────────────────

ALLOWED_EXT = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'}

def allowed_file(name):
    return '.' in name and name.rsplit('.', 1)[1].lower() in ALLOWED_EXT

@app.route('/api/upload', methods=['POST'])
@login_required
def api_upload(user):
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    f = request.files['file']
    if not f or not f.filename:
        return jsonify({'error': 'No file selected'}), 400
    if not allowed_file(f.filename):
        return jsonify({'error': 'File type not allowed. Use png, jpg, jpeg, gif, webp, svg'}), 400
    filename = str(uuid.uuid4())[:12] + '.' + f.filename.rsplit('.', 1)[1].lower()
    f.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    return jsonify({'filename': filename, 'url': '/assets/uploads/' + filename})

@app.route('/assets/uploads/<filename>')
def serve_upload(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/health')
def health():
    return jsonify({'status': 'ok', 'cwd': os.getcwd(), 'root': PROJECT_ROOT})

# ─── SERVE FRONTEND ──────────────────────────────────────────

@app.route('/')
def serve_index():
    try:
        return send_from_directory(PROJECT_ROOT, 'index.html')
    except Exception as e:
        print(f"serve_index error: {e}", file=sys.stderr)
        return jsonify({'error': str(e)}), 500

@app.route('/admin/')
@app.route('/admin')
def serve_admin():
    return send_from_directory(os.path.join(PROJECT_ROOT, 'admin'), 'index.html')

@app.route('/admin/dashboard')
@app.route('/admin/dashboard.html')
def serve_dashboard():
    return send_from_directory(os.path.join(PROJECT_ROOT, 'admin'), 'dashboard.html')

@app.route('/<path:path>')
def serve_frontend(path):
    if path.startswith('api/'):
        return jsonify({'error': 'Not found'}), 404
    filepath = os.path.join(PROJECT_ROOT, path)
    if os.path.isfile(filepath):
        return send_from_directory(PROJECT_ROOT, path)
    if os.path.isfile(filepath + '.html'):
        return send_from_directory(PROJECT_ROOT, path + '.html')
    return send_from_directory(PROJECT_ROOT, 'index.html')

@app.route('/api/gallery', methods=['GET'])
def api_get_gallery():
    db = get_db()
    rows = db.execute('SELECT * FROM gallery_items ORDER BY created_at DESC').fetchall()
    db.close()
    return jsonify([dict(r) for r in rows])

@app.route('/api/gallery', methods=['POST'])
@login_required
def api_add_gallery(user):
    data = request.get_json()
    if not data.get('title') or not data.get('file'):
        return jsonify({'error': 'Title and file are required'}), 400
    item_id = str(uuid.uuid4())[:8]
    db = get_db()
    db.execute(
        'INSERT INTO gallery_items (id, title, category, file) VALUES (?, ?, ?, ?)',
        (item_id, data['title'], data.get('category', 'campus'), data['file'])
    )
    db.commit()
    row = db.execute('SELECT * FROM gallery_items WHERE id = ?', (item_id,)).fetchone()
    db.close()
    return jsonify(dict(row)), 201

@app.route('/api/gallery/<item_id>', methods=['DELETE'])
@login_required
def api_delete_gallery(user, item_id):
    db = get_db()
    db.execute('DELETE FROM gallery_items WHERE id = ?', (item_id,))
    db.commit()
    db.close()
    return jsonify({'message': 'Deleted'})

# ─── TESTIMONIALS ───────────────────────────────────────────

@app.route('/api/testimonials', methods=['GET'])
def api_get_testimonials():
    db = get_db()
    rows = db.execute('SELECT * FROM testimonials ORDER BY created_at DESC').fetchall()
    db.close()
    return jsonify([dict(r) for r in rows])

@app.route('/api/testimonials', methods=['POST'])
@login_required
def api_add_testimonial(user):
    data = request.get_json()
    if not data.get('name') or not data.get('text'):
        return jsonify({'error': 'Name and text are required'}), 400
    item_id = str(uuid.uuid4())[:8]
    db = get_db()
    db.execute(
        'INSERT INTO testimonials (id, name, role, text) VALUES (?, ?, ?, ?)',
        (item_id, data['name'], data.get('role', ''), data['text'])
    )
    db.commit()
    row = db.execute('SELECT * FROM testimonials WHERE id = ?', (item_id,)).fetchone()
    db.close()
    return jsonify(dict(row)), 201

@app.route('/api/testimonials/<item_id>', methods=['PUT'])
@login_required
def api_update_testimonial(user, item_id):
    data = request.get_json()
    db = get_db()
    existing = db.execute('SELECT * FROM testimonials WHERE id = ?', (item_id,)).fetchone()
    if not existing:
        db.close()
        return jsonify({'error': 'Not found'}), 404
    db.execute(
        'UPDATE testimonials SET name=?, role=?, text=? WHERE id=?',
        (data.get('name', existing['name']), data.get('role', existing['role']), data.get('text', existing['text']), item_id)
    )
    db.commit()
    row = db.execute('SELECT * FROM testimonials WHERE id = ?', (item_id,)).fetchone()
    db.close()
    return jsonify(dict(row))

@app.route('/api/testimonials/<item_id>', methods=['DELETE'])
@login_required
def api_delete_testimonial(user, item_id):
    db = get_db()
    db.execute('DELETE FROM testimonials WHERE id = ?', (item_id,))
    db.commit()
    db.close()
    return jsonify({'message': 'Deleted'})

# ─── NOTICES ────────────────────────────────────────────────

@app.route('/api/notices', methods=['GET'])
def api_get_notices():
    db = get_db()
    rows = db.execute('SELECT * FROM notices ORDER BY created_at DESC').fetchall()
    db.close()
    return jsonify([dict(r) for r in rows])

@app.route('/api/notices', methods=['POST'])
@login_required
def api_add_notice(user):
    data = request.get_json()
    if not data.get('title'):
        return jsonify({'error': 'Title is required'}), 400
    item_id = str(uuid.uuid4())[:8]
    db = get_db()
    db.execute(
        'INSERT INTO notices (id, title, date, status) VALUES (?, ?, ?, ?)',
        (item_id, data['title'], data.get('date', datetime.now().strftime('%Y-%m-%d')), data.get('status', 'active'))
    )
    db.commit()
    row = db.execute('SELECT * FROM notices WHERE id = ?', (item_id,)).fetchone()
    db.close()
    return jsonify(dict(row)), 201

@app.route('/api/notices/<item_id>', methods=['PUT'])
@login_required
def api_update_notice(user, item_id):
    data = request.get_json()
    db = get_db()
    existing = db.execute('SELECT * FROM notices WHERE id = ?', (item_id,)).fetchone()
    if not existing:
        db.close()
        return jsonify({'error': 'Not found'}), 404
    if data.get('status') == 'toggled':
        new_status = 'inactive' if existing['status'] == 'active' else 'active'
        db.execute('UPDATE notices SET status=? WHERE id=?', (new_status, item_id))
    elif 'title' in data and data['title']:
        db.execute('UPDATE notices SET title=? WHERE id=?', (data['title'], item_id))
    db.commit()
    row = db.execute('SELECT * FROM notices WHERE id = ?', (item_id,)).fetchone()
    db.close()
    return jsonify(dict(row))

@app.route('/api/notices/<item_id>', methods=['DELETE'])
@login_required
def api_delete_notice(user, item_id):
    db = get_db()
    db.execute('DELETE FROM notices WHERE id = ?', (item_id,))
    db.commit()
    db.close()
    return jsonify({'message': 'Deleted'})

# ─── MESSAGES ───────────────────────────────────────────────

@app.route('/api/messages', methods=['GET'])
@login_required
def api_get_messages(user):
    db = get_db()
    rows = db.execute('SELECT * FROM messages ORDER BY created_at DESC').fetchall()
    db.close()
    return jsonify([dict(r) for r in rows])

@app.route('/api/messages', methods=['POST'])
def api_add_message():
    data = request.get_json()
    if not data.get('name') or not data.get('message'):
        return jsonify({'error': 'Name and message are required'}), 400
    item_id = str(uuid.uuid4())[:8]
    db = get_db()
    db.execute(
        'INSERT INTO messages (id, name, email, subject, message, date) VALUES (?, ?, ?, ?, ?, ?)',
        (item_id, data['name'], data.get('email', ''), data.get('subject', ''), data['message'], data.get('date', datetime.now().strftime('%Y-%m-%d')))
    )
    db.commit()
    row = db.execute('SELECT * FROM messages WHERE id = ?', (item_id,)).fetchone()
    db.close()
    return jsonify(dict(row)), 201

@app.route('/api/messages/<item_id>', methods=['DELETE'])
@login_required
def api_delete_message(user, item_id):
    db = get_db()
    db.execute('DELETE FROM messages WHERE id = ?', (item_id,))
    db.commit()
    db.close()
    return jsonify({'message': 'Deleted'})

# ─── STATS ──────────────────────────────────────────────────

@app.route('/api/stats', methods=['GET'])
@login_required
def api_stats(user):
    db = get_db()
    gallery_count = db.execute('SELECT COUNT(*) as c FROM gallery_items').fetchone()['c']
    testi_count = db.execute('SELECT COUNT(*) as c FROM testimonials').fetchone()['c']
    notices_count = db.execute('SELECT COUNT(*) as c FROM notices').fetchone()['c']
    messages_count = db.execute('SELECT COUNT(*) as c FROM messages').fetchone()['c']
    db.close()
    return jsonify({
        'gallery': gallery_count,
        'testimonials': testi_count,
        'notices': notices_count,
        'messages': messages_count
    })

# ─── RUN ─────────────────────────────────────────────────────

if __name__ == '__main__':
    host = os.environ.get('HOST', '0.0.0.0')
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', '').lower() in ('1', 'true', 'yes')
    print(f"JNV Website running on http://{host}:{port}")
    app.run(host=host, port=port, debug=debug)
