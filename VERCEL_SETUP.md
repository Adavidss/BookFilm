# Vercel Deployment Setup Guide

## Adding Environment Variables to Vercel

To fix the "TMDB API key is not configured" error, you need to add your API keys to Vercel:

### Step-by-Step Instructions:

1. **Go to your Vercel Dashboard**
   - Visit [https://vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your `BookFilm` project

2. **Navigate to Settings**
   - Click on your project
   - Go to the "Settings" tab
   - Click on "Environment Variables" in the left sidebar

3. **Add TMDB API Key (Required)**
   - Click "Add New"
   - **Name**: `NEXT_PUBLIC_TMDB_API_KEY`
   - **Value**: Your TMDB API key
     - Get your key from: [https://www.themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
   - **Environment**: Select all (Production, Preview, Development)
   - Click "Save"

4. **Add Google Books API Key (Optional but Recommended)**
   - Click "Add New"
   - **Name**: `NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY`
   - **Value**: Your Google Books API key
     - Get your key from: [Google Cloud Console](https://console.cloud.google.com/)
     - Enable the "Books API" for your project
   - **Environment**: Select all (Production, Preview, Development)
   - Click "Save"

5. **Redeploy Your Application**
   - Go to the "Deployments" tab
   - Click the three dots (⋯) on your latest deployment
   - Select "Redeploy"
   - Or push a new commit to trigger automatic redeployment

### Getting Your API Keys

#### TMDB API Key:
1. Go to [https://www.themoviedb.org/signup](https://www.themoviedb.org/signup)
2. Create a free account
3. Go to [API Settings](https://www.themoviedb.org/settings/api)
4. Request an API key (it's free)
5. Copy the API key

#### Google Books API Key:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable the "Books API"
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy the API key
6. (Optional) Restrict the API key to only the Books API for security

### Important Notes:

- Environment variables are case-sensitive
- Make sure the variable names match exactly: `NEXT_PUBLIC_TMDB_API_KEY` and `NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY`
- After adding variables, you must redeploy for them to take effect
- The `NEXT_PUBLIC_` prefix is required for Next.js to expose these variables to the browser

### Troubleshooting:

**Still seeing the error after adding variables?**
- Make sure you selected all environments (Production, Preview, Development)
- Redeploy your application after adding variables
- Check that the variable names are exactly correct (no typos)
- Verify your API keys are valid by testing them

**Books work but shows don't?**
- Check that `NEXT_PUBLIC_TMDB_API_KEY` is set correctly
- Verify your TMDB API key is active

**Shows work but books don't?**
- Google Books API works without a key but is rate-limited
- Add `NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY` for better performance
- Check browser console for rate limit errors

