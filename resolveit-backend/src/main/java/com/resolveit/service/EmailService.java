package com.resolveit.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromEmail;

    @Value("${app.mail.from-name}")
    private String fromName;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public void sendPasswordResetEmail(String toEmail, String userName, String resetToken) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject("Reset Your ResolveIt Password");

            String resetUrl = frontendUrl + "/reset-password/" + resetToken;
            
            String htmlContent = buildPasswordResetEmailTemplate(userName, resetUrl, resetToken);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send password reset email", e);
        } catch (Exception e) {
            throw new RuntimeException("Error sending email", e);
        }
    }

    private String buildPasswordResetEmailTemplate(String userName, String resetUrl, String resetToken) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Reset Your Password - ResolveIt</title>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f5f5f5;
                    }
                    .container {
                        background: white;
                        border-radius: 12px;
                        padding: 40px;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                    }
                    .logo {
                        font-size: 2.5rem;
                        margin-bottom: 10px;
                    }
                    .title {
                        color: #667eea;
                        font-size: 1.8rem;
                        font-weight: 700;
                        margin: 0;
                    }
                    .content {
                        margin-bottom: 30px;
                    }
                    .greeting {
                        font-size: 1.1rem;
                        margin-bottom: 20px;
                    }
                    .message {
                        margin-bottom: 25px;
                        color: #666;
                    }
                    .reset-button {
                        display: inline-block;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        text-decoration: none;
                        padding: 15px 30px;
                        border-radius: 8px;
                        font-weight: 600;
                        font-size: 1rem;
                        text-align: center;
                        margin: 20px 0;
                    }
                    .reset-button:hover {
                        opacity: 0.9;
                    }
                    .alternative-link {
                        background: #f8f9fa;
                        border: 1px solid #dee2e6;
                        border-radius: 8px;
                        padding: 15px;
                        margin: 20px 0;
                        word-break: break-all;
                        font-family: monospace;
                        font-size: 0.9rem;
                    }
                    .warning {
                        background: #fff3cd;
                        border: 1px solid #ffeaa7;
                        border-radius: 8px;
                        padding: 15px;
                        margin: 20px 0;
                        color: #856404;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #eee;
                        color: #666;
                        font-size: 0.9rem;
                    }
                    .security-info {
                        background: #e7f3ff;
                        border: 1px solid #b8daff;
                        border-radius: 8px;
                        padding: 15px;
                        margin: 20px 0;
                        color: #004085;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">🏛️</div>
                        <h1 class="title">ResolveIt</h1>
                    </div>
                    
                    <div class="content">
                        <div class="greeting">Hello %s,</div>
                        
                        <div class="message">
                            We received a request to reset your password for your ResolveIt account. 
                            If you made this request, click the button below to reset your password:
                        </div>
                        
                        <div style="text-align: center;">
                            <a href="%s" class="reset-button">Reset My Password</a>
                        </div>
                        
                        <div class="message">
                            If the button doesn't work, you can copy and paste this link into your browser:
                        </div>
                        
                        <div class="alternative-link">
                            %s
                        </div>
                        
                        <div class="security-info">
                            <strong>🔒 Security Information:</strong><br>
                            • This link will expire in 1 hour for your security<br>
                            • If you didn't request this reset, please ignore this email<br>
                            • Your password will remain unchanged until you create a new one
                        </div>
                        
                        <div class="warning">
                            <strong>⚠️ Important:</strong> If you didn't request a password reset, 
                            please ignore this email. Your account is secure and no action is needed.
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p>This email was sent by ResolveIt - Complaint Management System</p>
                        <p>© 2024 ResolveIt. All rights reserved.</p>
                        <p style="font-size: 0.8rem; color: #999;">
                            Reset Token (for reference): %s
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(userName, resetUrl, resetUrl, resetToken);
    }

    public void sendWelcomeEmail(String toEmail, String userName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject("Welcome to ResolveIt!");

            String htmlContent = buildWelcomeEmailTemplate(userName);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send welcome email", e);
        } catch (Exception e) {
            throw new RuntimeException("Error sending email", e);
        }
    }

    private String buildWelcomeEmailTemplate(String userName) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome to ResolveIt</title>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f5f5f5;
                    }
                    .container {
                        background: white;
                        border-radius: 12px;
                        padding: 40px;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                    }
                    .logo {
                        font-size: 2.5rem;
                        margin-bottom: 10px;
                    }
                    .title {
                        color: #667eea;
                        font-size: 1.8rem;
                        font-weight: 700;
                        margin: 0;
                    }
                    .welcome-message {
                        text-align: center;
                        font-size: 1.2rem;
                        color: #11998e;
                        margin: 20px 0;
                        font-weight: 600;
                    }
                    .content {
                        margin-bottom: 30px;
                    }
                    .feature-list {
                        background: #f8f9fa;
                        border-radius: 8px;
                        padding: 20px;
                        margin: 20px 0;
                    }
                    .feature-item {
                        margin: 10px 0;
                        padding-left: 20px;
                    }
                    .cta-button {
                        display: inline-block;
                        background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
                        color: white;
                        text-decoration: none;
                        padding: 15px 30px;
                        border-radius: 8px;
                        font-weight: 600;
                        font-size: 1rem;
                        text-align: center;
                        margin: 20px 0;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #eee;
                        color: #666;
                        font-size: 0.9rem;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">🏛️</div>
                        <h1 class="title">ResolveIt</h1>
                        <div class="welcome-message">Welcome aboard, %s! 🎉</div>
                    </div>
                    
                    <div class="content">
                        <p>Thank you for joining ResolveIt, the modern complaint management platform that connects citizens with government services.</p>
                        
                        <div class="feature-list">
                            <h3 style="color: #667eea; margin-top: 0;">What you can do:</h3>
                            <div class="feature-item">📝 Submit complaints easily and securely</div>
                            <div class="feature-item">📊 Track your complaint status in real-time</div>
                            <div class="feature-item">🔒 Choose anonymous submissions when needed</div>
                            <div class="feature-item">📎 Attach supporting documents and images</div>
                            <div class="feature-item">💬 Communicate with assigned officers</div>
                            <div class="feature-item">📱 Access from any device, anywhere</div>
                        </div>
                        
                        <p>Ready to get started? Log in to your account and make your voice heard!</p>
                        
                        <div style="text-align: center;">
                            <a href="%s/login" class="cta-button">Start Using ResolveIt</a>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p>Need help? Contact our support team anytime.</p>
                        <p>© 2024 ResolveIt. Building better communities together.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(userName, frontendUrl);
    }

    public void sendEscalationNotificationToUser(String toEmail, String userName, String complaintTitle, Long complaintId) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject("Your Complaint Has Been Escalated - ResolveIt");

            String complaintUrl = frontendUrl + "/complaint/" + complaintId;
            String htmlContent = buildEscalationUserEmailTemplate(userName, complaintTitle, complaintUrl, complaintId);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send escalation notification", e);
        } catch (Exception e) {
            throw new RuntimeException("Error sending email", e);
        }
    }

    public void sendDetailedEscalationNotificationToUser(String toEmail, String userName, String complaintTitle, 
                                                         Long complaintId, String reason, String escalatedBy, 
                                                         String escalatedByEmail, LocalDateTime escalatedAt) {
        try {
            System.out.println("🔧 Attempting to send escalation email...");
            System.out.println("📧 To: " + toEmail);
            System.out.println("📧 From: " + fromEmail);
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject("Your Complaint Has Been Escalated - ResolveIt");

            String complaintUrl = frontendUrl + "/complaint/" + complaintId;
            String htmlContent = buildDetailedEscalationUserEmailTemplate(userName, complaintTitle, complaintUrl, 
                                                                         complaintId, reason, escalatedBy, 
                                                                         escalatedByEmail, escalatedAt);
            helper.setText(htmlContent, true);

            System.out.println("📤 Sending email via Gmail SMTP...");
            mailSender.send(message);
            System.out.println("✅ Email sent successfully!");
            
        } catch (MessagingException e) {
            System.err.println("❌ MessagingException: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to send escalation notification", e);
        } catch (Exception e) {
            System.err.println("❌ General Exception: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error sending email", e);
        }
    }

    public void sendEscalationNotificationToAdmin(String toEmail, String adminName, String complaintTitle, Long complaintId, String reason) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject("Escalated Complaint Requires Attention - ResolveIt");

            String complaintUrl = frontendUrl + "/complaint/" + complaintId;
            String htmlContent = buildEscalationAdminEmailTemplate(adminName, complaintTitle, complaintUrl, complaintId, reason);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send escalation notification to admin", e);
        } catch (Exception e) {
            throw new RuntimeException("Error sending email", e);
        }
    }

    private String buildEscalationUserEmailTemplate(String userName, String complaintTitle, String complaintUrl, Long complaintId) {
        StringBuilder template = new StringBuilder();
        template.append("<!DOCTYPE html>");
        template.append("<html>");
        template.append("<head>");
        template.append("<meta charset=\"UTF-8\">");
        template.append("<style>");
        template.append("body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }");
        template.append(".container { background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }");
        template.append(".header { text-align: center; margin-bottom: 30px; }");
        template.append(".escalation-badge { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; font-weight: 600; }");
        template.append(".button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; }");
        template.append("</style>");
        template.append("</head>");
        template.append("<body>");
        template.append("<div class=\"container\">");
        template.append("<div class=\"header\">");
        template.append("<h1 style=\"color: #667eea;\">🏛️ ResolveIt</h1>");
        template.append("<div class=\"escalation-badge\">⚡ ESCALATED</div>");
        template.append("</div>");
        template.append("<p>Hello ").append(userName).append(",</p>");
        template.append("<p>Your complaint <strong>\"").append(complaintTitle).append("\"</strong> (ID: #").append(complaintId).append(") has been escalated to senior management for priority attention.</p>");
        template.append("<p>This escalation ensures that your concern receives immediate focus from higher authorities who can expedite the resolution process.</p>");
        template.append("<div style=\"text-align: center; margin: 30px 0;\">");
        template.append("<a href=\"").append(complaintUrl).append("\" class=\"button\">View Complaint Details</a>");
        template.append("</div>");
        template.append("<p style=\"color: #666; font-size: 14px;\">You will be notified of any updates. Thank you for your patience.</p>");
        template.append("</div>");
        template.append("</body>");
        template.append("</html>");
        return template.toString();
    }

    private String buildEscalationAdminEmailTemplate(String adminName, String complaintTitle, String complaintUrl, Long complaintId, String reason) {
        StringBuilder template = new StringBuilder();
        template.append("<!DOCTYPE html>");
        template.append("<html>");
        template.append("<head>");
        template.append("<meta charset=\"UTF-8\">");
        template.append("<style>");
        template.append("body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }");
        template.append(".container { background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }");
        template.append(".urgent { background: #fff3cd; border-left: 4px solid #ff6b6b; padding: 15px; margin: 20px 0; }");
        template.append(".button { display: inline-block; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; }");
        template.append("</style>");
        template.append("</head>");
        template.append("<body>");
        template.append("<div class=\"container\">");
        template.append("<h1 style=\"color: #ff6b6b;\">⚠️ Escalated Complaint</h1>");
        template.append("<p>Hello ").append(adminName).append(",</p>");
        template.append("<p>A complaint has been escalated and requires your immediate attention:</p>");
        template.append("<div class=\"urgent\">");
        template.append("<strong>Complaint:</strong> ").append(complaintTitle).append("<br>");
        template.append("<strong>ID:</strong> #").append(complaintId).append("<br>");
        template.append("<strong>Reason:</strong> ").append(reason);
        template.append("</div>");
        template.append("<div style=\"text-align: center; margin: 30px 0;\">");
        template.append("<a href=\"").append(complaintUrl).append("\" class=\"button\">Review Complaint Now</a>");
        template.append("</div>");
        template.append("<p style=\"color: #666; font-size: 14px;\">Please take appropriate action as soon as possible.</p>");
        template.append("</div>");
        template.append("</body>");
        template.append("</html>");
        return template.toString();
    }

    private String buildDetailedEscalationUserEmailTemplate(String userName, String complaintTitle, String complaintUrl, 
                                                           Long complaintId, String reason, String escalatedBy, 
                                                           String escalatedByEmail, LocalDateTime escalatedAt) {
        String formattedDate = escalatedAt.format(java.time.format.DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm"));
        
        // Use string concatenation instead of .formatted() to avoid format specifier issues
        StringBuilder template = new StringBuilder();
        template.append("<!DOCTYPE html>");
        template.append("<html>");
        template.append("<head>");
        template.append("<meta charset=\"UTF-8\">");
        template.append("<style>");
        template.append("body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }");
        template.append(".container { background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }");
        template.append(".header { text-align: center; margin-bottom: 30px; }");
        template.append(".escalation-badge { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; font-weight: 600; }");
        template.append(".details-box { background: #f8f9fa; border-left: 4px solid #ff6b6b; padding: 20px; margin: 20px 0; border-radius: 8px; }");
        template.append(".button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; }");
        template.append("</style>");
        template.append("</head>");
        template.append("<body>");
        template.append("<div class=\"container\">");
        template.append("<div class=\"header\">");
        template.append("<h1 style=\"color: #667eea;\">🏛️ ResolveIt</h1>");
        template.append("<div class=\"escalation-badge\">⚡ COMPLAINT ESCALATED</div>");
        template.append("</div>");
        template.append("<p>Hello ").append(userName).append(",</p>");
        template.append("<p>Your complaint has been escalated to senior management for priority attention.</p>");
        template.append("<div class=\"details-box\">");
        template.append("<h3 style=\"margin-top: 0; color: #ff6b6b;\">Escalation Details</h3>");
        template.append("<p><strong>Complaint:</strong> ").append(complaintTitle).append(" (ID: #").append(complaintId).append(")</p>");
        template.append("<p><strong>Escalated By:</strong> ").append(escalatedBy).append(" (").append(escalatedByEmail).append(")</p>");
        template.append("<p><strong>Date & Time:</strong> ").append(formattedDate).append("</p>");
        template.append("<p><strong>Reason:</strong><br>").append(reason).append("</p>");
        template.append("</div>");
        template.append("<p>This escalation ensures that your concern receives immediate focus from higher authorities who can expedite the resolution process.</p>");
        template.append("<div style=\"text-align: center; margin: 30px 0;\">");
        template.append("<a href=\"").append(complaintUrl).append("\" class=\"button\">View Complaint Details</a>");
        template.append("</div>");
        template.append("<p style=\"color: #666; font-size: 14px;\">You will be notified of any updates. Thank you for your patience.</p>");
        template.append("</div>");
        template.append("</body>");
        template.append("</html>");
        
        return template.toString();
    }

    public void sendOfficerRequestApprovalEmail(String toEmail, String userName, String approvedBy) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject("Officer Request Approved - ResolveIt");

            String htmlContent = """
                <!DOCTYPE html>
                <html>
                <head><meta charset="UTF-8"><style>
                    body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
                    .container { background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                    .success-badge { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 15px 30px; border-radius: 20px; display: inline-block; font-weight: 600; font-size: 1.2rem; }
                    .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; }
                </style></head>
                <body>
                    <div class="container">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #667eea;">🏛️ ResolveIt</h1>
                            <div class="success-badge">✅ REQUEST APPROVED</div>
                        </div>
                        <p>Hello %s,</p>
                        <p><strong>Congratulations!</strong> Your request to become an officer has been approved by %s.</p>
                        <p>You now have officer privileges and can:</p>
                        <ul>
                            <li>View and manage assigned complaints</li>
                            <li>Update complaint statuses</li>
                            <li>Add comments and notes</li>
                            <li>Escalate critical issues</li>
                        </ul>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="%s/officer-login" class="button">Access Officer Portal</a>
                        </div>
                        <p style="color: #666; font-size: 14px;">Welcome to the team!</p>
                    </div>
                </body>
                </html>
                """.formatted(userName, approvedBy, frontendUrl);
            
            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send approval email", e);
        }
    }

    public void sendOfficerRequestRejectionEmail(String toEmail, String userName, String rejectedBy, String reason) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject("Officer Request Update - ResolveIt");

            String htmlContent = """
                <!DOCTYPE html>
                <html>
                <head><meta charset="UTF-8"><style>
                    body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
                    .container { background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                </style></head>
                <body>
                    <div class="container">
                        <h1 style="color: #667eea;">🏛️ ResolveIt</h1>
                        <p>Hello %s,</p>
                        <p>Thank you for your interest in becoming an officer. After careful review, %s has decided not to approve your request at this time.</p>
                        <p><strong>Feedback:</strong><br>%s</p>
                        <p>You can continue using ResolveIt as a citizen to submit and track complaints. You may reapply in the future.</p>
                        <p style="color: #666; font-size: 14px;">Thank you for your understanding.</p>
                    </div>
                </body>
                </html>
                """.formatted(userName, rejectedBy, reason != null ? reason : "No specific feedback provided");
            
            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send rejection email", e);
        }
    }

    public void sendNewOfficerRequestNotification(String toEmail, String adminName, String requesterName, 
                                                  String requesterEmail, String reason) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject("New Officer Request - ResolveIt");

            String htmlContent = """
                <!DOCTYPE html>
                <html>
                <head><meta charset="UTF-8"><style>
                    body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
                    .container { background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                    .request-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 8px; }
                    .button { display: inline-block; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; }
                </style></head>
                <body>
                    <div class="container">
                        <h1 style="color: #667eea;">🏛️ ResolveIt - Super Admin</h1>
                        <p>Hello %s,</p>
                        <p>A new officer role request requires your review:</p>
                        
                        <div class="request-box">
                            <h3 style="margin-top: 0;">Request Details</h3>
                            <p><strong>Requester:</strong> %s</p>
                            <p><strong>Email:</strong> %s</p>
                            <p><strong>Reason:</strong><br>%s</p>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="%s/officer-dashboard" class="button">Review Request</a>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(adminName, requesterName, requesterEmail, reason, frontendUrl);
            
            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send notification email", e);
        }
    }
}
