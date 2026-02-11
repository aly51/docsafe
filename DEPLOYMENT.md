# DocSafe - Production Deployment Guide

## Deployment Options

### Option 1: Heroku (Easiest)

#### Prerequisites
- Heroku account (free tier available)
- Heroku CLI installed

#### Steps

1. **Prepare the project:**
```bash
# Create a main package.json in root
cat > package.json << 'EOF'
{
  "name": "docsafe-fullstack",
  "version": "1.0.0",
  "scripts": {
    "install-server": "cd server && npm install",
    "install-client": "cd client && npm install",
    "build": "cd client && npm run build",
    "start": "cd server && npm start",
    "heroku-postbuild": "npm run install-server && npm run install-client && npm run build"
  }
}
EOF
```

2. **Update server.js to serve React app:**
```javascript
// Add this to server/server.js after routes
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}
```

3. **Deploy:**
```bash
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Add MongoDB
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set JWT_SECRET=your-super-secret-key
heroku config:set NODE_ENV=production
heroku config:set CLIENT_URL=https://your-app-name.herokuapp.com

# Deploy
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

### Option 2: AWS (EC2 + MongoDB Atlas)

#### 1. Setup MongoDB Atlas (Free Cloud Database)

1. Go to mongodb.com/cloud/atlas
2. Create free cluster
3. Create database user
4. Whitelist IP (0.0.0.0/0 for now)
5. Get connection string

#### 2. Setup EC2 Instance

```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone your repo
git clone your-repo-url
cd docsafe

# Install dependencies
cd server && npm install
cd ../client && npm install && npm run build
cd ..

# Create .env
cat > server/.env << 'EOF'
PORT=5000
MONGODB_URI=your-atlas-connection-string
JWT_SECRET=your-super-secret-key
NODE_ENV=production
CLIENT_URL=http://your-domain.com
EOF

# Start with PM2
cd server
pm2 start server.js --name docsafe
pm2 startup
pm2 save
```

#### 3. Setup Nginx (Reverse Proxy)

```bash
# Install Nginx
sudo apt install nginx

# Configure Nginx
sudo nano /etc/nginx/sites-available/docsafe

# Add this configuration:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/docsafe /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 4. Setup SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Option 3: DigitalOcean App Platform

1. Create account on DigitalOcean
2. Create new App
3. Connect GitHub repository
4. Configure:
   - Build Command: `cd client && npm install && npm run build`
   - Run Command: `cd server && npm install && npm start`
5. Add MongoDB database component
6. Set environment variables
7. Deploy

### Option 4: Vercel (Frontend) + Railway (Backend)

#### Frontend (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd client
vercel

# Set environment variable
# REACT_APP_API_URL=your-backend-url
```

#### Backend (Railway)

1. Go to railway.app
2. Create new project
3. Connect GitHub repo
4. Select server folder
5. Add MongoDB plugin
6. Set environment variables
7. Deploy

## Environment Variables for Production

```env
# Backend (.env in server/)
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/docsafe
JWT_SECRET=super-long-random-secret-change-this
NODE_ENV=production
CLIENT_URL=https://your-frontend-domain.com

# Frontend (.env in client/)
REACT_APP_API_URL=https://your-backend-domain.com/api
```

## Production Checklist

### Security
- [ ] Change JWT_SECRET to strong random string
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Add rate limiting
- [ ] Validate file uploads (type, size)
- [ ] Add virus scanning
- [ ] Use environment variables for secrets
- [ ] Enable MongoDB authentication
- [ ] Set up firewall rules
- [ ] Keep dependencies updated

### Performance
- [ ] Enable Gzip compression
- [ ] Add CDN for static assets
- [ ] Implement caching
- [ ] Optimize database queries
- [ ] Use connection pooling
- [ ] Set up load balancing (if needed)

### Monitoring
- [ ] Setup error logging (Sentry, LogRocket)
- [ ] Add application monitoring (New Relic, DataDog)
- [ ] Configure uptime monitoring
- [ ] Set up backup strategy
- [ ] Enable access logs

### Features
- [ ] Add email notifications
- [ ] Implement file type validation
- [ ] Add file size limits
- [ ] Setup automated backups
- [ ] Configure CDN for file storage
- [ ] Add analytics

## File Storage in Production

### Option 1: AWS S3

```javascript
// Install AWS SDK
npm install aws-sdk multer-s3

// Update multer configuration
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  region: 'us-east-1'
});

const s3 = new aws.S3();

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'your-bucket-name',
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + '-' + file.originalname);
    }
  })
});
```

### Option 2: Cloudinary

```javascript
npm install cloudinary multer-storage-cloudinary

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'docsafe',
    allowed_formats: ['jpg', 'png', 'pdf', 'doc', 'docx']
  }
});
```

## Database Backup

### Automated MongoDB Backup Script

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb"
mkdir -p $BACKUP_DIR

mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/backup_$DATE"

# Keep only last 7 days of backups
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +
```

Add to crontab:
```bash
0 2 * * * /path/to/backup.sh
```

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (AWS ALB, Nginx)
- Deploy multiple server instances
- Use session store (Redis)
- Implement database replication

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Add database indexes
- Use caching (Redis, Memcached)

## Cost Optimization

### Free Tier Options
- **Backend**: Railway, Render, Heroku (limited)
- **Database**: MongoDB Atlas (512MB free)
- **Frontend**: Vercel, Netlify, GitHub Pages
- **Storage**: Cloudinary (free tier), AWS S3 (free tier first year)

### Paid Options (Low Cost)
- **DigitalOcean**: $5/month droplet
- **AWS EC2**: t2.micro or t3.micro (~$10/month)
- **MongoDB Atlas**: M10 cluster (~$57/month)

## Monitoring URLs

After deployment, monitor:
- Application uptime
- API response times
- Database performance
- Error rates
- Storage usage
- Bandwidth usage

---

**Good luck with your deployment! 🚀**
