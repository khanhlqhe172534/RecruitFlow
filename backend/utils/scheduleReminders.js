const nodemailer = require("nodemailer");
const cron = require("node-cron");
const Interview = require("../models/interview.model");

class ReminderService {
  constructor() {
    this.transporter = null;
    this.sentReminders = new Set(); // Changed from scheduledJobs
    this.isInitialized = false;
  }

  async initializeTransporter() {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error(
        "Email credentials are not properly configured in environment variables"
      );
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          rejectUnauthorized: true,
        },
      });

      await this.transporter.verify();
      console.log("Email transporter initialized successfully");
    } catch (error) {
      console.error("Failed to initialize email transporter:", error);
      throw error;
    }
  }

  async sendReminderEmail(interview) {
    if (!this.transporter) {
      await this.initializeTransporter();
    }

    if (!interview.interviewer?.email) {
      throw new Error(
        `No interviewer email found for interview: ${interview._id}`
      );
    }

    const emailContent = {
      from: { name: "HR Team", address: process.env.EMAIL_USER },
      to: interview.interviewer.email,
      subject: "Interview Reminder - Starting in 30 minutes",
      html: `<h2>Interview Reminder</h2>
        <p>Hello ${interview.interviewer.fullname || "Interviewer"},</p>
        <p>This is a reminder that you have an interview scheduled in 30 minutes.</p>
        <p><strong>Interview Details:</strong></p>
        <ul>
          <li>Date: ${new Date(interview.interview_date).toLocaleString()}</li>
          <li>Meeting Link: ${interview.meeting_link || "Not provided"}</li>
          <li>Candidate: ${
            interview.candidate ? interview.candidate.fullname : "Not specified"
          }</li>
          <li>Job Position: ${
            interview.job ? interview.job.title : "Not specified"
          }</li>
        </ul>
        <p>Please ensure you're prepared and have a stable internet connection for the meeting.</p>
        <p>Best regards,<br>HR Team</p>`,
    };

    try {
      const info = await this.transporter.sendMail(emailContent);
      console.log(
        `Reminder email sent for interview ${interview._id} to ${interview.interviewer.email}. MessageId: ${info.messageId}`
      );
      return info;
    } catch (error) {
      console.error(
        `Failed to send reminder email to ${interview.interviewer.email}:`,
        error
      );
      if (error.code === "EAUTH") {
        this.transporter = null;
      }
      throw error;
    }
  }

  async scheduleReminders() {
    try {
      const now = new Date();
      const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60000);

      const upcomingInterviews = await Interview.find({
        interview_date: { $gt: now, $lt: thirtyMinutesFromNow },
        result: { $in: ["N/A", null] },
      }).populate("interviewer candidate job");

      for (const interview of upcomingInterviews) {
        const interviewId = interview._id.toString();

        // Check if reminder has already been sent
        if (!this.sentReminders.has(interviewId)) {
          try {
            console.log(`Sending reminder for interview ${interviewId}`);
            await this.sendReminderEmail(interview);

            // Mark as sent to prevent duplicate reminders
            this.sentReminders.add(interviewId);
          } catch (error) {
            console.error(
              `Error sending reminder for interview ${interviewId}:`,
              error
            );
          }
        }
      }

      // Cleanup: remove old entries to prevent memory growth
      if (this.sentReminders.size > 1000) {
        this.sentReminders.clear();
      }
    } catch (error) {
      console.error("Error scheduling reminders:", error);
    }
  }

  initializeReminders() {
    if (this.isInitialized) {
      console.log("Reminder service already running.");
      return;
    }

    console.log("Starting interview reminder service...");
    cron.schedule("*/1 * * * *", async () => {
      // Changed to every 1 minutes
      console.log("Checking for upcoming interviews...");
      await this.scheduleReminders();
    });

    this.isInitialized = true;
    console.log("Interview reminder system is running every 1 minutes.");
  }
}

module.exports = new ReminderService();
