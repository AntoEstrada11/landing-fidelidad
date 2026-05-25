# --- Stage 1: build ---
    FROM node:22.12-alpine AS build

    WORKDIR /app
    
    COPY package.json package-lock.json ./
    RUN npm ci
    
    COPY . .
    
    ENV NODE_ENV=production
    ENV IGLESIAS_SOURCE=json
    
    RUN npm run build
    
    # --- Stage 2: runtime (Nitro) ---
    FROM node:22.12-alpine AS run
    
    WORKDIR /app
    
    ENV NODE_ENV=production
    ENV HOST=0.0.0.0
    ENV PORT=3000
    
    # Solo el output de Nitro (servidor Node)
    COPY --from=build /app/.output ./.output
    
    EXPOSE 3000
    
    HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
      CMD wget -qO- http://127.0.0.1:3000/api/iglesias > /dev/null || exit 1
    
    CMD ["node", ".output/server/index.mjs"]