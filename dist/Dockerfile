# docker build -t jinbaole .


FROM nginx:alpine
# FROM registry.cn-hangzhou.aliyuncs.com/laizhan/nginx

# Create a directory for static files
WORKDIR /usr/share/nginx/html

# Copy static files to the Nginx web root
COPY ./dist .

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]