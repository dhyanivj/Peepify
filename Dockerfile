# Use lightweight official Node.js 20 image
FROM node:20-alpine

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the remaining project files
COPY . .

# Build the Next.js application for production
RUN npm run build

# Next.js production runs on port 3000 by default
EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

# Start Next.js server
CMD ["npm", "run", "start"]
