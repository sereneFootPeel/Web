package com.philosophy.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    public void sendVerificationCode(String toEmail, String code) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("【哲学】注册验证码");
            helper.setFrom(fromEmail);

            String htmlContent = "<p>您的验证码是：<strong>" + code + "</strong></p><p>10分钟内有效。</p>";
            helper.setText(htmlContent, true);

            mailSender.send(message);

        } catch (MessagingException e) {
            throw new RuntimeException("发送验证码邮件失败", e);
        }
    }
    

    public void sendReportWithAttachment(String toEmail, String subject, String htmlContent,
                                         byte[] attachmentBytes, String attachmentFilename) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            helper.setFrom(fromEmail);

            if (attachmentBytes != null && attachmentBytes.length > 0) {
                helper.addAttachment(attachmentFilename != null ? attachmentFilename : "report.csv",
                        new ByteArrayResource(attachmentBytes));
            }

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("发送带附件的邮件失败", e);
        }
    }
}