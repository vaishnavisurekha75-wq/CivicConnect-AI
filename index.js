const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================================================
// FIXED SYSTEM ACCOUNTS
// ======================================================

const FIXED_OFFICER_ID = 3;
const FIXED_ADMIN_ID = 4;

const normalizeRole = (role) => {
  if (!role) return "";
  return role.toString().trim().toLowerCase();
};

const getAuthorizedAccountRole = (userId) => {
  const id = Number(userId);

  if (id === FIXED_OFFICER_ID) return "officer";
  if (id === FIXED_ADMIN_ID) return "admin";

  return "citizen";
};

const isFixedAccount = (userId, role) => {
  const cleanRole = normalizeRole(role);
  const id = Number(userId);

  return (
    (id === FIXED_OFFICER_ID && cleanRole === "officer") ||
    (id === FIXED_ADMIN_ID && cleanRole === "admin")
  );
};

// ======================================================
// PASSWORD HASH
// ======================================================

const hashPassword = (password) => {
  return crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");
};

// ======================================================
// UPLOADS
// ======================================================

const uploadsPath = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

app.use("/uploads", express.static(uploadsPath));

// ======================================================
// MULTER
// ======================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsPath);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

// ======================================================
// OTP
// ======================================================

const otpStore = new Map();

// ======================================================
// MYSQL
// ======================================================

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: process.env.DB_PASSWORD,
  database: "civicconnect",
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ======================================================
// NOTIFICATIONS TABLE
// ======================================================

