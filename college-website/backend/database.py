import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'jnv_admin.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()

    c.executescript('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS auth_tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            token TEXT UNIQUE NOT NULL,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS gallery_items (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            file TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS testimonials (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            role TEXT DEFAULT '',
            text TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS notices (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            date TEXT NOT NULL,
            status TEXT DEFAULT 'active',
            created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            subject TEXT DEFAULT '',
            message TEXT NOT NULL,
            date TEXT DEFAULT '',
            created_at TEXT DEFAULT (datetime('now'))
        );
    ''')

    # Seed default admin user if not exists
    row = c.execute("SELECT id FROM users WHERE username = ?", ('admin',)).fetchone()
    if not row:
        from werkzeug.security import generate_password_hash
        c.execute(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            ('admin', generate_password_hash('jnv2026'))
        )

    # Seed gallery if empty
    gal_count = c.execute("SELECT COUNT(*) as c FROM gallery_items").fetchone()['c']
    if gal_count == 0:
        seed_gallery = [
            ('g1', 'Main Building', 'campus', 'campus-main'),
            ('g2', 'Library', 'facilities', 'library'),
            ('g3', 'Science Lab', 'facilities', 'lab'),
            ('g4', 'Sports Ground', 'events', 'sports'),
        ]
        c.executemany("INSERT OR IGNORE INTO gallery_items (id, title, category, file) VALUES (?, ?, ?, ?)", seed_gallery)

    # Seed testimonials if empty
    testi_count = c.execute("SELECT COUNT(*) as c FROM testimonials").fetchone()['c']
    if testi_count == 0:
        seed_testi = [
            ('t1', 'Rahul Kumar', 'Alumnus · IIT Bombay', 'JNV gave me the foundation to crack IIT-JEE. The free residential education, dedicated teachers, and excellent facilities transformed my life completely.'),
            ('t2', 'Mrs. Sunita Devi', 'Parent', 'The holistic environment at JNV helped my daughter excel in both academics and sports. The teachers genuinely care about each student\'s growth.'),
            ('t3', 'Priya Sharma', 'Alumna · AIIMS Delhi', 'Studying at JNV was a privilege that shaped my entire career. The exposure, discipline, and quality of education are world-class.'),
            ('t4', 'Arun Verma', 'Alumnus · IIT Delhi', 'The teachers at JNV don\'t just teach — they mentor. The focus on holistic development alongside academics is what makes this institution truly special.'),
            ('t5', 'Mrs. Neha Gupta', 'Parent', 'JNV gave my son a disciplined yet nurturing environment. The residential program built his character and independence.'),
            ('t6', 'Vikram Singh', 'Alumnus · NIT Trichy', 'Being a Navodayan shaped who I am today. The exposure, the competitions, the sports — everything contributed to my growth.'),
        ]
        c.executemany("INSERT OR IGNORE INTO testimonials (id, name, role, text) VALUES (?, ?, ?, ?)", seed_testi)

    # Seed notices if empty
    notice_count = c.execute("SELECT COUNT(*) as c FROM notices").fetchone()['c']
    if notice_count == 0:
        seed_notices = [
            ('n1', 'JNVST 2026 Results Announced', '2026-05-15', 'active'),
            ('n2', 'Admissions Open for Class VI', '2026-06-01', 'active'),
            ('n3', 'Summer Vacation Schedule', '2026-04-28', 'active'),
        ]
        c.executemany("INSERT OR IGNORE INTO notices (id, title, date, status) VALUES (?, ?, ?, ?)", seed_notices)

    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()
    print("Database initialized at", DB_PATH)
