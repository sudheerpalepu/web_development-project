# Deploy With Render and Vercel

Recommended setup:

- Backend: Render Web Service
- Frontend: Vercel
- Database: MongoDB Atlas

Do not commit real secrets. Add them in the Render and Vercel dashboards.

## 1. Push the project to GitHub

Render and Vercel can both deploy directly from GitHub. Commit and push the project first.

## 2. Deploy the backend on Render

1. Open Render.
2. Create a new Web Service from the GitHub repository.
3. Use these settings:

```text
Root Directory: backend
Runtime: Python
Build Command: pip install -r requirements.txt
Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

4. Add environment variables:

```text
MONGO_URI=your MongoDB connection string
DATABASE_NAME=career_guide_db
ADZUNA_APP_ID=your Adzuna app id
ADZUNA_APP_KEY=your Adzuna app key
ADZUNA_COUNTRY=gb
JWT_SECRET_KEY=your rotated secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
CORS_ORIGINS=http://localhost:5173
```

5. Deploy and copy the Render backend URL.

The backend URL should show this JSON at `/`:

```json
{"message":"Career Guide Dashboard API"}
```

## 3. Deploy the frontend on Vercel

1. Open Vercel.
2. Import the same GitHub repository.
3. Set the project root directory to `frontend`.
4. Vercel should detect Vite. The included `frontend/vercel.json` also sets the SPA rewrite.
5. Add this environment variable:

```text
VITE_API_BASE_URL=https://your-render-backend.onrender.com
```

6. Deploy and copy the Vercel frontend URL.

## 4. Update Render CORS

After Vercel gives you the frontend URL, update the backend environment variable on Render:

```text
CORS_ORIGINS=https://your-vercel-app.vercel.app
```

For local and deployed frontend access, use:

```text
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,https://your-vercel-app.vercel.app
```

Redeploy the Render backend after changing this.