const initializeNotificationsTable = async () => {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        complaint_id INT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'general',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_notifications_email (email),
        INDEX idx_notifications_complaint_id (complaint_id),
        INDEX idx_notifications_created_at (created_at)
      )
    `);

    console.log("✅ Notifications table ready!");
  } catch (error) {
    console.error(
      "❌ Notifications table initialization failed:",
      error.message
    );
  }
};

// ======================================================
// CREATE NOTIFICATION
// ======================================================

const createNotification = async ({
  email,
  complaintId = null,
  title,
  message,
  type = "general",
}) => {
  try {
    if (!email || !title || !message) {
      return null;
    }

    const cleanEmail = email.toString().trim().toLowerCase();

    const [result] = await db.execute(
      `
      INSERT INTO notifications
      (
        email,
        complaint_id,
        title,
        message,
        type,
        is_read
      )
      VALUES (?, ?, ?, ?, ?, FALSE)
      `,
      [
        cleanEmail,
        complaintId,
        title,
        message,
        type,
      ]
    );

    console.log(`🔔 Notification created for ${cleanEmail}`);

    return result.insertId;
  } catch (error) {
    console.error(
      "❌ Create notification error:",
      error.message
    );

    return null;
  }
};

// ======================================================
// GMAIL
// ======================================================

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error("❌ Gmail connection failed:");
    console.error(error.message);
  } else {
    console.log("✅ Gmail SMTP connection successful!");
  }
});

// ======================================================
// HOME
// ======================================================

app.get("/", (req, res) => {
  res.send("CivicConnect Backend is Running!");
});

// ======================================================
// TEST DB
// ======================================================

app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT 1 AS connected"
    );

    res.json({
      message: "MySQL Connected Successfully!",
      result: rows,
    });
  } catch (error) {
    console.error("❌ Database Error:", error);

    res.status(500).json({
      message: "MySQL Connection Failed",
      error: error.message,
    });
  }
});

// ======================================================
// SEND OTP
// ======================================================

app.post("/send-otp", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      purpose = "register",
    } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (purpose === "register") {
      if (!name || !name.trim()) {
        return res.status(400).json({
          message: "Name is required",
        });
      }

      if (!password || password.length < 6) {
        return res.status(400).json({
          message:
            "Password must be at least 6 characters",
        });
      }

      const [existingUsers] = await db.execute(
        `
        SELECT
          id,
          name,
          email,
          role,
          is_verified
        FROM users
        WHERE LOWER(email) = ?
        LIMIT 1
        `,
        [cleanEmail]
      );

      if (existingUsers.length > 0) {
        const existingUser = existingUsers[0];

        if (
          Number(existingUser.id) === FIXED_OFFICER_ID ||
          Number(existingUser.id) === FIXED_ADMIN_ID
        ) {
          return res.status(403).json({
            message:
              "This email belongs to a protected staff account. Please use the official staff login.",
          });
        }

        if (
          normalizeRole(existingUser.role) === "officer" ||
          normalizeRole(existingUser.role) === "admin"
        ) {
          return res.status(403).json({
            message:
              "This account has an invalid staff-role configuration.",
          });
        }

        if (Boolean(existingUser.is_verified)) {
          return res.status(409).json({
            message:
              "Account already exists. Please login instead.",
          });
        }
      }
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    otpStore.set(cleanEmail, {
      otp,
      name: name || "Citizen",
      password: password || "",
      purpose,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    console.log("");
    console.log("=================================");
    console.log("NEW OTP GENERATED");
    console.log("Email:", cleanEmail);
    console.log("Purpose:", purpose);
    console.log("OTP:", otp);
    console.log("=================================");
    console.log("");

    await transporter.sendMail({
      from: `"CivicConnect AI" <${process.env.EMAIL_USER}>`,
      to: cleanEmail,
      subject:
        "CivicConnect AI - Email Verification OTP",

      html: `
        <div style="
          font-family:Arial,sans-serif;
          max-width:600px;
          margin:auto;
          padding:30px;
          background:#f5f7fa;
          border-radius:20px;
        ">

          <div style="
            height:6px;
            background:linear-gradient(
              to right,
              #ff9933 0%,
              #ff9933 33%,
              #ffffff 33%,
              #ffffff 66%,
              #138808 66%,
              #138808 100%
            );
            border-radius:10px;
          "></div>

          <div style="
            background:#0b1f3a;
            padding:28px;
            margin-top:10px;
            border-radius:18px;
            text-align:center;
            color:white;
          ">
            <h1 style="margin:0;font-size:28px;">
              CivicConnect AI
            </h1>

            <p style="margin-top:8px;color:#dbeafe;">
              Smart Public Grievance Platform
            </p>
          </div>

          <div style="
            background:white;
            margin-top:20px;
            padding:30px;
            border-radius:18px;
            text-align:center;
            border:1px solid #e5e7eb;
          ">

            <h2 style="color:#0b1f3a;">
              Hello ${name || "Citizen"} 👋
            </h2>

            <p style="color:#4b5563;">
              Your email verification OTP is:
            </p>

            <div style="
              font-size:36px;
              font-weight:bold;
              letter-spacing:10px;
              color:#0057b8;
              margin:25px 0;
            ">
              ${otp}
            </div>

            <p style="color:#374151;">
              This OTP is valid for
              <strong>5 minutes</strong>.
            </p>

            <p style="
              color:#6b7280;
              font-size:14px;
            ">
              Please do not share this OTP with anyone.
            </p>
          </div>

          <p style="
            text-align:center;
            color:#777;
            margin-top:20px;
            font-size:13px;
          ">
            © 2026 CivicConnect AI
          </p>
        </div>
      `,
    });

    console.log("✅ OTP EMAIL SENT SUCCESSFULLY");

    res.json({
      message: "OTP sent successfully!",
    });
  } catch (error) {
    console.error("❌ OTP EMAIL ERROR:", error);

    res.status(500).json({
      message: "Failed to send OTP email",
      error: error.message,
    });
  }
});

// ======================================================
// VERIFY OTP
// ======================================================

app.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const enteredOTP = otp.toString().trim();

    const savedOtp = otpStore.get(cleanEmail);

    if (!savedOtp) {
      return res.status(400).json({
        message:
          "OTP not found. Please request a new OTP.",
      });
    }

    if (Date.now() > savedOtp.expiresAt) {
      otpStore.delete(cleanEmail);

      return res.status(400).json({
        message:
          "OTP expired. Please request a new OTP.",
      });
    }

    if (savedOtp.otp !== enteredOTP) {
      return res.status(400).json({
        message:
          "Invalid OTP. Please enter the latest OTP.",
      });
    }

    otpStore.delete(cleanEmail);

    const name = savedOtp.name || "Citizen";
    const password = savedOtp.password || "";

    const passwordHash = password
      ? hashPassword(password)
      : "";

    const [existingUsers] = await db.execute(
      `
      SELECT
        id,
        name,
        email,
        role,
        is_verified
      FROM users
      WHERE LOWER(email) = ?
      LIMIT 1
      `,
      [cleanEmail]
    );

    let userId;

    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];

      if (
        Number(existingUser.id) === FIXED_OFFICER_ID ||
        Number(existingUser.id) === FIXED_ADMIN_ID ||
        normalizeRole(existingUser.role) === "officer" ||
        normalizeRole(existingUser.role) === "admin"
      ) {
        return res.status(403).json({
          message:
            "This is a protected staff account. Staff accounts cannot be registered through Citizen registration.",
        });
      }

      userId = existingUser.id;

      await db.execute(
        `
        UPDATE users
        SET
          name = ?,
          password = ?,
          is_verified = TRUE,
          role = 'citizen'
        WHERE id = ?
        `,
        [
          name,
          passwordHash,
          userId,
        ]
      );
    } else {
      const [result] = await db.execute(
        `
        INSERT INTO users
        (
          name,
          email,
          password,
          is_verified,
          role
        )
        VALUES (?, ?, ?, TRUE, 'citizen')
        `,
        [
          name,
          cleanEmail,
          passwordHash,
        ]
      );

      userId = result.insertId;
    }

    res.json({
      message:
        "OTP verified successfully! Citizen account created.",
      userId,
      email: cleanEmail,
      name,
      role: "citizen",
      accountVerified: true,
    });
  } catch (error) {
    console.error(
      "❌ OTP VERIFICATION ERROR:",
      error
    );

    res.status(500).json({
      message: "OTP verification failed",
      error: error.message,
    });
  }
});

// ======================================================
// LOGIN
// ======================================================

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const passwordHash = hashPassword(password);

    const [users] = await db.execute(
      `
      SELECT
        id,
        name,
        email,
        password,
        is_verified,
        role
      FROM users
      WHERE LOWER(email) = ?
      LIMIT 1
      `,
      [cleanEmail]
    );

    if (users.length === 0) {
      return res.status(401).json({
        message:
          "Account not found. Please create an account first.",
      });
    }

    const user = users[0];

    if (!Boolean(user.is_verified)) {
      return res.status(403).json({
        message:
          "Account is not verified. Please verify your account using OTP.",
      });
    }

    if (user.password !== passwordHash) {
      return res.status(401).json({
        message: "Incorrect email or password.",
      });
    }

    const expectedRole =
      getAuthorizedAccountRole(user.id);

    const databaseRole =
      normalizeRole(user.role);

    if (
      Number(user.id) === FIXED_OFFICER_ID &&
      databaseRole !== "officer"
    ) {
      return res.status(403).json({
        message:
          "Protected Officer account configuration is invalid.",
      });
    }

    if (
      Number(user.id) === FIXED_ADMIN_ID &&
      databaseRole !== "admin"
    ) {
      return res.status(403).json({
        message:
          "Protected Administrator account configuration is invalid.",
      });
    }

    if (
      Number(user.id) !== FIXED_OFFICER_ID &&
      Number(user.id) !== FIXED_ADMIN_ID &&
      (databaseRole === "officer" ||
        databaseRole === "admin")
    ) {
      return res.status(403).json({
        message:
          "This account has an invalid protected-role configuration.",
      });
    }

    res.json({
      message: "Login successful",

      user: {
        id: Number(user.id),
        name: user.name,
        email: user.email,
        role: expectedRole,
        isVerified: Boolean(user.is_verified),
        fixedAccount: isFixedAccount(
          user.id,
          expectedRole
        ),
      },
    });
  } catch (error) {
    console.error("❌ LOGIN ERROR:", error);

    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
});

// ======================================================
// ROLE VALIDATION
// ======================================================

app.patch("/users/role", async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({
        message:
          "Email and role are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const requestedRole = normalizeRole(role);

    const allowedRoles = [
      "citizen",
      "officer",
      "admin",
    ];

    if (!allowedRoles.includes(requestedRole)) {
      return res.status(400).json({
        message: "Invalid role selected",
      });
    }

    const [users] = await db.execute(
      `
      SELECT
        id,
        name,
        email,
        is_verified,
        role
      FROM users
      WHERE LOWER(email) = ?
      LIMIT 1
      `,
      [cleanEmail]
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: "User account not found",
      });
    }

    const user = users[0];

    if (!Boolean(user.is_verified)) {
      return res.status(403).json({
        message:
          "Account is not verified. Please verify your email first.",
      });
    }

    const authorizedRole =
      getAuthorizedAccountRole(user.id);

    const databaseRole =
      normalizeRole(user.role);

    if (databaseRole !== authorizedRole) {
      return res.status(403).json({
        message:
          "This account has an invalid platform-role configuration.",
        authorized: false,
        actualRole: databaseRole || null,
        expectedRole: authorizedRole,
      });
    }

    if (requestedRole !== authorizedRole) {
      return res.status(403).json({
        message:
          "This account is not authorized for the selected workspace.",
        authorized: false,
        actualRole: authorizedRole,
      });
    }

    res.json({
      message:
        authorizedRole === "citizen"
          ? "Citizen role verified successfully"
          : authorizedRole === "officer"
          ? "Officer role verified successfully"
          : "Administrator role verified successfully",

      email: cleanEmail,
      role: authorizedRole,
      authorized: true,
      fixedAccount:
        authorizedRole === "officer" ||
        authorizedRole === "admin",
    });
  } catch (error) {
    console.error(
      "❌ ROLE VALIDATION ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Failed to validate user role",
      error: error.message,
    });
  }
});

// ======================================================
// DEPARTMENT ROUTING
// ======================================================

const getDepartmentByCategory = (category) => {
  switch (category) {
    case "Road Damage":
      return "Roads & Buildings Department";

    case "Garbage":
    case "Sanitation":
      return "Municipal Sanitation Department";

    case "Water Supply":
      return "Water Supply Department";

    case "Drainage":
      return "Municipal Engineering Department";

    case "Street Light":
      return "Electrical Department";

    case "Electricity":
      return "Electricity Department";

    case "Other":
    case "Others":
      return "General Civic Department";

    default:
      return "General Civic Department";
  }
};

// ======================================================
// CITIZEN COMPLAINTS
// ======================================================

app.get("/complaints", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email || !email.trim()) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const cleanEmail =
      email.trim().toLowerCase();

    const [rows] = await db.execute(
      `
      SELECT *
      FROM complaints
      WHERE LOWER(email) = ?
      ORDER BY created_at DESC
      `,
      [cleanEmail]
    );

    res.json(rows);
  } catch (error) {
    console.error(
      "❌ Fetch Complaints Error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch complaints",
      error: error.message,
    });
  }
});

// ======================================================
// NOTIFICATIONS
// ======================================================

app.get("/notifications", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email || !email.trim()) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const cleanEmail =
      email.trim().toLowerCase();

    const [rows] = await db.execute(
      `
      SELECT
        id,
        email,
        complaint_id,
        title,
        message,
        type,
        is_read,
        created_at
      FROM notifications
      WHERE LOWER(email) = ?
      ORDER BY created_at DESC
      `,
      [cleanEmail]
    );

    res.json(rows);
  } catch (error) {
    console.error(
      "❌ Fetch Notifications Error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch notifications",
      error: error.message,
    });
  }
});

app.patch(
  "/notifications/:id/read",
  async (req, res) => {
    try {
      const { id } = req.params;
      const { email } = req.body;

      if (!email || !email.trim()) {
        return res.status(400).json({
          message: "Email is required",
        });
      }

      const cleanEmail =
        email.trim().toLowerCase();

      const [result] = await db.execute(
        `
        UPDATE notifications
        SET is_read = TRUE
        WHERE id = ?
        AND LOWER(email) = ?
        `,
        [id, cleanEmail]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message:
            "Notification not found",
        });
      }

      res.json({
        message:
          "Notification marked as read",
        notificationId: Number(id),
      });
    } catch (error) {
      res.status(500).json({
        message:
          "Failed to mark notification as read",
        error: error.message,
      });
    }
  }
);

app.patch(
  "/notifications/read-all",
  async (req, res) => {
    try {
      const { email } = req.body;

      if (!email || !email.trim()) {
        return res.status(400).json({
          message: "Email is required",
        });
      }

      const cleanEmail =
        email.trim().toLowerCase();

      const [result] = await db.execute(
        `
        UPDATE notifications
        SET is_read = TRUE
        WHERE LOWER(email) = ?
        AND is_read = FALSE
        `,
        [cleanEmail]
      );

      res.json({
        message:
          "All notifications marked as read",
        updatedCount:
          result.affectedRows,
      });
    } catch (error) {
      res.status(500).json({
        message:
          "Failed to mark notifications as read",
        error: error.message,
      });
    }
  }
);

// ======================================================
// DUPLICATE DETECTION HELPERS
// ======================================================

const normalizeComplaintText = (text) => {
  return (text || "")
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const calculateDescriptionSimilarity = (
  first,
  second
) => {
  const firstWords = new Set(
    normalizeComplaintText(first)
      .split(" ")
      .filter(
        (word) => word.length >= 3
      )
  );

  const secondWords = new Set(
    normalizeComplaintText(second)
      .split(" ")
      .filter(
        (word) => word.length >= 3
      )
  );

  if (
    firstWords.size === 0 ||
    secondWords.size === 0
  ) {
    return 0;
  }

  let commonWords = 0;

  firstWords.forEach((word) => {
    if (secondWords.has(word)) {
      commonWords++;
    }
  });

  const union = new Set([
    ...firstWords,
    ...secondWords,
  ]);

  return commonWords / union.size;
};

// ======================================================
// SUBMIT COMPLAINT
// ======================================================

app.post(
  "/complaints",
  upload.fields([
    {
      name: "image",
      maxCount: 1,
    },
    {
      name: "video",
      maxCount: 1,
    },
  ]),
  async (req, res) => {
    try {
      const {
        name,
        email,
        category,
        description,
        location,
        image_url,
        priority,
        forceSubmit,
      } = req.body;

      if (!name || !email) {
        return res.status(400).json({
          message:
            "Name and email are required",
        });
      }

      if (!category || !category.trim()) {
        return res.status(400).json({
          message:
            "Complaint category is required",
        });
      }

      const cleanEmail =
        email.trim().toLowerCase();

      const cleanCategory =
        category.trim();

      const cleanDescription =
        (description || "").trim();

      const cleanLocation =
        (location || "").trim();

      // ==================================================
      // VERIFY CITIZEN
      // ==================================================

      const [users] = await db.execute(
        `
        SELECT
          id,
          role,
          is_verified
        FROM users
        WHERE LOWER(email) = ?
        LIMIT 1
        `,
        [cleanEmail]
      );

      if (users.length === 0) {
        return res.status(403).json({
          message:
            "Only registered users can submit complaints.",
        });
      }

      const complaintUser = users[0];

      const authorizedRole =
        getAuthorizedAccountRole(
          complaintUser.id
        );

      if (authorizedRole !== "citizen") {
        return res.status(403).json({
          message:
            "Only Citizen accounts can submit public complaints.",
        });
      }

      if (!Boolean(complaintUser.is_verified)) {
        return res.status(403).json({
          message:
            "Please verify your account before submitting a complaint.",
        });
      }

      // ==================================================
      // DUPLICATE COMPLAINT DETECTION
      // ==================================================

      const bypassDuplicateCheck =
        String(forceSubmit || "").toLowerCase() ===
        "true";

      if (!bypassDuplicateCheck) {
        const [existingComplaints] =
          await db.execute(
            `
            SELECT
              id,
              name,
              email,
              category,
              description,
              location,
              status,
              priority,
              department,
              assigned_to,
              created_at
            FROM complaints
            WHERE status IN ('Pending', 'In Progress')
            ORDER BY created_at DESC
            LIMIT 100
            `
          );

        let bestDuplicate = null;
        let bestScore = 0;

        const newCategory =
          normalizeComplaintText(
            cleanCategory
          );

        const newLocation =
          normalizeComplaintText(
            cleanLocation
          );

        for (
          const existing of existingComplaints
        ) {
          const oldCategory =
            normalizeComplaintText(
              existing.category
            );

          const oldLocation =
            normalizeComplaintText(
              existing.location
            );

          const categoryMatch =
            newCategory === oldCategory;

          let locationMatch = false;

          if (
            newLocation &&
            oldLocation
          ) {
            locationMatch =
              newLocation === oldLocation ||
              newLocation.includes(
                oldLocation
              ) ||
              oldLocation.includes(
                newLocation
              );
          }

          const descriptionSimilarity =
            calculateDescriptionSimilarity(
              cleanDescription,
              existing.description
            );

          let score = 0;

          if (categoryMatch) {
            score += 40;
          }

          if (locationMatch) {
            score += 30;
          }

          if (
            descriptionSimilarity >=
            0.5
          ) {
            score += 30;
          } else if (
            descriptionSimilarity >=
            0.3
          ) {
            score += 20;
          }

          if (
            score >= 70 &&
            score > bestScore
          ) {
            bestScore = score;
            bestDuplicate = existing;
          }
        }

        if (bestDuplicate) {
          console.log("");
          console.log(
            "================================="
          );
          console.log(
            "⚠️ DUPLICATE COMPLAINT DETECTED"
          );
          console.log(
            "Existing Complaint:",
            bestDuplicate.id
          );
          console.log(
            "Similarity Score:",
            bestScore
          );
          console.log(
            "================================="
          );
          console.log("");

          return res.status(409).json({
            duplicate: true,

            message:
              "A similar complaint already exists.",

            similarityScore:
              bestScore,

            existingComplaint: {
              id:
                Number(
                  bestDuplicate.id
                ),

              category:
                bestDuplicate.category,

              description:
                bestDuplicate.description,

              location:
                bestDuplicate.location,

              status:
                bestDuplicate.status,

              priority:
                bestDuplicate.priority,

              department:
                bestDuplicate.department,

              assignedTo:
                bestDuplicate.assigned_to,

              createdAt:
                bestDuplicate.created_at,
            },
          });
        }
      }

      // ==================================================
      // DEPARTMENT
      // ==================================================

      const department =
        getDepartmentByCategory(
          cleanCategory
        );

      const complaintStatus = "Pending";

      const complaintPriority =
        priority || "Medium";

      // ==================================================
      // IMAGE
      // ==================================================

      let finalImageUrl =
        image_url || "";

      if (
        req.files &&
        req.files.image &&
        req.files.image.length > 0
      ) {
        const imageFile =
          req.files.image[0];

        finalImageUrl =
          `/uploads/${imageFile.filename}`;

        console.log(
          "📸 Complaint image:",
          finalImageUrl
        );
      }

      // ==================================================
      // VIDEO
      // ==================================================

      if (
        req.files &&
        req.files.video &&
        req.files.video.length > 0
      ) {
        console.log(
          "🎥 Complaint video:",
          `/uploads/${req.files.video[0].filename}`
        );
      }

      const assignedTo =
        "Authority Pending Assignment";

      // ==================================================
      // INSERT
      // ==================================================

      const sql = `
        INSERT INTO complaints
        (
          name,
          email,
          category,
          description,
          location,
          image_url,
          status,
          priority,
          department,
          assigned_to,
          resolution_note,
          resolution_image_url
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        name,
        cleanEmail,
        cleanCategory,
        cleanDescription,
        cleanLocation,
        finalImageUrl,
        complaintStatus,
        complaintPriority,
        department,
        assignedTo,
        "",
        "",
      ];

      const [result] =
        await db.execute(
          sql,
          values
        );

      const complaintId =
        result.insertId;

      // ==================================================
      // NOTIFICATION
      // ==================================================

      await createNotification({
        email: cleanEmail,

        complaintId,

        title:
          "Complaint Submitted Successfully",

        message:
          `Your complaint #${complaintId} has been submitted successfully and is currently Pending review.`,

        type:
          "complaint_submitted",
      });

      console.log("");
      console.log(
        "================================="
      );
      console.log(
        "✅ COMPLAINT SUBMITTED"
      );
      console.log(
        "Complaint ID:",
        complaintId
      );
      console.log(
        "Citizen:",
        cleanEmail
      );
      console.log(
        "Category:",
        cleanCategory
      );
      console.log(
        "Department:",
        department
      );
      console.log(
        "Priority:",
        complaintPriority
      );
      console.log(
        "================================="
      );
      console.log("");

      res.status(201).json({
        message:
          "Complaint submitted successfully!",

        complaintId,

        category:
          cleanCategory,

        department,

        assignedTo,

        status:
          complaintStatus,

        priority:
          complaintPriority,

        imageUrl:
          finalImageUrl,
      });
    } catch (error) {
      console.error(
        "❌ COMPLAINT ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Failed to submit complaint",
        error:
          error.message,
      });
    }
  }
);

