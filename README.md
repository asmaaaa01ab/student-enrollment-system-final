# Student Enrollment System

Une application web de gestion des inscriptions étudiantes dans des cours choisis basée sur une **architecture microservices** avec Spring Boot, Spring Cloud Gateway, Eureka et JWT.

---

## Architecture

Le projet est composé de 7 microservices indépendants qui communiquent via un API Gateway central :

```
                                            ┌─────────────────┐
                                            │ Frontend (8084) │
                                            └────────┬────────┘
                                                    │
                                            ┌────────▼───────┐
                                            │  API Gateway   │  
                                            │  (JWT Filter)  │
                                            │     :8080      │
                                            └──┬──┬─────┬────┘
                                               │  │     │
                                ┌─────────────┘   │     └─────────────┐
                                │                 │                   │
                        ┌───────▼──────┐  ┌───────▼──┐  ┌──────────────▼────┐
                        │ Auth Service │  │ Student  │  │  Course Service   │
                        │    :8085     │  │  :8081   │  │      :8082        │
                        └──────────────┘  └──────────┘  └───────────────────┘
                                                                 │
                                                        ┌────────▼───────┐
                                                        │ Enrollment Svc │
                                                        │    :8083       │
                                                        └────────────────┘

                            ┌─────────────────────────────────────┐
                            │        Eureka Server  :8761         │  
                            └─────────────────────────────────────┘
        Eureka Server : joue le rôle d'annuaire, tous les services s'y enregistrent pour se trouver mutuellement.
```

### Microservices

| Service             | Port | Description                                     |
|---------------------|------|-------------------------------------------------|
| `eureka-server`     | 8761 | Service de découverte (Eureka)                  |
| `api-gateway`       | 8080 | Point d'entrée unique — routage et filtre JWT   |
| `auth-service`      | 8085 | Inscription, connexion, validation de token JWT |
| `student-service`   | 8081 | Gestion des profils étudiants                   |
| `course-service`    | 8082 | Gestion des cours disponibles                   |
| `enrollment-service`| 8083 | Gestion des inscriptions aux cours              |
| `frontend-service`  | 8084 | Interface web (Thymeleaf + JS)                  |

---

## Technologies

- **Java 17**
- **Spring Boot 3.2.0**
- **Spring Cloud Gateway** — routage et filtre d'authentification JWT
- **Spring Cloud Netflix Eureka** — découverte de services
- **Spring Data JPA / Hibernate** — persistance des données
- **Spring Security + JWT** — authentification sans état (stateless)
- **WebFlux (Reactor)** — communication réactive inter-services
- **MySQL** — base de données relationnelle (une base par service)
- **Thymeleaf** — moteur de templates pour le frontend
- **Maven** — gestion des dépendances

---

## Prérequis

- Java 17+
- Maven 3.8+
- MySQL 8+ (en cours d'exécution sur `localhost:3306`)
- Un compte MySQL avec les droits de création de bases de données

---

## Installation et démarrage

### 1. Cloner le dépôt

```bash
git clone <url-du-repo>
cd student-enrollment-system
```

### 2. Configurer MySQL

Les bases de données sont créées automatiquement au démarrage grâce à `createDatabaseIfNotExist=true`. Vérifiez simplement que MySQL tourne et que les identifiants correspondent dans les fichiers `application.properties` de chaque service.

Par défaut, l'utilisateur est `root` avec un mot de passe vide. Pour modifier :

```properties
# Exemple dans auth-service/src/main/resources/application.properties
spring.datasource.username=root
spring.datasource.password=votre_mot_de_passe
```

Les bases de données utilisées sont :

| Service            | Base de données  |
|--------------------|------------------|
| auth-service       | `db_auth`        |
| student-service    | `db_students`    |
| course-service     | `db_courses`     |
| enrollment-service | `db_enrollments` |

### 3. Démarrer les services (dans cet ordre)

```bash
# 1. Eureka Server (registre de services)
cd eureka-server && ./mvnw spring-boot:run

# 2. API Gateway
cd ../api-gateway && ./mvnw spring-boot:run

# 3. Services métier (dans n'importe quel ordre)
cd ../auth-service && ./mvnw spring-boot:run
cd ../student-service && ./mvnw spring-boot:run
cd ../course-service && ./mvnw spring-boot:run
cd ../enrollment-service && ./mvnw spring-boot:run

# 4. Frontend
cd ../frontend-service && ./mvnw spring-boot:run
```

### 4. Accéder à l'application

- **Interface web** : [http://localhost:8084](http://localhost:8084)
- **Eureka Dashboard** : [http://localhost:8761](http://localhost:8761)
- **API Gateway** : [http://localhost:8080](http://localhost:8080)

---

## API Endpoints

Toutes les requêtes passent par le **API Gateway** sur le port `8080`.

### Authentification (non protégé)

| Méthode | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Inscription d'un nouvel utilisateur |
| `POST` | `/auth/login` | Connexion — retourne un token JWT |
| `GET` | `/auth/validate?token=...` | Validation d'un token JWT |

### Étudiants ( JWT requis)

| Méthode  | Endpoint         | Description              |
|----------|------------------|--------------------------|
| `GET`    | `/students`      | Liste tous les étudiants |
| `GET`    | `/students/{id}` | Détails d'un étudiant    |
| `POST`   | `/students`      | Créer un profil étudiant |
| `PUT`    | `/students/{id}` | Modifier un étudiant     |
| `DELETE` | `/students/{id}` | Supprimer un étudiant    |

### Cours ( JWT requis)

| Méthode  | Endpoint        | Description          |
|----------|-----------------|----------------------|
| `GET`    | `/courses`      | Liste tous les cours |
| `GET`    | `/courses/{id}` | Détails d'un cours   |
| `POST`   | `/courses`      | Créer un cours       |
| `PUT`    | `/courses/{id}` | Modifier un cours    |
| `DELETE` | `/courses/{id}` | Supprimer un cours   |

### Inscriptions ( JWT requis)

| Méthode  | Endpoint              | Description                         |
|----------|-----------------------|-------------------------------------|
| `POST`   | `/enrollments`        | Inscrire un étudiant à un cours     |
| `GET`    | `/enrollments/{cnie}` | Voir les inscriptions d'un étudiant |
| `DELETE` | `/enrollments/{id}`   | Annuler une inscription             |
| `GET`    | `/enrollments/courses`| Liste des cours disponibles         |

---

## Sécurité

- L'authentification repose sur des **tokens JWT** (HS256).
- Le filtre `JwtAuthFilter` dans l'API Gateway intercepte toutes les requêtes vers `/students/**`, `/courses/**` et `/enrollments/**` et valide le token auprès de l'`auth-service`.
- Les routes `/auth/**` sont publiques.

---

## Structure du projet

```
student-enrollment-system/
├── eureka-server/
├── api-gateway/
├── auth-service/
├── student-service/
├── course-service/
├── enrollment-service/
└── frontend-service/
    └── src/main/resources/
        ├── templates/        # Pages Thymeleaf (login, register, home, 404 et 500 pour gestion des erreurs)
        └── static/           # CSS et JavaScript (auth, home, errors)
```

---

## Fonctionnalités principales

- Inscription et connexion sécurisées avec JWT
- Gestion complète des profils étudiants (CRUD)
- Gestion des cours avec capacité maximale (= 3) par cours 
- Inscription aux cours avec vérification des règles métier :
  - Cours complet (capacité maximale atteinte)
  - Déjà inscrit au même cours 
  - Délai d'annulation expiré (= 24h)
- Interface web responsive avec gestion des erreurs (pages 404 / 500)
