# Static-site container for Architecture Flow Visualizer
FROM nginx:alpine

# Copy custom NGINX config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static assets
COPY index.html /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/
COPY data/ /usr/share/nginx/html/data/

# NGINX default CMD runs the server (port 80)
EXPOSE 80