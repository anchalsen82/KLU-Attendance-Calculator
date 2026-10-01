import { GoogleGenAI } from '@google/genai';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'anchalsen82@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Anchal@0495';

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Increase body limit for PDF attachments
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Central persistent data directory
const DATA_DIR = path.resolve(__dirname, 'data');
const CALENDARS_FILE = path.join(DATA_DIR, 'calendars.json');
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'notifications.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helpers for reading/writing persistent data
function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return fallback;
}

function writeJsonFile<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// Minimal valid sample PDF generator for initial seed
function generateSamplePdfBase64(title: string, subtitle: string, lines: string[]): string {
  const textStream = `
BT
/F1 16 Tf
50 750 Td
(${title}) Tj
0 -22 Td
/F1 11 Tf
(${subtitle}) Tj
0 -26 Td
/F1 10 Tf
${lines.map((l) => `(${l}) Tj 0 -14 Td`).join('\n')}
ET
  `.trim();

  const streamLength = textStream.length;
  const pdfBody = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length ${streamLength} >>
stream
${textStream}
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000323 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${400 + streamLength}
%%EOF`;

  return `data:application/pdf;base64,${Buffer.from(pdfBody).toString('base64')}`;
}

// Initialize seed data if not present
if (!fs.existsSync(CALENDARS_FILE)) {
  const initialCalendars = [
    {
      id: 'kare-cal-2024-odd',
      title: 'Kalasalingam University Academic Calendar 2024–2025 (Odd Semester)',
      academicYear: '2024–2025',
      semester: 'Odd Semester',
      description: 'Official schedule for B.Tech/M.Tech classes, CAT-1, CAT-2, and End Semester Examinations.',
      fileName: 'KARE_Academic_Calendar_2024_2025_Odd.pdf',
      fileSize: '42.8 KB',
      fileData: generateSamplePdfBase64(
        'KALASALINGAM ACADEMY OF RESEARCH AND EDUCATION',
        'OFFICIAL ACADEMIC CALENDAR 2024-2025 (ODD SEMESTER)',
        [
          '1. Commencement of Classes: July 15, 2024',
          '2. Continuous Assessment Test I (CAT-1): August 26 - August 31, 2024',
          '3. Continuous Assessment Test II (CAT-2): October 14 - October 19, 2024',
          '4. Practical End Semester Examinations: November 11 - November 16, 2024',
          '5. Theory End Semester Examinations: November 20 - December 06, 2024',
          '6. Minimum Mandatory Attendance: 85% without penalty',
          '7. Condonation Eligibility (Subject to Medical/OD Approval): 75% to 84.9%',
          '8. Detention Cutoff: Below 75% strictly ineligible for exams.',
          '',
          'Office of the Controller of Examinations & Dean Academic'
        ]
      ),
      uploadedBy: 'Office of Dean Academic / COE',
      uploadedAt: Date.now() - 1000 * 60 * 60 * 24 * 15,
      isLatest: true,
    },
    {
      id: 'kare-cal-2023-even',
      title: 'Kalasalingam University Academic Calendar 2023–2024 (Even Semester)',
      academicYear: '2023–2024',
      semester: 'Even Semester',
      description: 'Archived calendar for Even Semester 2023–2024.',
      fileName: 'KARE_Academic_Calendar_2023_2024_Even.pdf',
      fileSize: '39.5 KB',
      fileData: generateSamplePdfBase64(
        'KALASALINGAM ACADEMY OF RESEARCH AND EDUCATION',
        'OFFICIAL ACADEMIC CALENDAR 2023-2024 (EVEN SEMESTER)',
        [
          '1. Commencement of Classes: January 08, 2024',
          '2. CAT-1 Examinations: February 19 - February 24, 2024',
          '3. CAT-2 Examinations: April 01 - April 06, 2024',
          '4. End Semester Theory Exams: May 02 - May 18, 2024',
          '5. Mandatory Attendance: 85% required.'
        ]
      ),
      uploadedBy: 'Office of Dean Academic',
      uploadedAt: Date.now() - 1000 * 60 * 60 * 24 * 120,
      isLatest: false,
    },
  ];
  writeJsonFile(CALENDARS_FILE, initialCalendars);
}

if (!fs.existsSync(NOTIFICATIONS_FILE)) {
  const initialNotifications = [
    {
      id: 'kare-notif-1',
      title: 'Mandatory 85% Attendance Cutoff for End Semester Exam Eligibility',
      message:
        'All students are advised to check their course-wise attendance on the SIS portal. Students maintaining 85% and above will be automatically issued hall tickets. Students between 75% and 84.9% must submit approved medical or OD certificates to their HoD for condonation processing.',
      category: 'urgent',
      isPinned: true,
      uploadedAt: Date.now() - 1000 * 60 * 60 * 4,
      uploadedBy: 'Controller of Examinations',
      attachment: {
        fileName: 'COE_Attendance_Notice_October_2024.pdf',
        fileSize: '34.2 KB',
        fileData: generateSamplePdfBase64(
          'KARE - CONTROLLER OF EXAMINATIONS',
          'OFFICIAL NOTICE: ATTENDANCE ELIGIBILITY FOR ESE',
          [
            'Date: October 2024',
            'All undergraduate and postgraduate students must maintain at least 85% attendance.',
            'Condonation is only permitted between 75% and 84.9% upon payment of prescribed fees',
            'and submission of genuine medical / official on-duty documentation.',
            'Students with less than 75% attendance will be detained in the respective course.',
            '',
            'By Order of: Controller of Examinations'
          ]
        ),
        fileType: 'application/pdf',
      },
    },
    {
      id: 'kare-notif-2',
      title: 'Schedule for Continuous Assessment Test 2 (CAT-2)',
      message:
        'The timetable and seating arrangements for Continuous Assessment Test 2 (CAT-2) for all 2nd, 3rd, and 4th year B.Tech branches have been released. Please download the attached schedule and report to your designated halls 15 minutes before commencement.',
      category: 'examination',
      isPinned: true,
      uploadedAt: Date.now() - 1000 * 60 * 60 * 28,
      uploadedBy: 'Office of Academic Affairs',
      attachment: {
        fileName: 'CAT2_Timetable_October_2024.pdf',
        fileSize: '29.7 KB',
        fileData: generateSamplePdfBase64(
          'KALASALINGAM ACADEMY OF RESEARCH AND EDUCATION',
          'CAT-2 EXAMINATION TIMETABLE OCTOBER 2024',
          [
            'Session Timing: Morning 09:30 AM - 11:30 AM | Afternoon 01:30 PM - 03:30 PM',
            'Students must carry university ID cards at all times.',
            'Hall tickets can be verified via the SIS portal.'
          ]
        ),
        fileType: 'application/pdf',
      },
    },
    {
      id: 'kare-notif-3',
      title: 'Academic Fee Payment & Semester Registration Circular',
      message:
        'The last date for payment of tuition and academic fees for the upcoming semester without late fine is November 15, 2024. Students can pay through the online student payment gateway or designated bank counters.',
      category: 'academic',
      isPinned: false,
      uploadedAt: Date.now() - 1000 * 60 * 60 * 72,
      uploadedBy: 'Finance & Accounts Section',
    },
    {
      id: 'kare-notif-4',
      title: 'University Holiday Announcement: Ayudha Pooja & Vijayadasami',
      message:
        'The university will remain closed on October 11 and October 12, 2024 on account of Ayudha Pooja and Vijayadasami. Classes will resume on Monday, October 14, 2024.',
      category: 'holiday',
      isPinned: false,
      uploadedAt: Date.now() - 1000 * 60 * 60 * 96,
      uploadedBy: 'Registrar Office',
    },
  ];
  writeJsonFile(NOTIFICATIONS_FILE, initialNotifications);
}

// -------------------------------------------------------------
// REST API ENDPOINTS
// -------------------------------------------------------------

// Admin Authentication (Private credentials validation)
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Both admin email and password are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedAdminEmail = ADMIN_EMAIL.trim().toLowerCase();

  if (normalizedEmail !== normalizedAdminEmail) {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Unauthorized administrator email.',
    });
  }

  if (password === ADMIN_PASSWORD) {
    return res.json({
      success: true,
      token: 'kare_admin_authenticated_session_' + Date.now(),
      role: 'admin',
      adminName: 'Anchal Singh',
      message: 'Authentication successful',
    });
  }

  return res.status(401).json({ success: false, error: 'Incorrect admin password.' });
});

// Admin Google Authentication
app.post('/api/admin/google-login', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: 'Google account email is required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedAdminEmail = ADMIN_EMAIL.trim().toLowerCase();

  if (normalizedEmail === normalizedAdminEmail) {
    return res.json({
      success: true,
      token: 'kare_admin_google_session_' + Date.now(),
      role: 'admin',
      adminName: 'Anchal Singh',
      message: 'Google authentication successful',
    });
  }

  return res.status(403).json({
    success: false,
    error: 'Access denied. This Google account is not registered as an administrator.',
  });
});

// GET all academic calendars
app.get('/api/calendars', (_req, res) => {
  const calendars = readJsonFile<any[]>(CALENDARS_FILE, []);
  // Sort latest first, then by uploadedAt descending
  calendars.sort((a, b) => {
    if (a.isLatest && !b.isLatest) return -1;
    if (!a.isLatest && b.isLatest) return 1;
    return (b.uploadedAt || 0) - (a.uploadedAt || 0);
  });
  res.json({ success: true, calendars });
});

// POST upload new academic calendar
app.post('/api/calendars', (req, res) => {
  const { title, academicYear, semester, description, fileName, fileSize, fileData, isLatest, uploadedBy } = req.body;

  if (!title || !fileData) {
    return res.status(400).json({ success: false, error: 'Title and PDF file are required.' });
  }

  const calendars = readJsonFile<any[]>(CALENDARS_FILE, []);

  // If this calendar is marked as latest, unmark others
  if (isLatest) {
    calendars.forEach((c) => {
      c.isLatest = false;
    });
  }

  const newCalendar = {
    id: 'cal-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    title: title.trim(),
    academicYear: academicYear || '2024–2025',
    semester: semester || 'Current Semester',
    description: description || '',
    fileName: fileName || 'Academic_Calendar.pdf',
    fileSize: fileSize || 'Unknown size',
    fileData,
    uploadedBy: uploadedBy || 'Admin / Academic Section',
    uploadedAt: Date.now(),
    isLatest: Boolean(isLatest),
  };

  calendars.unshift(newCalendar);
  writeJsonFile(CALENDARS_FILE, calendars);

  res.status(201).json({ success: true, calendar: newCalendar, message: 'Academic calendar published successfully' });
});

// PUT update calendar
app.put('/api/calendars/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const calendars = readJsonFile<any[]>(CALENDARS_FILE, []);
  const index = calendars.findIndex((c) => c.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Calendar not found' });
  }

  if (updates.isLatest) {
    calendars.forEach((c) => {
      c.isLatest = false;
    });
  }

  calendars[index] = {
    ...calendars[index],
    ...updates,
    id, // protect id
    updatedAt: Date.now(),
  };

  writeJsonFile(CALENDARS_FILE, calendars);
  res.json({ success: true, calendar: calendars[index], message: 'Calendar updated successfully' });
});

// DELETE calendar
app.delete('/api/calendars/:id', (req, res) => {
  const { id } = req.params;
  const calendars = readJsonFile<any[]>(CALENDARS_FILE, []);
  const filtered = calendars.filter((c) => c.id !== id);

  if (filtered.length === calendars.length) {
    return res.status(404).json({ success: false, error: 'Calendar not found' });
  }

  // If we deleted the latest, promote the first one
  if (filtered.length > 0 && !filtered.some((c) => c.isLatest)) {
    filtered[0].isLatest = true;
  }

  writeJsonFile(CALENDARS_FILE, filtered);
  res.json({ success: true, message: 'Academic calendar deleted successfully' });
});

// GET all notifications
app.get('/api/notifications', (_req, res) => {
  const notifications = readJsonFile<any[]>(NOTIFICATIONS_FILE, []);
  // Sort pinned first, then newest first
  notifications.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return (b.uploadedAt || 0) - (a.uploadedAt || 0);
  });
  res.json({ success: true, notifications });
});

// POST add notification
app.post('/api/notifications', (req, res) => {
  const { title, message, category, isPinned, attachment, uploadedBy } = req.body;

  if (!title || !message) {
    return res.status(400).json({ success: false, error: 'Title and message are required.' });
  }

  const notifications = readJsonFile<any[]>(NOTIFICATIONS_FILE, []);

  const newNotification = {
    id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    title: title.trim(),
    message: message.trim(),
    category: category || 'academic',
    isPinned: Boolean(isPinned),
    uploadedAt: Date.now(),
    uploadedBy: uploadedBy || 'Admin / College Authority',
    attachment: attachment || undefined,
  };

  notifications.unshift(newNotification);
  writeJsonFile(NOTIFICATIONS_FILE, notifications);

  res.status(201).json({ success: true, notification: newNotification, message: 'Notification published successfully' });
});

// PUT update notification
app.put('/api/notifications/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const notifications = readJsonFile<any[]>(NOTIFICATIONS_FILE, []);
  const index = notifications.findIndex((n) => n.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Notification not found' });
  }

  notifications[index] = {
    ...notifications[index],
    ...updates,
    id,
    updatedAt: Date.now(),
  };

  writeJsonFile(NOTIFICATIONS_FILE, notifications);
  res.json({ success: true, notification: notifications[index], message: 'Notification updated successfully' });
});

// DELETE notification
app.delete('/api/notifications/:id', (req, res) => {
  const { id } = req.params;
  const notifications = readJsonFile<any[]>(NOTIFICATIONS_FILE, []);
  const filtered = notifications.filter((n) => n.id !== id);

  if (filtered.length === notifications.length) {
    return res.status(404).json({ success: false, error: 'Notification not found' });
  }

  writeJsonFile(NOTIFICATIONS_FILE, filtered);
  res.json({ success: true, message: 'Notification deleted successfully' });
});

// AI Attendance Assistant Advisor
app.post('/api/ai/attendance-advisor', async (req, res) => {
  const { message, attendanceContext } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ success: false, error: 'User query message is required.' });
  }

  // Analytical rule-based fallback generator
  const generateFallbackResponse = (userPrompt: string, ctx: any): string => {
    const overall = ctx?.overallPercentage ?? 0;
    const target = ctx?.targetPercentage ?? 75;
    const bunks = ctx?.safeBunks ?? 0;
    const recovery = ctx?.recoveryNeeded ?? 0;
    const conducted = ctx?.totalConducted ?? 0;
    const attended = ctx?.totalAttended ?? 0;
    const isSafe = overall >= target;
    const lower = userPrompt.toLowerCase();

    if (lower.includes('bunk') || lower.includes('skip') || lower.includes('leave') || lower.includes('miss')) {
      if (isSafe) {
        return `📊 **Attendance Health:** Your current standing is **${overall}%** (Attended ${attended}/${conducted} classes), which is **${(overall - target).toFixed(1)}% above** your ${target}% target.\n\n✅ **Safe Bunk Allowance:** You can safely miss up to **${bunks} classes** right now without dropping below ${target}%.\n\n💡 **Advisor Tip:** Avoid bunks immediately before internal mid-terms or lab evaluation sessions to keep your marks intact.`;
      } else {
        return `⚠️ **Attendance Warning:** You are at **${overall}%**, which is below the mandatory **${target}%** university criterion. You have **0 safe bunks**.\n\n📈 **Recovery Action:** You must attend the next **${recovery} consecutive classes** without missing any hour to reach ${target}%.`;
      }
    }

    if (lower.includes('recover') || lower.includes('shortage') || lower.includes('low') || lower.includes('detention') || lower.includes('condonation')) {
      if (isSafe) {
        return `🌟 **No Recovery Needed:** Your attendance is safely maintained at **${overall}%** (${(overall - target).toFixed(1)}% buffer above ${target}%). Continue attending regularly to preserve your examination eligibility.`;
      } else {
        return `🚨 **Recovery Plan Required:**\n- **Current Percentage:** ${overall}%\n- **Target Percentage:** ${target}%\n- **Consecutive Classes Required:** **${recovery} classes**\n\n📌 **Recommendations:**\n1. Prioritize laboratory and skill sessions which carry high credit weight.\n2. Inquire with course faculty about makeup lectures or technical symposium attendance duty.\n3. Submit medical records to the Academic Section if absence was due to illness.`;
      }
    }

    if (lower.includes('rule') || lower.includes('criteria') || lower.includes('policy') || lower.includes('university') || lower.includes('kare')) {
      return `📜 **Kalasalingam University (KARE) Attendance Guidelines:**\n\n1. **Standard Minimum:** **75% cumulative attendance** is mandatory to be eligible for end-semester examinations.\n2. **Medical Condonation (65%–74%):** Only granted with authorized medical certificates or verified institutional duty, subject to Dean/Director Academic approval.\n3. **Critical Shortage (<65%):** Non-condonable; results in detention in the respective course.\n4. **Components:** Theory, practical laboratories, and skill courses are calculated cumulatively toward your eligibility.`;
    }

    return `🎓 **KLU Academic Assistant Analysis:**\n\n- **Overall Attendance:** **${overall}%** (${attended} attended of ${conducted} conducted)\n- **Target Threshold:** **${target}%**\n- **Safe Bunks Available:** **${bunks} classes**\n- **Classes Needed for Target:** **${recovery} classes**\n\n${isSafe ? '✅ You are safely in the eligible zone.' : '⚠️ You need focused recovery to avoid examination detention.'}\n\nYou can ask me specific questions like: *"Can I skip 2 classes tomorrow?"*, *"How many classes to reach 80%?"*, or *"Explain medical condonation rules."*`;
  };

  try {
    if (process.env.GEMINI_API_KEY) {
      const prompt = `You are the Kalasalingam University (KARE) AI Attendance Advisor.
Student Attendance Data:
- Overall Attendance: ${attendanceContext?.overallPercentage ?? 0}%
- Target Attendance: ${attendanceContext?.targetPercentage ?? 75}%
- Total Classes Conducted: ${attendanceContext?.totalConducted ?? 0}
- Total Classes Attended: ${attendanceContext?.totalAttended ?? 0}
- Safe Bunks Available: ${attendanceContext?.safeBunks ?? 0} classes
- Recovery Classes Required: ${attendanceContext?.recoveryNeeded ?? 0} classes
- Courses Breakdown: ${JSON.stringify(attendanceContext?.subjects ?? [])}

University Criteria:
- 75% minimum attendance for end-semester exam hall ticket.
- 65%-74% allowed only with approved medical condonation or official duty.
- Below 65% is non-condonable detention.

Student Query: "${message}"

Give a friendly, mathematically exact, and encouraging answer with concise bullet points and bold highlights.`;

      const response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: prompt,
      });

      const reply = response.text || generateFallbackResponse(message, attendanceContext);
      return res.json({ success: true, reply });
    }
  } catch (err) {
    console.warn('Gemini API call failed, using high-precision fallback engine:', err);
  }

  const fallbackReply = generateFallbackResponse(message, attendanceContext);
  return res.json({ success: true, reply: fallbackReply });
});

// Health check
app.get('/api/health', (_req, res) => {
  const calendars = readJsonFile<any[]>(CALENDARS_FILE, []);
  const notifications = readJsonFile<any[]>(NOTIFICATIONS_FILE, []);
  res.json({
    status: 'ok',
    storage: 'server-filesystem',
    calendarsCount: calendars.length,
    notificationsCount: notifications.length,
    timestamp: new Date().toISOString(),
  });
});

// -------------------------------------------------------------
// FRONTEND INTEGRATION (Vite dev middlewares vs Production static)
// -------------------------------------------------------------
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Development mode: attach Vite dev server middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: serve built assets from dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} [${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}]`);
    console.log(`API endpoints active at /api/calendars and /api/notifications`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
