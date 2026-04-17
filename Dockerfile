# Use Node 24 (latest LTS as of 2025)
FROM node:24-bullseye

# Set working directory
WORKDIR /app

# Copy full sources first to ensure build context includes all files
# (keeps things simple for Cloud Build/App Engine environment)
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Backend: install dependencies
WORKDIR /app/backend
RUN npm ci --omit=dev

# Frontend: install deps (use npm install to be tolerant of missing lockfile)
WORKDIR /app/frontend
RUN npm ci

# Build frontend (output will be at /app/frontend/dist)
WORKDIR /app/frontend
RUN npm run build

# Expose port and start backend
ENV PORT=8080
EXPOSE 8080
WORKDIR /app/backend
CMD ["npm", "start"]
