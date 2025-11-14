# Build stage
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

<<<<<<< HEAD
# Copy pom.xml
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy source code
COPY src ./src
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy JAR from build stage
COPY --from=build /app/target/*.jar app.jar

# Expose port
EXPOSE 8084

# Run application
ENTRYPOINT ["java", "-jar","app.jar"]
=======
# Copier pom.xml et télécharger les dépendances
COPY pom.xml .

# Télécharger les dépendances avec gestion d'erreur améliorée
RUN mvn dependency:resolve dependency:resolve-plugins -B || \
    mvn clean install -DskipTests -B || \
    echo "Continuing despite dependency warnings..."

# Copier le code source
COPY src ./src

# Builder l'application
RUN mvn clean package -DskipTests -B

# Runtime stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copier le JAR depuis le build stage
COPY --from=build /app/target/*.jar app.jar

# Le port sera défini par docker-compose via SERVER_PORT
EXPOSE 8084

# Démarrage avec optimisations JVM
ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-jar", "app.jar"]
>>>>>>> main
