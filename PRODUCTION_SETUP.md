# Production Setup Guide

## Environment Variables for Production

Create a `.env` file in your production backend with these variables:

```bash
# Environment
NODE_ENV=production

# Server
PORT=8000
HOST=0.0.0.0

# Database
DB_URI=your_production_database_url

# JWT Secrets (IMPORTANT: Use strong, unique secrets)
JWT_SECRET=your_super_strong_jwt_secret_here
JWT_REFRESH_SECRET=your_super_strong_refresh_secret_here
SESSION_SECRET=your_super_strong_session_secret_here

# CORS (IMPORTANT: Set your production frontend URL)
CORS_ORIGIN=https://your-frontend-domain.com,https://www.your-frontend-domain.com

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
