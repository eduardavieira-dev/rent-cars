FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn -B package

FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /app/target/*.jar /app/app.jar

EXPOSE 8080

ENV TZ=America/Sao_Paulo

ENTRYPOINT ["java", "-Duser.timezone=America/Sao_Paulo", "-jar", "/app/app.jar"]
