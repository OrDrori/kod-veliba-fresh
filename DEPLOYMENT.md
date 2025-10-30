# 🚀 Deployment Guide - kod-veliba-fresh

## Production Deployment

### Prerequisites
- Node.js 22+
- MySQL Database
- Gemini API Key

### Environment Variables
```bash
GEMINI_API_KEY=AIzaSyDOuWUfsNLglJLgcQcfZD_B7amaqIncxQ4
DATABASE_URL=mysql://user:password@host:port/database
NODE_ENV=production
PORT=3000
```

### Deployment Steps

#### 1. Clone Repository
```bash
git clone https://github.com/OrDrori/kod-veliba-fresh.git
cd kod-veliba-fresh
```

#### 2. Install Dependencies
```bash
pnpm install
```

#### 3. Build
```bash
pnpm run build
```

#### 4. Configure Environment
Create `.env` file with production values.

#### 5. Run Database Migration
```bash
pnpm run db:push
```

#### 6. Start Server
```bash
node dist/index.js
```

### Using PM2 (Recommended)
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start dist/index.js --name kod-veliba

# Save PM2 configuration
pm2 save

# Setup startup script
pm2 startup
```

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Monitoring
```bash
# View logs
pm2 logs kod-veliba

# Monitor resources
pm2 monit
```

## Features Included
- ✅ Full CRM System (13 boards)
- ✅ AI Personal Assistant with Gemini 2.5 Flash
- ✅ RAG Technology
- ✅ Real-time notifications
- ✅ Time tracking
- ✅ Employee management
- ✅ Beautiful UI with Indigo/Violet theme
- ✅ Hebrew support

## Support
For issues, visit: https://github.com/OrDrori/kod-veliba-fresh/issues
