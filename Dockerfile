# Use a lightweight Nginx alpine image
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy app files to Nginx public server directory
COPY index.html style.css app.js /usr/share/nginx/html/

# Copy custom Nginx configuration to listen on port 8080 (Cloud Run default)
COPY default.conf /etc/nginx/conf.d/default.conf

# Expose port 8080
EXPOSE 8080

# Nginx runs automatically on container start
