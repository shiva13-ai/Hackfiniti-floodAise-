# Stage 1: Build Node.js frontend and server
FROM node:20-slim AS node-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Final image
FROM python:3.9-slim
WORKDIR /app

# Install Node.js runtime
RUN apt-get update && apt-get install -y curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY python-backend/requirements.txt ./python-backend/
RUN pip install --no-cache-dir -r python-backend/requirements.txt

# Copy python backend
COPY python-backend/ ./python-backend/

# Copy Node.js production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built assets from Stage 1
COPY --from=node-builder /app/dist ./dist
COPY --from=node-builder /app/server ./server
COPY --from=node-builder /app/shared ./shared

# Expose ports
EXPOSE 5000 8000

# Start script
COPY start.sh .
RUN chmod +x start.sh
CMD ["./start.sh"]
