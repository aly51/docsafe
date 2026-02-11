# DocSafe - Secure Document Storage and Sharing Platform

A full-stack web application for storing, managing, and sharing documents securely with QR code generation and password protection.

## Features

### Core Features
- **User Authentication**: Secure signup and login with JWT tokens
- **Document Management**: Upload, view, download, and delete documents
- **Secure Sharing**: Create shareable links with optional password protection
- **QR Code Generation**: Automatically generate QR codes for easy sharing
- **Expiration Dates**: Set expiration dates for shared links
- **Access Tracking**: Track how many times a shared link has been accessed

### Security Features
- Password-protected shares
- JWT-based authentication
- Bcrypt password hashing
- Secure file storage
- Private document access

## Tech Stack

### Backend
- **Node.js & Express**: RESTful API server
- **MongoDB & Mongoose**: Database and ODM
- **JWT**: Authentication tokens
- **Bcrypt**: Password hashing
- **Multer**: File upload handling
- **QRCode**: QR code generation
- **Nanoid**: Unique share ID generation

### Frontend
- **React**: UI library
- **React Router**: Navigation
- **Axios**: HTTP client
- **React Icons**: Icon library

## Project Structure

```
docsafe/
├── server/
│   ├── models/
│   │   ├── User.js
│   │   ├── Document.js
│   │   └── Share.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── documents.js
│   │   └── shares.js
│   ├── middleware/
│   │   └── auth.js
│   ├── uploads/          # Document storage
│   ├── .env
│   ├── package.json
│   └── server.js
└── client/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Login.js
    │   │   ├── Signup.js
    │   │   ├── Dashboard.js
    │   │   ├── ShareModal.js
    │   │   ├── ShareAccess.js
    │   │   ├── PrivateRoute.js
    │   │   └── *.css
    │   ├── contexts/
    │   │   └── AuthContext.js
    │   ├── services/
    │   │   └── api.js
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    └── package.json
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd docsafe

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/docsafe
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

**Important**: Change `JWT_SECRET` to a strong random string in production!

### 3. Start MongoDB

Make sure MongoDB is running:

```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Linux with systemd
sudo systemctl start mongod

# Or run manually
mongod
```

### 4. Run the Application

#### Development Mode

**Terminal 1 - Start Backend:**
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 - Start Frontend:**
```bash
cd client
npm start
# Client runs on http://localhost:3000
```

#### Production Build

```bash
# Build frontend
cd client
npm run build

# Serve static files from backend
# Add this to server.js:
# app.use(express.static(path.join(__dirname, '../client/build')));
```

## Usage Guide

### 1. Create an Account
- Navigate to http://localhost:3000/signup
- Enter your name, email, and password
- Click "Sign Up"

### 2. Upload Documents
- After logging in, click "Upload Document"
- Select a file from your computer
- The file will appear in your documents list

### 3. Create a Share Link
- Select documents by clicking their checkboxes
- Click "Share Selected"
- Optionally add:
  - Password protection
  - Expiration date
- Click "Create Share Link"
- Copy the link or download the QR code

### 4. Access Shared Documents
- Visit the share link
- Enter password if required
- Download documents

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login user

### Documents (Protected)
- `GET /api/documents` - Get all user documents
- `POST /api/documents/upload` - Upload document
- `DELETE /api/documents/:id` - Delete document
- `GET /api/documents/download/:id` - Download document

### Shares (Protected for creation)
- `POST /api/shares` - Create share link
- `GET /api/shares` - Get user's shares
- `DELETE /api/shares/:shareId` - Delete share
- `POST /api/shares/access/:shareId` - Access share (public)
- `GET /api/shares/download/:shareId/:documentId` - Download from share (public)

## Security Considerations

### Production Deployment
1. **Environment Variables**: Use strong, unique values for `JWT_SECRET`
2. **HTTPS**: Always use HTTPS in production
3. **CORS**: Configure CORS to only allow your frontend domain
4. **File Validation**: Add file type and size validation
5. **Rate Limiting**: Implement rate limiting on API endpoints
6. **Database Security**: Use MongoDB authentication and encryption
7. **Regular Updates**: Keep all dependencies updated

### File Storage
- Files are stored in `server/uploads/` directory
- In production, consider using cloud storage (AWS S3, Google Cloud Storage)
- Implement virus scanning for uploaded files

### Password Security
- Passwords are hashed using bcrypt (12 rounds)
- Share passwords are also hashed
- Never log or expose passwords

## Features to Add

### Potential Enhancements
- [ ] File preview capabilities
- [ ] Folder organization
- [ ] Drag-and-drop upload
- [ ] Bulk upload
- [ ] File search functionality
- [ ] User profile management
- [ ] Email notifications
- [ ] Two-factor authentication
- [ ] File versioning
- [ ] Collaboration features
- [ ] Mobile app
- [ ] Advanced analytics
- [ ] Custom branding for shares

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Make sure MongoDB is running

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**: Change the PORT in `.env` or kill the process using that port

### CORS Errors
**Solution**: Check that CLIENT_URL in `.env` matches your frontend URL

### File Upload Fails
**Solution**: 
- Check file size (default limit is 10MB)
- Ensure `uploads` directory exists and has write permissions
- Verify multer configuration

## License

MIT License - Feel free to use this project for personal or commercial purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ using React, Node.js, and MongoDB**
