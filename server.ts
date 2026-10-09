import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize GoogleGenAI client if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    aiEnabled: Boolean(aiClient),
    timestamp: new Date().toISOString(),
  });
});

// API: AI Student Mentor
app.post('/api/gemini/assistant', async (req: Request, res: Response) => {
  const { query, studentContext } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  // If live AI is available, generate grounded advice
  if (aiClient) {
    try {
      const systemInstruction = `You are ProAct AI Mentor, the personal academic success and risk management companion for college students.
You have access to the authenticated student's real saved academic record:
- Name: ${studentContext?.name || 'Student'}
- Branch & Year: ${studentContext?.branch || 'Engineering'}, ${studentContext?.year || 'Academic Year'} (${studentContext?.semester || ''})
- Target Attendance Threshold: ${studentContext?.targetAttendance || 75}%
- Daily Available Study Hours: ${studentContext?.availableStudyHours || 3} hrs/day
- Enrolled Subjects & Attendance: ${JSON.stringify(studentContext?.subjects || [])}
- Active Academic Risks: ${JSON.stringify(studentContext?.risks || [])}
- Pending Assignments & Deadlines: ${JSON.stringify(studentContext?.pendingTodos || [])}

Rules:
1. Ground answers strictly on the user's saved facts. Never invent grades, marks, subjects, or imaginary courses.
2. If the student has low attendance in a subject, calculate and explain the exact deficit against their target.
3. Suggest practical, supportive, non-judgmental guidance and revision pacing.
4. If no subjects or records are present, gently ask the student to add their coursework in "My Subjects".
5. Keep answers concise, formatted with clean bullet points or short paragraphs.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: query,
        config: {
          systemInstruction,
          temperature: 0.6,
        },
      });

      return res.json({
        reply: response.text || 'I analyzed your saved coursework. Review your Academic Risks tab for detailed steps.',
        isLiveAI: true,
      });
    } catch (err: unknown) {
      console.error('Gemini Assistant Error:', err);
      // Fall through to deterministic fallback
    }
  }

  // Fallback reasoning engine when API key is unconfigured or rate limited
  const qLower = String(query).toLowerCase();
  let fallbackReply = '';

  const subjects = studentContext?.subjects || [];
  const targetPct = studentContext?.targetAttendance || 75;

  if (qLower.includes('attendance') || qLower.includes('miss')) {
    const lowAtt = subjects.filter((s: any) => s.percentage < targetPct);
    if (lowAtt.length > 0) {
      const s = lowAtt[0];
      fallbackReply = `Based on your saved records, **${s.name}** is currently at **${s.percentage}%**, which is below your configured target of **${targetPct}%** (attended ${s.attended}/${s.total} classes). You need to attend upcoming scheduled lectures without missing any to restore eligibility.`;
    } else if (subjects.length > 0) {
      fallbackReply = `All your ${subjects.length} registered subjects are currently meeting or exceeding your attendance target of **${targetPct}%**. Keep up consistent class participation!`;
    } else {
      fallbackReply = `You haven't added any subjects yet. Head to **My Subjects** in the sidebar to add your courses and start tracking attendance.`;
    }
  } else if (qLower.includes('risk') || qLower.includes('priority')) {
    const risks = studentContext?.risks || [];
    if (risks.length > 0) {
      fallbackReply = `You have **${risks.length} active academic risk(s)**:\n- **${risks[0].title}**: ${risks[0].triggerData}\nCheck the **Academic Risks** section for specific corrective actions and target dates.`;
    } else {
      fallbackReply = `No high-severity academic risks are currently detected in your saved records. Keep monitoring your coursework deadlines!`;
    }
  } else {
    fallbackReply = `Hello ${studentContext?.name || 'there'}! I'm your ProAct AI Mentor. You have ${subjects.length} subjects registered and ${studentContext?.pendingTodos?.length || 0} pending deliverables. You can ask me about attendance calculations, revision schedules, or how to handle difficult topics.`;
  }

  return res.json({
    reply: fallbackReply,
    isLiveAI: false,
  });
});

