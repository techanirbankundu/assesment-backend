# Production Setup Guide

## Environment Variables for Production

Create a `.env` file in your production backend with these variables:

```bash
# Environment
NODE_ENV=production

# Server
PORT=8000
HOST=0.0.0.0

# Database (Neon Serverless Postgres)
# Full connection string recommended
# Example: postgres://username:password@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
DB_URI=postgres://<USER>:<PASSWORD>@<HOST>/<DB>?sslmode=require

# Optional: split Neon variables (if you prefer assembling DB_URI in code/CI)
NEON_HOST=ep-xxxx.us-east-2.aws.neon.tech
NEON_DATABASE=neondb
NEON_USER=your_user
NEON_PASSWORD=your_password

# JWT Secrets (IMPORTANT: Use strong, unique secrets)
JWT_SECRET=your_super_strong_jwt_secret_here
JWT_REFRESH_SECRET=your_super_strong_refresh_secret_here
SESSION_SECRET=your_super_strong_session_secret_here

# CORS (IMPORTANT: Set your production frontend URL)
# For Vercel deployment, use your Vercel domain
CORS_ORIGIN=https://ragillyfrontend.vercel.app,https://ragilly-frontend.vercel.app

# Email (if using email features)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Your App Name
```

## Key Production Issues Fixed

### 1. Cookie Settings
- **SameSite**: Changed from `strict` to `none` in production for cross-origin requests
- **Secure**: Automatically set to `true` in production (requires HTTPS)

### 2. CORS Configuration
- **Multiple Origins**: Now supports comma-separated list of allowed origins
- **Credentials**: Properly configured for cookie-based authentication
- **Debugging**: Added logging for blocked origins

### 3. HTTPS Requirement
- **Cookies**: `secure: true` requires HTTPS in production
- **SameSite: none**: Also requires HTTPS

## Deployment Checklist

### Backend Deployment
1. ✅ Set `NODE_ENV=production`
2. ✅ Set `CORS_ORIGIN` to your frontend domain(s)
3. ✅ Use HTTPS for your backend domain
4. ✅ Set strong JWT secrets
5. ✅ Configure database connection
6. ✅ Run Drizzle migrations against Neon before switching traffic

### Frontend Deployment
1. ✅ Update API base URL to production backend
2. ✅ Ensure frontend is served over HTTPS
3. ✅ Test cookie-based authentication

## Common Production Issues

### Issue: "Login works locally but not in production"
**Causes:**
- CORS origin mismatch
- Cookie settings (secure, sameSite)
- HTTPS requirement not met

**Solutions:**
1. Check CORS_ORIGIN matches your frontend domain exactly
2. Ensure both frontend and backend use HTTPS
3. Check browser developer tools for CORS errors

### Issue: "Cookies not being set"
**Causes:**
- SameSite policy too restrictive
- Secure flag without HTTPS
- Domain mismatch

**Solutions:**
1. Use SameSite: 'none' for cross-origin
2. Ensure HTTPS is enabled
3. Check domain configuration

## Testing Production Setup

1. **Check CORS**: Look for CORS errors in browser console
2. **Check Cookies**: Verify cookies are being set in browser dev tools
3. **Check Logs**: Monitor backend logs for authentication requests
4. **Test Flow**: Complete login → dashboard → refresh cycle

## Debug Commands

```bash
# Check if backend is running
curl https://your-backend-domain.com/api/health

# Test CORS
curl -H "Origin: https://your-frontend-domain.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://your-backend-domain.com/api/auth/me
```

## Drizzle ORM + Neon Serverless (Postgres)

### Packages
- drizzle-orm
- drizzle-kit (dev dependency)
- @neondatabase/serverless (HTTP driver) or pg (Node driver with pooling proxy)

### Connection Strategy
- Prefer Neon HTTP driver for serverless (no sockets): `@neondatabase/serverless`
- Use `sslmode=require` in the connection string
- For long-running Node processes or pooled environments, use Neon Pooler or PgBouncer

### Example Drizzle Config (drizzle.config.ts)
```ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './backend/db/schema.ts',
  out: './backend/drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DB_URI!,
  },
} satisfies Config;
```

### Example Runtime Client (Neon HTTP)
```ts
// backend/config/database.ts
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DB_URI!); // DB_URI must include sslmode=require
export const db = drizzle(sql);
```

If you already use Node/Express on Vercel, Neon HTTP driver is typically the safest choice for cold starts and concurrency.

### Migrations (Drizzle Kit)
```bash
# Generate SQL from schema changes
npx drizzle-kit generate

# Push migrations to Neon (recommended in CI prior to deploy)
npx drizzle-kit push

# Or run SQL manually
npx drizzle-kit migrate
```

Tips:
- Run migrations from a trusted environment (CI) with `DB_URI` pointing at Neon.
- Avoid running schema generation at runtime in serverless.

### Vercel Notes (Serverless)
- Ensure `DB_URI` includes `sslmode=require`
- Use `@neondatabase/serverless` driver to avoid TCP/socket limits
- Keep API handlers stateless; do not hold onto connections between invocations
- Configure `CORS_ORIGIN` to your Vercel frontend domains

### Local Development with Neon
- You can still connect to Neon from local using the same `DB_URI`
- For lower latency locally, you may use a local Postgres and a separate `.env.local`

```bash
# .env.local (example for local Postgres)
DB_URI=postgres://postgres:password@localhost:5432/ragilly
```

Ensure your `schema.ts` matches Neon’s Postgres version and features. Drizzle will generate compatible SQL.
