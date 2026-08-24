import http.server
import socketserver
import os
import sys

PORT = 4173
DIST_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "dist"))

class SPAServer(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIST_DIR, **kwargs)

    def do_GET(self):
        # Resolve target file path
        requested_path = self.path.split('?')[0].split('#')[0]
        full_path = os.path.join(DIST_DIR, requested_path.lstrip('/'))

        # If it's a specific static file (CSS, JS, SVG, HTML) that exists, serve normally
        if os.path.isfile(full_path):
            return super().do_GET()

        # If it's a client-side route (e.g. /devices, /threats, /ai-chat), fallback to index.html
        self.path = '/index.html'
        return super().do_GET()

if __name__ == '__main__':
    # Allow address reuse
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("0.0.0.0", PORT), SPAServer) as httpd:
        print(f"SentinelX SPA Server running at http://localhost:{PORT}")
        sys.stdout.flush()
        httpd.serve_forever()
