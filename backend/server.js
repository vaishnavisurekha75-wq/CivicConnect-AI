const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const multer = require("multer");

// ======================================================
// LOAD ROOT .ENV FILE
// ======================================================

require("dotenv").config({
  path: path.join(__dirname, "..", ".env"),
});

// ======================================================
// CREATE APP
// ======================================================

const app = express();

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(cors());

app.use(express.json());

// ======================================================
// OTP STORE
// ======================================================

const otpStore = new Map();

// ======================================================
// MYSQL DATABASE
// ======================================================

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: process.env.DB_PASSWORD,
  database: "civicconnect",
  port: 3306,
});

// ======================================================
// GMAIL TRANSPORTER
// ======================================================

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ======================================================
// TEST GMAIL CONNECTION
// ======================================================

transporter.verify((error) => {
  if (error) {
    console.error("❌ Gmail connection failed:");
    console.error(error.message);
  } else {
    console.log("✅ Gmail SMTP connection successful!");
  }
});

// ======================================================
// IMAGE UPLOAD CONFIGURATION
// ======================================================

const uploadFolder = path.join(
  __dirname,
  "uploads"
);

// Create uploads folder automatically
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, {
    recursive: true,
  });
}

// Serve uploaded images
app.use(
  "/uploads",
  express.static(uploadFolder)
);

// ======================================================
// MULTER STORAGE
// ======================================================

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadFolder);
  },

  filename: function (req, file, cb) {
    const extension = path.extname(
      file.originalname
    );

    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      extension;

    cb(null, uniqueName);
  },
});

// ======================================================
// MULTER UPLOAD
// ======================================================

const upload = multer({
  storage: storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only image files are allowed."
        ),
        false
      );
    }
  },
});

// ======================================================
// HOME ROUTE
// ======================================================

app.get("/", (req, res) => {
  res.send(
    "🚀 CivicConnect AI Backend is Running..."
  );
});

// ======================================================
// TEST DATABASE
// ======================================================

app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT 1 AS connected"
    );

    res.json({
      message:
        "MySQL Connected Successfully!",
      result: rows,
    });
  } catch (error) {
    console.error(
      "❌ Database Error:",
      error.message
    );

    res.status(500).json({
      message:
        "MySQL Connection Failed",
      error: error.message,
    });
  }
});

// ======================================================
// SEND OTP
// ======================================================

