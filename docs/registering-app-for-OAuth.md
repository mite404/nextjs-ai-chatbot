📋 Google Cloud Console Setup

### 1. Create OAuth Credentials

1. **Go to**: https://console.cloud.google.com/apis/credentials
2. **Create New Credentials**: Click "Create Credentials" → "OAuth client ID"
3. **Create an OAuth Consent Screen** (required for production)
   - Choose "External" for public apps
   - Fill in app name, support email, developer org
   - Add scopes (Google Auth usually just needs `https://www.googleapis.com/auth/userinfo.email` and `https://www.googleapis.com/auth/userinfo.profile`)

### 2. Create OAuth Client ID

1. **Application type**: "Web application"
2. **Authorized redirect URIs**: Add these exact URLs:
   ```
   https://yourdomain.com/api/auth/callback/google
   http://localhost:3000/api/auth/callback/google  # For development
   ```
3. **Authorized Javascript origins**: Add these exact URLs:
   ```
   https://yourdomain.com
   http://localhost:3000  # For development
   ```

4. **Copy the credentials** (click "Create" to generate):
   - `GOOGLE_CLIENT_ID` (downloaded from screen)
   - `GOOGLE_CLIENT_SECRET` (click "Show" to reveal)

### 3. Download JSON Credentials (optional)

You can download the credentials file for easy copying into environment variables.

---

## 📋 GitHub Setup

### 1. Register a New OAuth App

1. **Go to**: https://github.com/settings/developers
2. **Click "New OAuth App"** at top
3. **Fill in**:
   - **Application name**: Your app name
   - **Homepage URL**: `https://yourdomain.com`
   - **Authorization callback URL**: 
     ```
     https://yourdomain.com/api/auth/callback/github
     ```
   - **Description**: Brief description of your app

### 2. Create Personal Access Token (for testing)

Before creating the admin account:

1. Go to: https://github.com/settings/tokens
2. Generate a new token with `read:user` and `user:email` scopes
3. Use this token as a password when signing in via GitHub OAuth

---

## 🔑 Creating Admin Accounts

### Important Distinction

You'll likely need **separate OAuth apps** for:
1. **Development** (localhost callbacks)
2. **Production** (live domain callbacks)

### Admin Account Strategy

For each platform, decide on the admin account approach:

**Option A: Single Account Per Platform**
- **Google OAuth**: One admin Google account
- **GitHub OAuth**: One admin GitHub account
- **Email/Password**: Same email addresses if possible

**Option B: Unified Email Across All Methods**
- Email: `admin@yourdomain.com`
- Sign in via:
  - Email/password (default)
  - Google OAuth (same email, different login flow)
  - GitHub OAuth (same email, different login flow)

**Option C: Different Accounts Per Method**
- Admin can sign in via any method, even with different email addresses
- Example:
  - Google: `admin@company.com`
  - GitHub: `alex.johnson@gmail.com`
  - Email/Password: `support@yourdomain.com`

---

## 📝 Environment Variables Structure

Once you have all credentials, your `.env` file would look like:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=123-abc-def.abcdefg.abcdefg.ghij.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/auth/callback/google

# GitHub OAuth  
GITHUB_CLIENT_ID=Iv1.abcdefghijklmnop
GITHUB_CLIENT_SECRET=abcdefghijklmnopqrstuvwxyz
GITHUB_REDIRECT_URI=https://yourdomain.com/api/auth/callback/github

# Better Auth Base URL
BETTER_AUTH_URL=https://yourdomain.com/api/auth

# Optional: Magic link / OTP plugins
MAGIC_LINK_DISABLED=false
EMAIL_OTP_DISABLED=false
```

---

## ✅ Quick Checklist

Before deploying:
- [ ] Created OAuth app in Google Cloud Console
- [ ] Set redirect URIs correctly in Google Cloud
- [ ] Created OAuth app in GitHub
- [ ] Set callback URL correctly in GitHub
- [ ] Copied all client IDs and secrets to `.env`
- [ ] Added `baseURL` to auth config
- [ ] Tested OAuth flow in development
- [ ] Decided on admin account strategy

Would you like me to help you:
1. Create a script to generate admin accounts?
2. Set up the magic link or OTP plugins?
3. Configure the OAuth callbacks in your Next.js app?
