require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter on startup
transporter.verify((error) => {
  if (error) {
    console.error('❌ Email transporter error:', error.message);
    console.log('⚠️  Make sure EMAIL_USER and EMAIL_PASS are set in .env file');
  } else {
    console.log('✅ Email transporter ready!');
  }
});

// POST /send-email
app.post('/send-email', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, error: 'All fields are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, error: 'Invalid email address.' });
  }

  try {
    // Email to you (portfolio owner)
    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `📬 Portfolio Message: ${subject}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0d1226;color:#f1f5f9;border-radius:16px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#7c3aed,#06b6d4);padding:32px;text-align:center;">
            <h1 style="margin:0;font-size:24px;color:#fff;">📨 New Portfolio Message</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Someone reached out via your portfolio!</p>
          </div>
          <div style="padding:32px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:10px 0;color:#94a3b8;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;width:100px;">From</td>
                <td style="padding:10px 0;color:#f1f5f9;font-size:15px;">${name}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;color:#94a3b8;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">Email</td>
                <td style="padding:10px 0;"><a href="mailto:${email}" style="color:#a855f7;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding:10px 0;color:#94a3b8;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">Subject</td>
                <td style="padding:10px 0;color:#f1f5f9;font-size:15px;">${subject}</td>
              </tr>
            </table>
            <div style="margin-top:20px;background:rgba(255,255,255,0.05);border-radius:10px;padding:20px;border:1px solid rgba(255,255,255,0.08);">
              <p style="color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 10px;">Message</p>
              <p style="color:#f1f5f9;font-size:15px;line-height:1.7;margin:0;">${message.replace(/\n/g, '<br/>')}</p>
            </div>
            <div style="margin-top:24px;text-align:center;">
              <a href="mailto:${email}?subject=Re: ${subject}" style="background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:14px;">Reply to ${name}</a>
            </div>
          </div>
          <div style="background:rgba(255,255,255,0.03);padding:16px;text-align:center;border-top:1px solid rgba(255,255,255,0.06);">
            <p style="color:#475569;font-size:12px;margin:0;">PVSP Portfolio © 2026 | Pamulapati Venkata Sai Poornananda</p>
          </div>
        </div>
      `,
    });

    // Auto-reply to the sender
    await transporter.sendMail({
      from: `"Pamulapati Venkata Sai Poornananda" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `✅ Got your message, ${name}!`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0d1226;color:#f1f5f9;border-radius:16px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#7c3aed,#06b6d4);padding:32px;text-align:center;">
            <h1 style="margin:0;font-size:24px;color:#fff;">Thanks for reaching out! 🙌</h1>
          </div>
          <div style="padding:32px;">
            <p style="font-size:16px;color:#f1f5f9;">Hi <strong>${name}</strong>,</p>
            <p style="color:#94a3b8;line-height:1.7;">Thank you for your message! I've received it and will get back to you as soon as possible.</p>
            <div style="background:rgba(255,255,255,0.05);border-radius:10px;padding:20px;border:1px solid rgba(255,255,255,0.08);margin:20px 0;">
              <p style="color:#94a3b8;font-size:12px;margin:0 0 8px;">Your message:</p>
              <p style="color:#f1f5f9;font-size:14px;line-height:1.6;margin:0;">"${message.replace(/\n/g, '<br/>')}"</p>
            </div>
            <p style="color:#94a3b8;font-size:14px;">— Pamulapati Venkata Sai Poornananda<br/>B.Tech CSE | Lendi Institute</p>
          </div>
          <div style="background:rgba(255,255,255,0.03);padding:16px;text-align:center;border-top:1px solid rgba(255,255,255,0.06);">
            <p style="color:#475569;font-size:12px;margin:0;">PVSP Portfolio | pvrgroupp@gmail.com | +91 7989113264</p>
          </div>
        </div>
      `,
    });

    console.log(`📧 Email sent from ${name} <${email}>`);
    res.json({ success: true, message: 'Email sent successfully!' });

  } catch (err) {
    console.error('❌ Send error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to send email. Please try again.' });
  }
});

// Serve index.html for all other routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📁 Portfolio: http://localhost:${PORT}/index.html`);
});