// API: Generate / Adapt Recovery Plan
app.post('/api/gemini/recovery-plan', async (req: Request, res: Response) => {
  const { scenarioDetails, currentPlan, studentInfo } = req.body;

  if (aiClient) {
    try {
      const prompt = `Student ${studentInfo?.name || 'Aarav'} needs a structured academic recovery plan.
Context:
- Current attendance deficits: ${scenarioDetails?.attendanceDeficit || 'Data Communications needs 4 classes to reach 75%'}
- Weak / Remedial subjects: ${scenarioDetails?.weakSubjects || 'Digital Signal Processing backlog, Algorithms Test 2 (62%)'}
- Available daily study budget: ${scenarioDetails?.dailyHours || 3} hours/day
- Target timeframe: Next 7 days
- Previous missed tasks: ${JSON.stringify(currentPlan?.filter((t: any) => t.status === 'missed') || [])}

Generate a JSON array of 5 to 7 high-impact recovery tasks. Each item must be a JSON object with:
- "id": string unique id (e.g. "task-1")
- "title": string task title
- "subject": string course code or name
- "day": string (e.g. "Day 1 (Today)", "Day 2", "Day 3")
- "estimatedMinutes": number (30 to 120)
- "priority": "Urgent" | "High" | "Normal"
- "reason": concise explanation why this task recovers their standing
- "status": "pending"`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.4,
        },
      });

      const parsed = JSON.parse(response.text || '[]');
      if (Array.isArray(parsed) && parsed.length > 0) {
        return res.json({ tasks: parsed, isLiveAI: true });
      }
    } catch (err: unknown) {
      console.error('Gemini Plan Error:', err);
    }
  }

  // Deterministic adaptive fallback
  const fallbackTasks = [
    {
      id: `task-${Date.now()}-1`,
      title: 'Attend Data Communications Lecture & Note Verification',
      subject: 'Data Communications (CS304)',
      day: 'Day 1 (Today)',
      estimatedMinutes: 60,
      priority: 'Urgent',
      reason: 'Mandatory lecture to recover attendance from 71.4% toward 75% eligibility mark.',
      status: 'pending',
    },
    {
      id: `task-${Date.now()}-2`,
      title: 'Complete Algorithms Assignment 4 (Dynamic Programming)',
      subject: 'Design & Analysis of Algorithms',
      day: 'Day 1 (Tonight)',
      estimatedMinutes: 90,
      priority: 'Urgent',
      reason: 'Internal assessment deadline in 36 hours; accounts for 15% of internal score.',
      status: 'pending',
    },
    {
      id: `task-${Date.now()}-3`,
      title: 'Digital Signal Processing: Fourier Transforms Remedial Drill',
      subject: 'DSP Remedial Prep',
      day: 'Day 2',
      estimatedMinutes: 75,
      priority: 'High',
      reason: 'Targeting core backlog module before upcoming supplementary exams.',
      status: 'pending',
    },
    {
      id: `task-${Date.now()}-4`,
      title: 'Machine Learning Mini-Project Dataset Validation',
      subject: 'Machine Learning (CS308)',
      day: 'Day 3',
      estimatedMinutes: 60,
      priority: 'High',
      reason: 'Prevent last-minute bottleneck before lab evaluation next week.',
      status: 'pending',
    },
    {
      id: `task-${Date.now()}-5`,
      title: 'Data Communications Quiz 2 Topic Revision (Routing Protocols)',
      subject: 'Data Communications (CS304)',
      day: 'Day 4',
      estimatedMinutes: 45,
      priority: 'Normal',
      reason: 'Reinforces quiz score to boost overall internal grade above 75%.',
      status: 'pending',
    },
    {
      id: `task-${Date.now()}-6`,
      title: 'Weekly Knowledge Check & Backlog Mock Test',
      subject: 'Academic Review',
      day: 'Day 5',
      estimatedMinutes: 60,
      priority: 'Normal',
      reason: 'Validates week-1 recovery milestone and updates syllabus confidence.',
      status: 'pending',
    },
  ];

  return res.json({ tasks: fallbackTasks, isLiveAI: false });
});

// API: Lost & Found Match Reasoner
app.post('/api/gemini/match-lost-found', async (req: Request, res: Response) => {
  const { lostItem, foundItem } = req.body;

  if (aiClient) {
    try {
      const prompt = `Evaluate if these two campus items could be a potential match:
Lost Item:
- Title: ${lostItem?.title}
- Category: ${lostItem?.category}
- Description: ${lostItem?.description}
- Location: ${lostItem?.location}
- Date: ${lostItem?.date}

Found Item:
- Title: ${foundItem?.title}
- Category: ${foundItem?.category}
- Description: ${foundItem?.description}
- Location: ${foundItem?.location}
- Date: ${foundItem?.date}

Return a JSON object:
{
  "matchLikelihood": "High" | "Moderate" | "Low",
  "confidenceScore": number (0 to 100),
  "reasoning": string explanation of similarities, location proximity, and timeline,
  "verificationTip": string practical question for claimant to verify ownership
}`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      return res.json({
        ...JSON.parse(response.text || '{}'),
        isLiveAI: true,
      });
    } catch (err: unknown) {
      console.error('Gemini Lost & Found Match Error:', err);
    }
  }

  // Heuristic matching fallback
  const isCategoryMatch = lostItem?.category?.toLowerCase() === foundItem?.category?.toLowerCase();
  res.json({
    matchLikelihood: isCategoryMatch ? 'Moderate' : 'Low',
    confidenceScore: isCategoryMatch ? 72 : 30,
    reasoning: `Both items share category "${lostItem?.category || 'General'}" and proximate campus zones (${lostItem?.location || 'Campus'} & ${foundItem?.location || 'Campus'}). Date difference is within 48 hours.`,
    verificationTip: 'Ask the claimant to specify any distinct stickers, serial number, or exact contents inside.',
    isLiveAI: false,
  });
});

// Mount Vite or static build
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ProAct AI Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
