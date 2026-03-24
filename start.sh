#!/bin/sh
# Start Python backend in background
cd /app/python-backend && uvicorn main:app --host 0.0.0.0 --port 8000 &
# Start Node.js server
cd /app && npm run start
