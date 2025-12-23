# Deployment Guide

## Deploy to Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications. Follow these steps:

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Go to [Vercel](https://vercel.com)**
   - Sign up or log in with your GitHub account

2. **Import your GitHub repository**
   - Click "Add New Project"
   - Select your `BookFilm` repository
   - Click "Import"

3. **Configure Environment Variables**
   - In the project settings, go to "Environment Variables"
   - Add the following:
     - `NEXT_PUBLIC_TMDB_API_KEY` = your TMDB API key
     - `NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY` = your Google Books API key (optional)

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your app
   - You'll get a URL like `https://bookfilm.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd /Users/atli/Desktop/Coding/Gemini/Book-TV-Recommender
   vercel
   ```

4. **Add Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_TMDB_API_KEY
   vercel env add NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY
   ```

5. **Redeploy with environment variables**
   ```bash
   vercel --prod
   ```

### Custom Domain (Optional)

1. In Vercel dashboard, go to your project settings
2. Click "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions

## Deploy to GitHub Pages (Alternative)

GitHub Pages requires static export. This may limit some features:

1. **Update next.config.js** for static export:
   ```javascript
   const nextConfig = {
     output: 'export',
     images: {
       unoptimized: true,
     },
     // ... rest of config
   }
   ```

2. **Build and deploy**:
   ```bash
   npm run build
   # The output will be in the 'out' directory
   ```

3. **Use GitHub Actions** to automatically deploy on push

## Other Hosting Options

- **Netlify**: Similar to Vercel, supports Next.js
- **Railway**: Good for full-stack apps
- **Render**: Simple deployment platform
- **AWS Amplify**: For AWS users

## Important Notes

- **Environment Variables**: Make sure to set all required environment variables in your hosting platform
- **API Keys**: Never commit API keys to the repository. Always use environment variables.
- **Build Settings**: Most platforms auto-detect Next.js, but you may need to specify:
  - Build command: `npm run build`
  - Output directory: `.next` (for Vercel) or `out` (for static export)