// ======================================================
// ADMIN COMPLAINTS
// ======================================================

app.get(
  "/admin/complaints",
  async (req, res) => {
    try {
      const [rows] =
        await db.execute(
          `
          SELECT
            id,
            name,
            email,
            category,
            description,
            location,
            image_url,
            resolution_image_url,
            status,
            priority,
            created_at,
            department,
            assigned_to,
            resolution_note
          FROM complaints
          ORDER BY created_at DESC
          `
        );

      res.json(rows);
    } catch (error) {
      console.error(
        "❌ Admin Complaints Error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch admin complaints",
        error: error.message,
      });
    }
  }
);

// ======================================================
// OFFICER COMPLAINTS
// ======================================================

app.get(
  "/officer/complaints",
  async (req, res) => {
    try {
      const [rows] =
        await db.execute(
          `
          SELECT
            id,
            name,
            email,
            category,
            description,
            location,
            image_url,
            resolution_image_url,
            status,
            priority,
            created_at,
            department,
            assigned_to,
            resolution_note
          FROM complaints
          ORDER BY created_at DESC
          `
        );

      res.json(rows);
    } catch (error) {
      console.error(
        "❌ Officer Complaints Error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch officer complaints",
        error: error.message,
      });
    }
  }
);

// ======================================================
// UPDATE COMPLAINT STATUS
// ======================================================

