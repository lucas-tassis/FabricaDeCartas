# =========================================================
# Estágio 1: Compilação do Frontend React (Vite)
# =========================================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY backend/frontend/package*.json ./
RUN npm ci

COPY backend/frontend ./
RUN npm run build

# =========================================================
# Estágio 2: Compilação do Backend Spring Boot (Maven)
# =========================================================
FROM maven:3.9.9-eclipse-temurin-21 AS backend-builder
WORKDIR /app

COPY backend/pom.xml ./
COPY backend/src ./src

# Copiar estáticos do React gerados no Estágio 1
COPY --from=frontend-builder /app/src/main/resources/static ./src/main/resources/static

RUN mvn clean package -DskipTests

# =========================================================
# Estágio 3: Runtime de Produção (JRE 21 LTS)
# =========================================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=backend-builder /app/target/fabricadecartas-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8081

ENV PORT=8081

ENTRYPOINT ["java", "-jar", "app.jar"]
