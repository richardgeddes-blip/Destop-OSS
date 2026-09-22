import os, json, sqlite3, re, hashlib, zipfile, time
from http.server import BaseHTTPRequestHandler, HTTPServer

BASE = os.path.expandvars(r'C:\Users\richa\DigitalLibrary')
DB = os.path.join(BASE, 'library_index.db')

def calculate_sha256(filepath):
    h = hashlib.sha256()
    try:
        with open(filepath, 'rb') as f:
            while chunk := f.read(8192):
                h.update(chunk)
        return h.hexdigest()
    except Exception:
        return ""

def run_init():
    os.makedirs(BASE, exist_ok=True)
    c = sqlite3.connect(DB)
    cur = c.cursor()
    cur.execute("PRAGMA journal_mode=WAL;")
    cur.execute('''
        CREATE TABLE IF NOT EXISTS digital_library (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            file_name TEXT UNIQUE,
            file_path TEXT,
            content_chunk TEXT,
            sha256 TEXT,
            trigger_tags TEXT,
            last_indexed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    cur.execute('''
        CREATE TABLE IF NOT EXISTS watchlist_ledger (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            claim TEXT,
            proof_source TEXT,
            status TEXT DEFAULT 'pending_verification',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    c.commit()
    c.close()

def verified_archive_file(source_file, archive_zip_path):
    """Safely archives a file with zipfile.testzip() validation before any deletion."""
    try:
        with zipfile.ZipFile(archive_zip_path, 'a', zipfile.ZIP_DEFLATED) as zf:
            zf.write(source_file, arcname=os.path.basename(source_file))
            # Critical Safety Gate: test integrity before touching source
            bad_file = zf.testzip()
            if bad_file is not None:
                raise RuntimeError(f"Zip corrupted during test: {bad_file}")
        
        # Sidecar sync
        sidecar_file = source_file + ".librarian.json"
        if os.path.exists(sidecar_file):
            try:
                os.remove(sidecar_file)
            except Exception:
                pass
        
        os.remove(source_file)
        return True
    except Exception as e:
        print(f"Safety Gate Tripped - Archive Aborted: {e}")
        return False

def run_scan():
    run_init()
    c = sqlite3.connect(DB)
    cur = c.cursor()
    monitored = [
        r'C:\Users\richa\DigitalLibrary',
        r'C:\Users\richa\Desktop',
        r'C:\Users\richa\Documents'
    ]
    for p in [os.path.expandvars(x) for x in monitored if os.path.exists(x)]:
        for r, _, fs in os.walk(p):
            for f in fs:
                if f.endswith(('.txt', '.md', '.json', '.docx', '.pdf')):
                    fp = os.path.join(r, f)
                    try:
                        clean = ""
                        if f.endswith(('.txt', '.md', '.json')):
                            with open(fp, 'r', encoding='utf-8', errors='ignore') as fo:
                                raw = fo.read()
                            clean = re.sub(r'\s+', ' ', raw).strip()
                        else:
                            clean = f"{f} located in {r}"

                        if not clean:
                            continue

                        words = re.findall(r'\b\w{4,}\b', clean.lower())
                        tags = ','.join(list(set(words))[:10])
                        sha = calculate_sha256(fp)
                        cur.execute('''
                            INSERT OR REPLACE INTO digital_library 
                            (file_name, file_path, content_chunk, sha256, trigger_tags) 
                            VALUES (?, ?, ?, ?, ?)
                        ''', (f, fp, clean[:4000], sha, tags))
                    except Exception:
                        pass
    c.commit()
    c.close()

class Proxy(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        if self.path in ('/api/status', '/status'):
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({
                'status': 'online',
                'port': 8080,
                'library_path': BASE,
                'database': 'library_index.db',
                'wal_mode': True
            }).encode('utf-8'))
            return
        self.send_response(404)
        self.end_headers()

    def do_POST(self):
        if self.path in ('/webhook/digital-me-voice', '/api/voice/recall'):
            length = int(self.headers.get('Content-Length', 0))
            raw_body = self.rfile.read(length).decode('utf-8')
            try:
                data = json.loads(raw_body)
            except Exception:
                data = {}
            query = data.get('raw_voice_input') or data.get('text', '')
            c = sqlite3.connect(DB)
            words = re.findall(r'\b\w+\b', query.lower())
            chunk = 'No records located.'
            file_name = 'library_index.db'
            tags = ['local_index']
            
            for w in words:
                row = c.cursor().execute(
                    'SELECT file_name, content_chunk, trigger_tags FROM digital_library WHERE trigger_tags LIKE ? OR file_name LIKE ? LIMIT 1', 
                    (f'%{w}%', f'%{w}%')
                ).fetchone()
                if row:
                    file_name = row[0]
                    chunk = row[1]
                    tags = row[2].split(',') if row[2] else []
                    break
            c.close()
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({
                'status': 'success',
                'matched_context': chunk,
                'answer': chunk,
                'source': file_name,
                'tags': tags[:4]
            }).encode('utf-8'))
            return
        
        self.send_response(404)
        self.end_headers()

if __name__ == '__main__':
    run_scan()
    print('🚀 Desktop OSS Core Running on http://127.0.0.1:8080...')
    print(f'📂 Library anchored at: {BASE}')
    HTTPServer(('', 8080), Proxy).serve_forever()