app.patch(
  "/complaints/:id/status",
  upload.single("resolution_image"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        status,
        resolution_note,
        assigned_to,
      } = req.body;

      const allowedStatuses = [
        "Pending",
        "In Progress",
        "Resolved",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message:
            "Invalid complaint status",
        });
      }

      if (
        status === "Resolved" &&
        (!resolution_note ||
          !resolution_note.trim())
      ) {
        return res.status(400).json({
          message:
            "Resolution note is required when resolving a complaint",
        });
      }

      const [existingRows] =
        await db.execute(
          `
          SELECT
            id,
            email,
            status,
            category,
            resolution_image_url
          FROM complaints
          WHERE id = ?
          `,
          [id]
        );

      if (existingRows.length === 0) {
        return res.status(404).json({
          message:
            "Complaint not found",
        });
      }

      const existingComplaint =
        existingRows[0];

      const previousStatus =
        existingComplaint.status;

      let resolutionImageUrl =
        existingComplaint.resolution_image_url ||
        "";

      if (req.file) {
        resolutionImageUrl =
          `/uploads/${req.file.filename}`;
      }

      const officerName =
        assigned_to &&
        assigned_to.trim()
          ? assigned_to.trim()
          : "Department Officer";

      const [result] =
        await db.execute(
          `
          UPDATE complaints
          SET
            status = ?,
            resolution_note = ?,
            assigned_to = ?,
            resolution_image_url = ?
          WHERE id = ?
          `,
          [
            status,
            resolution_note
              ? resolution_note.trim()
              : "",
            officerName,
            resolutionImageUrl,
            id,
          ]
        );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message:
            "Complaint not found",
        });
      }

      if (previousStatus !== status) {
        let notificationTitle =
          "Complaint Status Updated";

        let notificationMessage =
          `Your complaint #${id} status has been updated to ${status}.`;

        let notificationType =
          "status_update";

        if (status === "In Progress") {
          notificationTitle =
            "Complaint In Progress";

          notificationMessage =
            `Your complaint #${id} is now In Progress. The concerned authority is working on your issue.`;

          notificationType =
            "in_progress";
        }

        if (status === "Resolved") {
          notificationTitle =
            "Complaint Resolved";

          notificationMessage =
            `Your complaint #${id} has been resolved by the concerned authority.`;

          notificationType =
            "resolved";
        }

        if (status === "Pending") {
          notificationTitle =
            "Complaint Status Updated";

          notificationMessage =
            `Your complaint #${id} is currently Pending review.`;

          notificationType =
            "pending";
        }

        await createNotification({
          email:
            existingComplaint.email,

          complaintId:
            Number(id),

          title:
            notificationTitle,

          message:
            notificationMessage,

          type:
            notificationType,
        });
      }

      res.json({
        message:
          "Complaint updated successfully",

        complaintId:
          Number(id),

        status,

        resolutionNote:
          resolution_note || "",

        assignedTo:
          officerName,

        resolutionImageUrl:
          resolutionImageUrl,

        notificationCreated:
          previousStatus !== status,
      });
    } catch (error) {
      console.error(
        "❌ STATUS UPDATE ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Failed to update complaint status",
        error:
          error.message,
      });
    }
  }
);

// ======================================================
// DEBUG ROLE
// ======================================================

app.get(
  "/test-role-route",
  (req, res) => {
    res.json({
      message:
        "Role API is available!",

      route:
        "PATCH /users/role",

      fixedAccounts: {
        officer:
          FIXED_OFFICER_ID,

        admin:
          FIXED_ADMIN_ID,
      },
    });
  }
);

// ======================================================
// START SERVER
// ======================================================

const startServer = async () => {
  await initializeNotificationsTable();

  app.listen(5000, () => {
    console.log("");
    console.log(
      "================================="
    );
    console.log(
      "🚀 CivicConnect Backend Started"
    );
    console.log(
      "http://localhost:5000"
    );
    console.log(
      "Fixed Officer ID:",
      FIXED_OFFICER_ID
    );
    console.log(
      "Fixed Admin ID:",
      FIXED_ADMIN_ID
    );
    console.log(
      "Citizen Registration: ENABLED"
    );
    console.log(
      "Officer/Admin Registration: BLOCKED"
    );
    console.log(
      "🔔 Citizen Notifications: ENABLED"
    );
    console.log(
      "🔁 Duplicate Detection: ENABLED"
    );
    console.log(
      "================================="
    );
    console.log("");
  });
};

startServer();