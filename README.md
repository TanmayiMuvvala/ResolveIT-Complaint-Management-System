# ResolveIt - Complaint Management System

A comprehensive web-based complaint management system built with React and Spring Boot, designed to streamline the process of submitting, tracking, and resolving citizen complaints.

## 🚀 Features

### Core Functionality
- **User Registration & Authentication** - JWT-based secure authentication
- **Role-Based Access Control** - Citizens, Officers, and Administrators
- **Complaint Management** - Submit, track, and resolve complaints with status updates
- **File Attachments** - Support for document and image uploads
- **Comment System** - Communication between citizens and officers
- **Real-time Notifications** - In-app notification system with email alerts

### Advanced Features
- **Officer Role Requests** - Citizens can request to become officers
- **Escalation System** - Manual and automatic complaint escalation
- **Reports & Analytics** - Comprehensive reporting with CSV export
- **Professional UI** - Modern, responsive design with light color themes
- **Email Integration** - Automated email notifications for all major events

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **React Router** - Client-side routing
- **Axios** - HTTP client for API communication
- **CSS3** - Custom styling with gradients and animations

### Backend
- **Spring Boot 3.x** - RESTful API development
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - Database operations
- **MySQL** - Relational database
- **JWT** - Token-based authentication
- **JavaMail** - Email notification system

## 📋 Prerequisites

- **Java 17+**
- **Node.js 16+**
- **MySQL 8.0+**
- **Maven 3.6+**
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd resolveit
```

### 2. Database Setup
```bash
# Create and populate the database
mysql -u root -p < RESOLVEIT_FINAL_DATABASE_SCHEMA.sql
```

### 3. Backend Configuration
```bash
cd resolveit-backend

# Update application.properties with your database credentials
# src/main/resources/application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/resolveit
spring.datasource.username=your_username
spring.datasource.password=your_password

# Configure email settings (optional)
spring.mail.username=your_email@gmail.com
spring.mail.password=your_app_password

# Start the backend
mvn spring-boot:run
```

### 4. Frontend Setup
```bash
cd resolveit-frontend

# Install dependencies
npm install

# Start the development server
npm start
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080

## 📱 User Interfaces

### Citizen Portal
- **Dashboard** - Light blue theme for complaint overview
- **Submit Complaints** - Easy-to-use complaint submission form
- **Track Status** - Real-time status updates and notifications
- **Request Officer Role** - Apply to become an officer

### Officer Portal
- **Officer Dashboard** - Light green theme for complaint management
- **Manage Complaints** - Assign, update, and resolve complaints
- **Add Comments** - Communicate with citizens
- **Escalate Issues** - Escalate complex complaints to administrators

### Admin Portal
- **Manage Officer Requests** - Approve or reject officer applications
- **System Reports** - Comprehensive analytics and reporting
- **User Management** - Oversee system users and roles

## 🔐 Default Roles

The system includes three main roles:

1. **USER** - Citizens who can submit and track complaints
2. **OFFICER** - Staff who can manage and resolve complaints
3. **ADMIN** - Administrators with full system access

## 📊 Database Schema

The system uses a comprehensive MySQL database with the following key tables:

- `users` - User accounts and authentication
- `roles` - System roles (USER, OFFICER, ADMIN)
- `complaints` - Complaint records with status tracking
- `comments` - Communication threads
- `notifications` - In-app notification system
- `officer_requests` - Officer role application system
- `escalations` - Complaint escalation tracking

## 🔧 Configuration

### Email Configuration
To enable email notifications, configure the following in `application.properties`:

```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your_email@gmail.com
spring.mail.password=your_app_password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

### Security Configuration
JWT tokens are configured with:
- **Secret Key** - Configurable in application.properties
- **Expiration** - 24 hours by default
- **Role-based Access** - Automatic role verification

## 🧪 Testing

### Manual Testing
1. Register as a new citizen
2. Submit a complaint with attachments
3. Apply for officer role
4. Login as admin to approve officer request
5. Login as officer to manage complaints
6. Test escalation and notification systems

### API Testing
Use tools like Postman to test the REST endpoints:
- Authentication endpoints (`/api/auth/*`)
- Complaint management (`/api/complaints/*`)
- Officer requests (`/api/officer-requests/*`)
- Notifications (`/api/notifications/*`)

## 📈 Reports & Analytics

The system provides comprehensive reporting:
- **Complaint Trends** - Time-based analysis
- **Category Breakdown** - Complaints by category
- **Status Distribution** - Current complaint statuses
- **CSV Export** - Data export for external analysis

## 🔔 Notification System

### In-App Notifications
- Real-time notification bell with unread count
- Dropdown interface with mark-as-read functionality
- Notification history page

### Email Notifications
- Welcome emails for new users
- Status update notifications
- Officer request confirmations
- Escalation alerts

## 🎨 UI/UX Features

- **Professional Color Schemes** - Light blue for citizens, light green for officers
- **Responsive Design** - Mobile-friendly interface
- **Modern Components** - React Portal modals and dropdowns
- **Smooth Animations** - CSS transitions and hover effects
- **Accessibility** - WCAG compliant design

## 🚀 Deployment

### Production Deployment
1. Build the frontend: `npm run build`
2. Package the backend: `mvn clean package`
3. Deploy to your preferred hosting platform
4. Configure production database and email settings
5. Set up SSL certificates for HTTPS

### Environment Variables
Configure the following for production:
- `DB_URL` - Database connection string
- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password
- `JWT_SECRET` - JWT signing secret
- `MAIL_USERNAME` - Email service username
- `MAIL_PASSWORD` - Email service password

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset confirmation

### Complaint Management
- `GET /api/complaints` - List complaints
- `POST /api/complaints` - Create complaint
- `GET /api/complaints/{id}` - Get complaint details
- `PUT /api/complaints/{id}` - Update complaint
- `POST /api/complaints/{id}/comments` - Add comment

### Officer Requests
- `POST /api/officer-requests` - Submit officer request
- `GET /api/officer-requests/pending` - Get pending requests (Admin)
- `PUT /api/officer-requests/{id}/approve` - Approve request (Admin)
- `PUT /api/officer-requests/{id}/reject` - Reject request (Admin)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in `.kiro/specs/requirements.md`
- Review the database schema in `RESOLVEIT_FINAL_DATABASE_SCHEMA.sql`

## 🎯 Project Status

✅ **Production Ready** - All core features implemented and tested
✅ **Database Schema** - Complete with proper constraints and indexes
✅ **Security** - JWT authentication with role-based access control
✅ **UI/UX** - Professional design with responsive layout
✅ **Email Integration** - Comprehensive notification system
✅ **Documentation** - Complete requirements and setup documentation

---

**ResolveIt** - Streamlining complaint management for better citizen services.