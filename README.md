### Backend README

```markdown
# Backend Project - OrderIt

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)
- [Related Projects](#related-projects)

## Introduction
OrderIt Backend is a Node.js and Express-based API server for managing dishes and user authentication. This repository contains the backend code for the OrderIt project.

## Features
- User authentication and registration with JWT
- CRUD operations for dishes
- Image upload and management with Cloudinary
- Secure password hashing

API Endpoints
User Routes

    POST /api/users/register - Register a new user
    POST /api/users/login - Login a user
    GET /api/users/logout - Logout a user

Dish Routes

    GET /api/dishes - Get all dishes
    POST /api/dishes - Add a new dish
    GET /api/dishes/:id - Get a dish by ID
    PUT /api/dishes/:id - Update a dish by ID
    DELETE /api/dishes/:id - Delete a dish by ID

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/backend-repo.git
   cd backend-repo

2. Clone another repository (for frontend): Refer my OrderIt-Front for frontend configuration

3. Create a .env file in the root directory and add the following variables:
  PORT=8000
  MONGO_URI=your_mongodb_connection_string
  ACCESS_TOKEN_SECRET=your_access_token_secret
  REFRESH_TOKEN_SECRET=your_refresh_token_secret
  CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
  CLOUDINARY_API_KEY=your_cloudinary_api_key
  CLOUDINARY_API_SECRET=your_cloudinary_api_secret
