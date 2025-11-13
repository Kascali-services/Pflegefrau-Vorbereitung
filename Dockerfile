# Multi-stage Dockerfile for Angular application

# Stage 1: Build the Angular application
# Using Node 20.19+ as required by Angular 19.2.x
# Using full image instead of slim for better compatibility
FROM node:20.19 AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies using npm install (package-lock causes issues with npm 10 in Docker)
RUN npm install

# Copy application source
COPY . .

# Build the application for production
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine AS production

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application from build stage
COPY --from=build /app/dist/pflegefachfrau-vorbereitung/browser /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
