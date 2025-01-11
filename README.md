
Social Media Microservices Application

-> OVERVIEW
A scalable social media platform built with microservices architecture to ensure modularity, 
scalability, and seamless user experience. Each microservice operates independently to handle specific 
functionalities like user authentication, post management, media handling, and search.


-> TECH STACK
Backend Development : 
➡️ Node.js: Server-side JavaScript runtime.
➡️ Express.js: Framework for building RESTful APIs.
➡️ RabbitMQ: Message broker for asynchronous communication.
➡️ Redis: Caching and rate limiting.
➡️ JWT: Secure authentication.

-> DATABASE
➡️ MongoDB: NoSQL database for flexible schema design.

-> DevOps & Deployment
➡️ Docker: Containerization for environment consistency.

-> Microservices
1.API Gateway : 
➡️ Routes requests to appropriate services.
➡️ Implements rate limiting using Redis.

2.Identity Service : 
➡️ Handles user authentication and authorization with JWT.
➡️ Manages roles and permissions.

3.Post Service :
➡️ CRUD operations for user posts.
➡️ Database integration with MongoDB.

4.Media Service :
➡️ Handles file uploads and media management.

5.Search Service :
➡️ Provides advanced search functionalities with filtering and sorting.

-> Setup
Prerequisites
Node.js (>= 16.x)
Docker
MongoDB

-> Installation
1. Clone the repository:
   git clone https://github.com/htiwari578/Social-app-MICROSERVICES.git
   cd SM-MICROSERVICES