app.post("/send-otp", async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const cleanEmail = email
      .trim()
      .toLowerCase();

    // Generate 6 digit OTP
    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Store OTP for 5 minutes
    otpStore.set(cleanEmail, {
      otp: otp,
      name: name || "Citizen",
      expiresAt:
        Date.now() + 5 * 60 * 1000,
    });

    console.log("");
    console.log(
      "================================="
    );
    console.log("📧 NEW OTP GENERATED");
    console.log("Email:", cleanEmail);
    console.log("OTP:", otp);
    console.log(
      "================================="
    );
    console.log("");

    const mailOptions = {
      from: `"CivicConnect AI" <${process.env.EMAIL_USER}>`,

      to: cleanEmail,

      subject:
        "CivicConnect AI - Your OTP",

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: auto;
          padding: 30px;
          background: #f4f9ff;
          border-radius: 20px;
        ">

          <div style="
            background: linear-gradient(
              135deg,
              #2563eb,
              #06b6d4
            );
            padding: 25px;
            border-radius: 18px;
            text-align: center;
            color: white;
          ">

            <h1>CivicConnect AI</h1>

            <p>
              Smart Public Grievance Platform
            </p>

          </div>

          <div style="
            background: white;
            margin-top: 20px;
            padding: 30px;
            border-radius: 18px;
            text-align: center;
          ">

            <h2>Hello ${name || "Citizen"} 👋</h2>

            <p>
              Your CivicConnect AI verification
              code is:
            </p>

            <div style="
              font-size: 36px;
              font-weight: bold;
              letter-spacing: 8px;
              color: #2563eb;
              margin: 25px 0;
            ">
              ${otp}
            </div>

            <p>
              This OTP is valid for 5 minutes.
            </p>

            <p style="
              color: #64748b;
              font-size: 13px;
            ">
              Please do not share this OTP with anyone.
            </p>

          </div>

        </div>
      `,
    };

    await transporter.sendMail(
      mailOptions
    );

    console.log(
      "✅ OTP email sent successfully!"
    );

    res.json({
      message:
        "OTP sent successfully!",
    });
  } catch (error) {
    console.error(
      "❌ Send OTP Error:",
      error.message
    );

    res.status(500).json({
      message:
        "Failed to send OTP",
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
        message:
          "Email and OTP are required",
      });
    }

    const cleanEmail = email
      .trim()
      .toLowerCase();

    const enteredOTP = otp
      .toString()
      .trim();

    const savedOtp =
      otpStore.get(cleanEmail);

    if (!savedOtp) {
      return res.status(400).json({
        message:
          "OTP expired or not found. Please request a new OTP.",
      });
    }

    if (
      Date.now() >
      savedOtp.expiresAt
    ) {
      otpStore.delete(cleanEmail);

      return res.status(400).json({
        message:
          "OTP expired. Please request a new OTP.",
      });
    }

    if (
      savedOtp.otp !==
      enteredOTP
    ) {
      return res.status(400).json({
        message:
          "Invalid OTP. Please enter the latest OTP.",
      });
    }

    // Correct OTP
    otpStore.delete(cleanEmail);

    console.log("");
    console.log(
      "================================="
    );
    console.log("✅ OTP VERIFIED");
    console.log("Email:", cleanEmail);
    console.log(
      "================================="
    );
    console.log("");

    res.json({
      message:
        "OTP verified successfully!",
    });
  } catch (error) {
    console.error(
      "❌ OTP Verification Error:",
      error.message
    );

    res.status(500).json({
      message:
        "OTP verification failed",
      error: error.message,
    });
  }
});

// ======================================================
// DEPARTMENT ROUTING
// ======================================================

function getDepartment(category) {
  switch (category) {
    case "Road Damage":
      return "Roads & Buildings Department";

    case "Garbage":
      return "Municipal Sanitation Department";

    case "Water Supply":
      return "Water Supply Department";

    case "Drainage":
      return "Municipal Engineering Department";

    case "Street Light":
      return "Electrical Department";

    case "Electricity":
      return "Electricity Department";

    case "Sanitation":
      return "Municipal Sanitation Department";

    case "Other":
    case "Others":
      return "General Civic Department";

    default:
      return "General Civic Department";
  }
}

// ======================================================
// SUBMIT COMPLAINT
// ======================================================

app.post(
  "/complaints",
  upload.single("image"),
  async (req, res) => {
    console.log("");
    console.log(
      "================================="
    );
    console.log(
      "🔥 COMPLAINT REQUEST RECEIVED"
    );
    console.log(
      "================================="
    );

    console.log(
      "BODY:",
      req.body
    );

    if (req.file) {
      console.log(
        "📸 IMAGE:",
        req.file.filename
      );
    } else {
      console.log(
        "📸 IMAGE: No image uploaded"
      );
    }

    try {
      // ==================================================
      // GET FORM DATA
      // ==================================================

      const {
        name,
        email,
        title,
        category,
        description,
        location,
        status,
        priority,
      } = req.body || {};

      // ==================================================
      // VALIDATION
      // ==================================================

      if (!name || !email) {
        return res.status(400).json({
          message:
            "Name and email are required.",
        });
      }

      if (
        !description ||
        !description.trim()
      ) {
        return res.status(400).json({
          message:
            "Complaint description is required.",
        });
      }

      const cleanEmail = email
        .trim()
        .toLowerCase();

      // ==================================================
      // IMAGE URL
      // ==================================================

      let finalImageUrl = "";

      if (req.file) {
        finalImageUrl =
          `/uploads/${req.file.filename}`;

        console.log(
          "📸 IMAGE SAVED:",
          finalImageUrl
        );
      }

      // ==================================================
      // AI CATEGORY PREDICTION
      // ==================================================

      let aiCategory =
        category || "Others";

      let aiConfidence = 0;

      if (
        description &&
        description.trim()
      ) {
        try {
          console.log("");
          console.log(
            "🤖 Sending complaint to AI..."
          );

          const aiResponse =
            await axios.post(
              "http://127.0.0.1:5050/predict",

              {
                complaint:
                  description.trim(),
              },

              {
                timeout: 10000,
              }
            );

          aiCategory =
            aiResponse.data.category ||
            "Others";

          aiConfidence =
            Number(
              aiResponse.data.confidence
            ) || 0;

          console.log("");
          console.log(
            "================================="
          );
          console.log(
            "🤖 AI PREDICTION SUCCESS"
          );
          console.log(
            "Category:",
            aiCategory
          );
          console.log(
            "Confidence:",
            aiConfidence + "%"
          );
          console.log(
            "================================="
          );
          console.log("");
        } catch (aiError) {
          console.error(
            "⚠️ AI prediction failed:",
            aiError.message
          );

          console.log(
            "Using frontend category as fallback."
          );
        }
      }

      // ==================================================
      // DEPARTMENT ROUTING
      // ==================================================

      const department =
        getDepartment(aiCategory);

      // ==================================================
      // AUTHORITY ASSIGNMENT
      // ==================================================

      const assignedTo =
        "Authority Pending Assignment";

      // ==================================================
      // INSERT INTO MYSQL
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
          resolution_note
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        name,
        cleanEmail,
        aiCategory,
        description || "",
        location || "",
        finalImageUrl,
        status || "Pending",
        priority || "Medium",
        department,
        assignedTo,
        "",
      ];

      const [result] =
        await db.execute(
          sql,
          values
        );

      // ==================================================
      // SUCCESS LOG
      // ==================================================

      console.log("");
      console.log(
        "================================="
      );
      console.log(
        "✅ COMPLAINT SUBMITTED"
      );
      console.log(
        "Complaint ID:",
        result.insertId
      );
      console.log(
        "Title:",
        title || "Not provided"
      );
      console.log(
        "AI Category:",
        aiCategory
      );
      console.log(
        "AI Confidence:",
        aiConfidence + "%"
      );
      console.log(
        "Priority:",
        priority || "Medium"
      );
      console.log(
        "Department:",
        department
      );
      console.log(
        "Assigned To:",
        assignedTo
      );
      console.log(
        "Image:",
        finalImageUrl || "No image"
      );
      console.log(
        "================================="
      );
      console.log("");

      // ==================================================
      // RESPONSE TO FRONTEND
      // ==================================================

      res.status(201).json({
        message:
          "Complaint submitted successfully!",

        complaintId:
          result.insertId,

        category:
          aiCategory,

        aiConfidence:
          aiConfidence,

        department:
          department,

        assignedTo:
          assignedTo,

        status:
          status || "Pending",

        priority:
          priority || "Medium",

        imageUrl:
          finalImageUrl,
      });
    } catch (error) {
      console.error("");
      console.error(
        "❌ COMPLAINT ERROR"
      );
      console.error(
        error.message
      );
      console.error("");

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
// GET CITIZEN COMPLAINTS
// ======================================================

app.get(
  "/complaints",
  async (req, res) => {
    try {
      const { email } =
        req.query;

      if (
        !email ||
        !email.trim()
      ) {
        return res.status(400).json({
          message:
            "Email is required",
        });
      }

      const cleanEmail =
        email
          .trim()
          .toLowerCase();

      const [rows] =
        await db.execute(
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
        error.message
      );

      res.status(500).json({
        message:
          "Failed to fetch complaints",

        error:
          error.message,
      });
    }
  }
);

// ======================================================
// ADMIN - GET ALL COMPLAINTS
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
            status,
            priority,
            department,
            assigned_to,
            resolution_note,
            created_at,
            updated_at
          FROM complaints
          ORDER BY created_at DESC
          `
        );

      res.json(rows);
    } catch (error) {
      console.error(
        "❌ Admin Complaints Error:",
        error.message
      );

      res.status(500).json({
        message:
          "Failed to fetch complaints",

        error:
          error.message,
      });
    }
  }
);

// ======================================================
// MULTER / FILE ERROR HANDLER
// ======================================================

app.use(
  (error, req, res, next) => {
    if (
      error instanceof multer.MulterError
    ) {
      console.error(
        "❌ Multer Error:",
        error.message
      );

      return res.status(400).json({
        message:
          "Image upload error",

        error:
          error.message,
      });
    }

    if (error) {
      console.error(
        "❌ File Upload Error:",
        error.message
      );

      return res.status(400).json({
        message:
          "File upload error",

        error:
          error.message,
      });
    }

    next();
  }
);

// ======================================================
// START SERVER
// ======================================================

const PORT = 5000;

app.listen(
  PORT,
  () => {
    console.log("");
    console.log(
      "================================="
    );
    console.log(
      "🚀 CivicConnect AI Backend"
    );
    console.log(
      "http://localhost:5000"
    );
    console.log(
      "📸 Image Upload: ENABLED"
    );
    console.log(
      "🤖 AI Prediction: ENABLED"
    );
    console.log(
      "🗄️ MySQL Database: ENABLED"
    );
    console.log(
      "📧 Gmail OTP: ENABLED"
    );
    console.log(
      "================================="
    );
    console.log("");
  }
);