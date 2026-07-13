# Socialize - Deployment Guide (Render & Aiven MongoDB)

This document provides step-by-step instructions for deploying the **Socialize** frontend and backend services separately on Render, and configuring the database using Aiven MongoDB.

---

## 1. Database Configuration (Aiven MongoDB)

Your Aiven MongoDB connection requires SSL and authentication source parameters. Because two different passwords were provided, please use the appropriate connection URI below:

### Option A: Using the password from the explicit password field (Recommended)
Use this URI for your `MONGO_URI` environment variable:
```text
mongodb://avnadmin:<PASSWORD_FROM_AIVEN>@db-practice-practice-management.k.aivencloud.com:25396/defaultdb?ssl=true&authSource=defaultdb
```

### Option B: Using the password from the service URL
If the password above fails, use this URI:
```text
mongodb://avnadmin:<ALTERNATIVE_PASSWORD_FROM_AIVEN>@db-practice-practice-management.k.aivencloud.com:25396/defaultdb?ssl=true&authSource=defaultdb
```

---

## 2. Separate Deployment on Render (Blueprint Way)

We have created a `render.yaml` file in the root of the project to allow automated "Blueprint" deployments on Render. This sets up both services in one go.

### Steps to Deploy:
1. Push your updated code (containing `render.yaml` and the deployment config changes) to your GitHub repository.
2. Go to the [Render Dashboard](https://dashboard.render.com/).
3. Click **New** -> **Blueprint**.
4. Connect your GitHub repository containing this project.
5. Render will automatically read `render.yaml` and prompt you for the required environment variables.
6. Provide the environment values:
   - For **socialize-backend**:
     - `MONGO_URI`: Enter the Aiven URI from Section 1 (Option A or Option B).
     - `CLIENT_URL`: Enter the final URL of your frontend (e.g., `https://socialize-frontend.onrender.com`).
     - (Optional, for other integrations): `EMAIL_USER`, `EMAIL_PASSWORD`, `CLOUDINARY_*`, `PAYMONGO_*`, `LOCATIONIQ_ACCESS_TOKEN`.
   - For **socialize-frontend**:
     - `VITE_API_URL`: Enter the final URL of your backend (e.g., `https://socialize-backend.onrender.com`).
     - (Optional): `VITE_LOCATIONIQ_ACCESS_TOKEN`, `VITE_UPLOAD_PRESET`, `VITE_CLOUD_NAME`, `VITE_CLOUDINARY_URL` (matching the backend's Cloudinary settings).
7. Click **Apply**. Render will build and deploy both services separately!

---

## 3. Manual Deployment on Render (Alternative)

If you prefer to configure the services manually on Render instead of using the Blueprint:

### A. Deploy Backend Web Service
1. Click **New** -> **Web Service** on Render.
2. Select your repository.
3. Configure:
   - **Name**: `socialize-backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `MONGO_URI`: `mongodb://avnadmin:<PASSWORD>@db-practice-practice-management.k.aivencloud.com:25396/defaultdb?ssl=true&authSource=defaultdb`
   - `CLIENT_URL`: (Your frontend URL, e.g., `https://socialize-frontend.onrender.com`)
   - `ACCESS_TOKEN_SECRET`: (Generate a long random string)
   - `REFRESH_TOKEN_SECRET`: (Generate a long random string)
   - Add other env variables from your `.env` as needed.

### B. Deploy Frontend Static Site
1. Click **New** -> **Static Site** on Render.
2. Select your repository.
3. Configure:
   - **Name**: `socialize-frontend`
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish directory**: `client/build`
4. Under **Redirects/Rewrites**, add a rewrite rule:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite`
5. Under **Environment Variables**, add:
   - `VITE_API_URL`: (Your backend URL, e.g., `https://socialize-backend.onrender.com`)
   - Add other frontend `VITE_` variables from client `.env` as needed.
