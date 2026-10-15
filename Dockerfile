FROM nginx:1.27-alpine

# 直接使用已构建产物（不在镜像内构建）
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
