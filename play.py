#!/usr/bin/env python3
"""
Super Pixel Kart 3D — Local Launcher
Starts a lightweight local HTTP server and opens the 2-Player 3D Kart Racing Game in your default browser.
"""
import http.server
import os
import socketserver
import threading
import webbrowser

PORT = 8080


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass


def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("127.0.0.1", PORT), QuietHandler) as httpd:
        url = f"http://127.0.0.1:{PORT}/index.html"
        print("======================================================")
        print("  SUPER PIXEL KART 3D (2-Player + 6 AI Grand Prix)")
        print(f"  Running at: {url}")
        print("  Or open index.html directly in any web browser.")
        print("  Press Ctrl+C to stop the server.")
        print("======================================================")
        threading.Timer(0.4, lambda: webbrowser.open(url)).start()
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server. Thanks for playing!")


if __name__ == "__main__":
    main()
