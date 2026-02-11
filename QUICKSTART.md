# DocSafe - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

Open two terminal windows:

**Terminal 1 (Backend):**
```bash
cd docsafe/server
npm install
```

**Terminal 2 (Frontend):**
```bash
cd docsafe/client
npm install
```

### Step 2: Setup MongoDB

Make sure MongoDB is installed and running:

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

**Windows:**
- Start MongoDB from Services or run `mongod.exe`

**Don't have MongoDB?** Install it:
- macOS: `brew install mongodb-community`
- Ubuntu: `sudo apt install mongodb`
- Windows: Download from mongodb.com
- Or use MongoDB Atlas (free cloud database) and update MONGODB_URI in .env

### Step 3: Configure Environment (Optional)

The `.env` file in `server/` is already configured for local development. 

**For production**, change:
- `JWT_SECRET` to a strong random string
- `MONGODB_URI` if using a different database
- `CLIENT_URL` to your frontend URL

### Step 4: Run the Application

**Terminal 1 (Backend):**
```bash
cd docsafe/server
npm start
# Server will run on http://localhost:5000
```

**Terminal 2 (Frontend):**
```bash
cd docsafe/client
npm start
# Browser will open at http://localhost:3000
```

### Step 5: Use the Application

1. **Sign Up**: Create an account at http://localhost:3000/signup
2. **Upload**: Click "Upload Document" to add files
3. **Share**: Select documents and click "Share Selected"
4. **Get QR Code**: After creating a share, you'll get a QR code and link
5. **Access Share**: Use the link or scan QR code to access documents

## 📱 Testing the Share Feature

1. Create a share link with password protection
2. Copy the share URL
3. Open it in an incognito/private window
4. Enter the password you set
5. Download the shared documents

## 🛠️ Troubleshooting

**Can't connect to MongoDB?**
- Check if MongoDB is running: `mongo` or `mongosh`
- Update MONGODB_URI in server/.env

**Port already in use?**
- Change PORT in server/.env
- Or kill the process: `lsof -ti:5000 | xargs kill`

**Frontend won't load?**
- Clear browser cache
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

## 🎯 What You Can Do

✅ Upload any file type (PDFs, images, documents, etc.)
✅ Create password-protected share links
✅ Set expiration dates for shares
✅ Generate QR codes for easy mobile access
✅ Download shared documents without an account
✅ Track how many times a share has been accessed

## 📚 Next Steps

- Read the full README.md for detailed documentation
- Deploy to production (Heroku, AWS, DigitalOcean, etc.)
- Customize the UI colors and branding
- Add more features (see README for ideas)

## 🆘 Need Help?

Check the troubleshooting section in README.md or the API documentation.

---

**Happy sharing! 🎉**
