const cron = require("node-cron");
const nodemailer = require("nodemailer");
const Job = require("../models/job.model");
const Status = require("../models/status.model");
const User = require("../models/user.model");
require("dotenv").config();

// Cấu hình nodemailer

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Hàm gửi email thông báo trước 24h
async function sendEndDateReminderEmail(job) {
  const targetRoles = [
    "67b7d800a297fbf7bff8205b", // Benefit Manager
    "67b7d800a297fbf7bff8205a", // Payroll Manager
    "67b7d800a297fbf7bff82059", // Admin
    "67b7d800a297fbf7bff8205c", // Recruitment Manager
  ];

  try {
    const usersToNotify = await User.find({ role: { $in: targetRoles } }, "fullname email");

    if (!usersToNotify.length) {
      console.error("No users found with target roles.");
      return;
    }

    for (const user of usersToNotify) {
      if (!user.email) {
        console.warn(`Skipping user ${user.fullname} due to missing email.`);
        continue;
      }

      const emailContent = {
        from: { name: "HR Team", address: process.env.EMAIL_USER },
        to: user.email,
        subject: `Job End Date Reminder - ${job.job_name} Closing Soon`,
        html: `<h2>Job End Date Reminder</h2>
          <p>Hello <strong>${user.fullname}</strong>,</p>
          <p>This is a reminder that the job <strong>${job.job_name}</strong> will be closing in <strong>24 hours</strong>.</p>
          <p><strong>Job Details:</strong></p>
          <ul>
            <li><strong>Title:</strong> ${job.job_name}</li>
            <li><strong>End Date:</strong> ${new Date(job.end_date).toLocaleString()}</li>
          </ul>
          <p>Please review and take any necessary actions.</p>
          <p>Best regards,<br>HR Team</p>`,
      };

      const info = await transporter.sendMail(emailContent);
      console.log(`End date reminder email sent to ${user.email} (MessageId: ${info.messageId})`);
    }
  } catch (error) {
    console.error("Failed to send end date reminder emails:", error);
  }
}

cron.schedule("0 0 * * *", async () => {
  try {
    console.log("Checking jobs for end date reminders...");
    const closedStatus = await Status.findOne({ name: "closed" });
    console.log("Closed status:", closedStatus);
    if (!closedStatus) {
      console.error("Closed status not found");
      return;
    }

    const currentDate = new Date();
    const nextDay = new Date(currentDate.getTime() + 7 * 60 * 60 * 1000);
    nextDay.setDate(currentDate.getDate() + 1);

    const jobs = await Job.find({
      status: { $ne: closedStatus._id },
      end_date: {
        $gte: new Date(nextDay.setHours(0, 0, 0, 0)),
        $lt: new Date(nextDay.setHours(23, 59, 59, 999)),
      },
    }).populate("createdBy");

    for (const job of jobs) {
      try {
        await sendEndDateReminderEmail(job);
      } catch (error) {
        console.error(`Error sending reminder for job ${job._id}:`, error);
      }
    }

    // Cập nhật trạng thái job thành "closed" nếu đã qua end_date
    const updated = await Job.updateMany(
      { end_date: { $lt: currentDate }, status: { $ne: closedStatus._id } },
      { status: closedStatus._id, updatedAt: new Date() }
    );

    if (updated.modifiedCount > 0) {
      console.log(`Updated ${updated.modifiedCount} jobs to closed status.`);
    }

    console.log("Job reminders checked and statuses updated.");
  } catch (error) {
    console.error("Error processing job reminders:", error);
  }
});
