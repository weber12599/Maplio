FROM ghcr.io/puppeteer/puppeteer:24.35.0

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci
COPY server.js .

EXPOSE 3000
CMD ["node", "server.js"]