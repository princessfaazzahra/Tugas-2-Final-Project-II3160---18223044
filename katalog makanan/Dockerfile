FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

COPY *.js ./

EXPOSE 3012

# Start app
CMD ["node", "index.js"]