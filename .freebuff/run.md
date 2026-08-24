# Bomberman Preview Server

## How to reproduce artifacts
No build step needed — pure static HTML + JS with ES modules.

## How to run the server
From the project root:
```bash
node .freebuff/serve.js 8099
```
This serves all static files with correct MIME types (critical for ES modules).
The server binds to `127.0.0.1:8099`.
