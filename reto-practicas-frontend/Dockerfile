# Build stage
FROM node:18 as build
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build --prod

# Production stage
FROM nginx:alpine
# Cambia el nombre aquí si tu carpeta en dist tiene otro nombre (debe coincidir con tu "outputPath" en angular.json)
COPY --from=build /app/dist/reto-practicas-frontend /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
