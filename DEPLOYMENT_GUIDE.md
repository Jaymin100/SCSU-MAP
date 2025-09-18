# 🚀 SCSU MAP Full-Stack Deployment Guide

## Overview
This guide will deploy your SCSU MAP application using **Option 1: Separate Services**:
- **Frontend**: Vercel (React Router v7)
- **Backend**: Railway (Express.js API)
- **Database**: Supabase (PostgreSQL)

---

## 📊 Step 1: Database Setup (Supabase)

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Sign in with GitHub
3. Click "New Project"
4. Choose organization (or create personal)
5. Fill in:
   - **Name**: `scsu-map-db`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
6. Click "Create new project"

### 1.2 Run Database Migration
1. In Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `database-migration.sql`
3. Paste and click **Run**
4. Verify tables were created in **Table Editor**

### 1.3 Get Database Credentials
1. Go to **Settings** → **Database**
2. Copy these values (you'll need them for Railway):
   - **Host**: `db.[your-project-ref].supabase.co`
   - **Database name**: `postgres`
   - **Username**: `postgres`
   - **Password**: (the one you created)
   - **Port**: `5432`

---

## 🔧 Step 2: Backend Setup (Railway)

### 2.1 Prepare Backend for Deployment
1. Go to [railway.app](https://railway.app)
2. Sign up/Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `SCSU-MAP` repository
5. Choose **Backend** folder as root directory

### 2.2 Configure Environment Variables
In Railway dashboard, go to **Variables** and add:
```
DB_USER=postgres
DB_HOST=db.[your-project-ref].supabase.co
DB_NAME=postgres
DB_PASSWORD=[your-supabase-password]
DB_PORT=5432
JWT_SECRET=[generate-a-random-string]
PORT=3001
NODE_ENV=production
```

### 2.3 Deploy Backend
1. Railway will automatically detect it's a Node.js project
2. It will run `npm install` and `npm start`
3. Wait for deployment to complete
4. Copy the **Railway URL** (e.g., `https://scsu-map-backend-production.up.railway.app`)

---

## 🌐 Step 3: Frontend Setup (Vercel)

### 3.1 Prepare Frontend
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Sign in with GitHub
3. Click "New Project" → Import from GitHub
4. Select your `SCSU-MAP` repository
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `Frontend/template`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build/client`

### 3.2 Configure Environment Variables
In Vercel dashboard, go to **Settings** → **Environment Variables**:
```
VITE_API_URL=https://your-railway-backend-url.up.railway.app
VITE_MAPBOX_TOKEN=your-mapbox-token
```

### 3.3 Deploy Frontend
1. Click "Deploy"
2. Wait for build to complete
3. Copy the **Vercel URL** (e.g., `https://scsu-map.vercel.app`)

---

## 🔗 Step 4: Connect Everything

### 4.1 Update Backend CORS
In your Railway backend, the CORS should allow your Vercel domain:
```javascript
app.use(cors({
  origin: ['https://your-app.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
```

### 4.2 Test the Integration
1. Visit your Vercel frontend URL
2. Try registering a new user
3. Check if data appears in Supabase dashboard
4. Test login functionality

---

## 🎯 Step 5: Production Optimizations

### 5.1 Custom Domain (Optional)
- **Vercel**: Add custom domain in project settings
- **Railway**: Upgrade to Pro plan for custom domains
- **SSL**: Both platforms provide automatic SSL

### 5.2 Environment Management
- Use different environment variables for dev/staging/production
- Keep secrets secure and never commit them to Git

### 5.3 Monitoring
- **Railway**: Built-in logs and metrics
- **Vercel**: Analytics and performance monitoring
- **Supabase**: Database monitoring and logs

---

## 🔧 Troubleshooting

### Common Issues:
1. **CORS Errors**: Check that your Vercel URL is in backend CORS settings
2. **Database Connection**: Verify Supabase credentials in Railway
3. **Build Failures**: Check Node.js version compatibility
4. **Environment Variables**: Ensure all required variables are set

### Debug Steps:
1. Check Railway logs for backend errors
2. Check Vercel build logs for frontend issues
3. Test API endpoints directly with Postman/curl
4. Verify database connection in Supabase dashboard

---

## 💰 Cost Breakdown (Free Tiers)

- **Supabase**: Free (500MB database, 50MB file storage)
- **Railway**: Free ($5 credit monthly, sleeps after inactivity)
- **Vercel**: Free (100GB bandwidth, unlimited personal projects)

**Total Monthly Cost**: $0 (within free tiers)

---

## 🚀 Next Steps

1. Set up monitoring and alerts
2. Configure backup strategies
3. Plan for scaling when you exceed free tiers
4. Set up CI/CD pipelines for automated deployments

---

**🎉 Congratulations! Your SCSU MAP is now live on the web!**
