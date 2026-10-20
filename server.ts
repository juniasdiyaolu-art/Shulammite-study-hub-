import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { eq, and, desc, sql } from 'drizzle-orm';

import { db } from './src/db/index.ts';
import {
  users,
  courses,
  enrollments,
  liveClasses,
  storeItems,
  blogPosts,
  communityPosts,
  serviceRequests,
  siteSettings,
} from './src/db/schema.ts';
import { seedDatabase } from './src/db/seed.ts';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ==========================================
// GEMINI AI COMPANION SERVICE
// ==========================================
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is required for AI features');
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// ==========================================
// DATABASE PERSISTENCE FALLBACK MECHANISM
// ==========================================
let useFallback = false;

// Robust in-memory fallbacks populated with beautiful seed data
let fallbackSettings = {
  brandName: 'Kelvin Digital Creator Hub',
  tagline: 'Learn. Create. Earn.',
  heroTitle: 'Become the Digital Creator Everyone Wants to Hire.',
  heroSubtitle: 'Master CapCut editing, AI tools, AI website building, content creation, online marketing, and other high-income digital skills—all in one place.',
  kelvinBio: "I'm Kelvin Junior, a digital creator passionate about helping people learn practical skills that create real opportunities. I specialize in CapCut video editing, AI-powered website building, content creation, AI productivity, online marketing, and creative digital solutions. My mission is to make learning simple, practical, and results-driven so students can confidently build careers, businesses, and income online.",
  kelvinPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
  phoneNumber: '08128844540',
  email: 'juniasdiyaolu@gmail.com', // fallback default
  whatsapp: 'https://wa.me/2348128844540',
  instagram: 'https://instagram.com/kelvin_junior',
  youtube: 'https://youtube.com/kelvin_creator',
  tiktok: 'https://tiktok.com/@kelvin_editor',
  paymentDetails: 'Kelvin Digital Creator Hub LTD - Bank: GTBank - Account: 0123456789',
  businessHours: 'Mon - Sat: 9:00 AM - 6:00 PM (GMT+1)',
  address: 'Lagos, Nigeria & Online Globally',
};

let fallbackUsers: any[] = [
  {
    id: 1,
    uid: 'kelvin-super-admin-uid',
    email: 'juniasdiyaolu@gmail.com',
    displayName: 'Kelvin Junior',
    profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    xp: 2500,
    streak: 15,
    isAdmin: true,
    createdAt: new Date().toISOString(),
  }
];

let fallbackCourses: any[] = [
  {
    id: 1,
    title: 'CapCut Masterclass',
    description: 'Go from complete beginner to a highly paid video editor. Master speed ramping, color grading, mask transitions, audio design, and advanced visual effects inside CapCut Mobile & Desktop.',
    thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80',
    difficulty: 'Beginner',
    duration: '6h 45m',
    instructor: 'Kelvin Junior',
    lessons: [
      {
        id: 'capcut-l1',
        title: 'Welcome & Interface Walkthrough',
        duration: '12:15',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        notes: 'Introduction to CapCut. We explore the timeline, main toolbar, project settings, media import, and keyboard shortcuts for desktop.',
        quiz: {
          question: 'Which of the following is the standard workflow to import media in CapCut mobile?',
          options: ['Click "New Project" and select your video assets', 'Shake your phone', 'Ask AI to download it', 'Double-tap the empty timeline'],
          correctAnswer: 'Click "New Project" and select your video assets',
          explanation: 'In CapCut Mobile, tap the "New Project" button on the home screen to open your local gallery and select clips.'
        }
      },
      {
        id: 'capcut-l2',
        title: 'Mastering the Cut & Split',
        duration: '15:40',
        videoUrl: 'https://www.w3schools.com/html/movie.mp4',
        notes: 'Learn the art of pacing. Split clips, delete dead space, trim precisely, and arrange your narrative timeline.',
        quiz: {
          question: 'What is the keyboard shortcut for "Split Clip" in CapCut Desktop default keys?',
          options: ['Ctrl + B', 'S', 'Space', 'Ctrl + X'],
          correctAnswer: 'Ctrl + B',
          explanation: 'Ctrl + B is the standard shortcut to split a clip on the timeline in CapCut Desktop.'
        }
      },
      {
        id: 'capcut-l3',
        title: 'Viral Speed Ramping Secrets',
        duration: '22:10',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        notes: 'Create slow-motion & fast-motion pacing curves. Master custom velocity graphs to replicate cinematic reels.',
        quiz: {
          question: 'Which curve preset gives the best "jump cut speed impact" look?',
          options: ['Flash Out', 'Bullet', 'Montage', 'Custom Smooth Curve'],
          correctAnswer: 'Bullet',
          explanation: 'The Bullet speed ramp preset starts very fast, drops to deep slow-motion, and speeds up again, perfect for action beats.'
        }
      }
    ],
    downloadableResources: [
      { name: 'Practice Video Raw Files', url: 'https://example.com/resources/capcut-raw.zip' },
      { name: 'Cinematic Sound Effects Pack', url: 'https://example.com/resources/sfx-pack.zip' }
    ],
    rating: 4.9,
    reviews: [
      { studentName: 'Adewale Okafor', rating: 5, comment: 'This course alone got me my first freelance edit client on Upwork! Thank you Kelvin!', date: '2026-06-10' },
      { studentName: 'Chioma Bello', rating: 4.8, comment: 'Very easy to follow. The speed ramping lesson is pure gold.', date: '2026-07-02' }
    ]
  },
  {
    id: 2,
    title: 'AI Website Building',
    description: 'Build premium, gorgeous, and blazing-fast websites for businesses using modern AI website builders, no-code solutions, and ChatGPT/Gemini code templates. Sell websites for $500+.',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    difficulty: 'Beginner',
    duration: '5h 15m',
    instructor: 'Kelvin Junior',
    lessons: [
      {
        id: 'aiweb-l1',
        title: 'The AI Web Design Blueprint',
        duration: '18:30',
        videoUrl: 'https://www.w3schools.com/html/movie.mp4',
        notes: 'Introduction to AI-powered web design. How to use ChatGPT and Gemini to generate layout structures, copy, and clean typography scales.',
      }
    ],
    downloadableResources: [
      { name: 'AI Client Proposal Templates', url: 'https://example.com/resources/web-proposal.pdf' },
      { name: 'Sleek UI Layout Prompt PDF', url: 'https://example.com/resources/layout-prompts.pdf' }
    ],
    rating: 4.8,
    reviews: [
      { studentName: 'Musa Ibrahim', rating: 5, comment: 'Insanely practical. Built my first business site in 1 hour.', date: '2026-06-18' }
    ]
  },
  {
    id: 3,
    title: 'AI Content Creation',
    description: 'Generate high-quality video hooks, scripts, images, voiceovers, and daily social media calendar systems entirely with AI tools like ChatGPT, Gemini, Midjourney, and ElevenLabs.',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    difficulty: 'Beginner',
    duration: '4h 30m',
    instructor: 'Kelvin Junior',
    lessons: [
      {
        id: 'aicont-l1',
        title: 'Generating Viral Hooks with LLMs',
        duration: '20:15',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        notes: 'How to structure prompts to extract high-attention 3-second hooks based on human psychology and current social algorithms.',
      }
    ],
    downloadableResources: [
      { name: 'Ultimate Viral Hook Templates List', url: 'https://example.com/resources/hooks-list.pdf' }
    ],
    rating: 4.9,
    reviews: [
      { studentName: 'Sarah Lawson', rating: 5, comment: 'My TikTok views doubled since using Kelvin\'s hook prompts!', date: '2026-07-08' }
    ]
  },
  {
    id: 4,
    title: 'AI Productivity Tools',
    description: 'Supercharge your daily work, studies, and creator output. Learn to delegate administrative tasks, automate emails, summarize data, and code minor utilities with AI companion tools.',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    difficulty: 'Beginner',
    duration: '3h 50m',
    instructor: 'Kelvin Junior',
    lessons: [
      {
        id: 'aiprod-l1',
        title: 'Automating Gmail & Calendars',
        duration: '25:00',
        videoUrl: 'https://www.w3schools.com/html/movie.mp4',
        notes: 'Create automated workflows that trigger emails and calendar slots based on form entries or specific keyword receipts.',
      }
    ],
    downloadableResources: [
      { name: 'Zapier Automation Recipes', url: 'https://example.com/resources/zapier-flows.pdf' }
    ],
    rating: 4.7,
    reviews: []
  },
  {
    id: 5,
    title: 'Online Marketing',
    description: 'Learn how to package, launch, and advertise digital skills. Master organic content marketing, highly profitable Facebook/Instagram ads, WhatsApp funnel sales, and client closing.',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    difficulty: 'Intermediate',
    duration: '8h 20m',
    instructor: 'Kelvin Junior',
    lessons: [
      {
        id: 'mkt-l1',
        title: 'Building a High-Conversion WhatsApp Funnel',
        duration: '35:10',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        notes: 'Step-by-step architecture on how to drive cold traffic from Reels to your WhatsApp and close sales with elegant automated broadcasts.',
      }
    ],
    downloadableResources: [
      { name: 'WhatsApp Sales Script Handbook', url: 'https://example.com/resources/sales-scripts.pdf' }
    ],
    rating: 4.9,
    reviews: []
  }
];

let fallbackEnrollments: any[] = [];
let fallbackLiveClasses: any[] = [
  {
    id: 1,
    title: 'CapCut Video Editing Intensive Live',
    description: 'Join Kelvin Junior live as he breaks down real speed-ramping projects, edits a viral short reel on the fly, answers your editing questions, and critiques student-submitted videos.',
    scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    youtubeUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    resources: [{ name: 'Live Stream Asset Files', url: 'https://example.com/live-assets.zip' }],
    registeredUsers: [],
    attendance: [],
    polls: [
      { id: 'poll-1', question: 'Which CapCut platform do you use most?', options: ['CapCut Mobile', 'CapCut Desktop', 'Both Equally'], votes: { 'CapCut Mobile': 12, 'CapCut Desktop': 8, 'Both Equally': 4 }, active: true }
    ],
    qa: [
      { id: 'qa-1', question: 'How do you prevent quality loss when exporting in CapCut Mobile?', askedBy: 'Tunde', votes: 5, answered: true }
    ],
    chatMessages: [
      { id: 'm-1', sender: 'Kelvin Junior', message: 'Welcome to the live chat! Drop your questions in the Q&A panel!', timestamp: new Date().toISOString() }
    ],
    teacherAnnouncements: [
      { id: 'ann-1', text: 'Hi guys! Please download the raw practice files before the stream starts!', date: new Date().toISOString() }
    ],
    isCompleted: false
  }
];

let fallbackStoreItems: any[] = [
  {
    id: 1,
    name: 'CapCut Cinematic Transition Presets',
    description: 'Professional presets containing zoom-ins, flash cuts, smooth slides, and color-glow adjustments to instantly level up your video pacing in CapCut mobile and desktop.',
    price: 15.00,
    type: 'Preset',
    downloadUrl: 'https://example.com/downloads/capcut_presets_pack.zip',
    thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewsCount: 38
  },
  {
    id: 2,
    name: 'Viral Reels CapCut Templates',
    description: 'A collection of 25 fully editable pre-made CapCut timelines with synchronized trending music tracks, visual grids, text placements, and sound effect cues.',
    price: 19.00,
    type: 'Template',
    downloadUrl: 'https://example.com/downloads/viral_templates.zip',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviewsCount: 52
  },
  {
    id: 3,
    name: '500+ ChatGPT Prompts for Content Creators',
    description: 'An elite prompt pack designed to extract viral video ideas, full video scripts, SEO-friendly descriptions, social calendars, and high-conversion landing page copy.',
    price: 9.99,
    type: 'Prompt Pack',
    downloadUrl: 'https://example.com/downloads/chatgpt_prompts_creator.pdf',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    rating: 4.7,
    reviewsCount: 84
  },
  {
    id: 4,
    name: 'Sleek Creator Portfolio Web Template',
    description: 'A highly customizable, fully responsive, and visually modern personal portfolio template built in HTML/Tailwind to showcase your edit reel, services, and client reviews.',
    price: 29.00,
    type: 'Website Template',
    downloadUrl: 'https://example.com/downloads/portfolio_template.zip',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewsCount: 19
  }
];

let fallbackBlogPosts: any[] = [
  {
    id: 1,
    title: 'CapCut Speed Ramping Secrets for Virality',
    content: `Speed ramping is one of the most powerful visual tricks in modern video editing. By smoothly altering the velocity of your clip, you draw intense viewer focus to key visual beats, making simple movements look incredibly high-end.

In this guide, we break down the formula to achieve cinematic ramps using CapCut Mobile or Desktop:

### 1. Reaching the Beat
First, import your clip and locate the "Speed" toolbar. Select "Curve" instead of normal speed adjustment. This opens a velocity graph that allows you to configure exact second-by-second multipliers.

### 2. The Golden Curve Structure
The most popular cinematic curve structure is:
* **Start**: 1.0x (normal speed)
* **Pre-Beat Curve**: Accelerate sharply to 5.0x
* **Impact Point**: Drop instantly to 0.2x (extreme slow-mo)
* **Exit**: Slide smoothly back to 1.0x

This sudden acceleration-to-slowdown flow mirrors natural visual focusing, creating high engagement. Try this on your next edit and watch your views skyrocket!`,
    thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80',
    category: 'CapCut',
    tags: ['CapCut', 'Video Editing', 'Tutorial'],
    author: 'Kelvin Junior',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Top 5 AI Website Builders in 2026 (No-Code)',
    content: `In 2026, web design is faster and smarter than ever before. No-code web development is a high-demand skill, and knowing how to utilize AI design software is a massive competitive advantage.

Here are the top 5 AI website builders we recommend to build and sell premium sites:

1. **Framer AI**: Generates gorgeous, highly interactive layouts from simple text prompts. Excellent for creative portfolios.
2. **Durable**: Perfect for local service businesses. Generates a fully structured site with copy, images, contact forms, and maps in under 30 seconds.
3. **Wix Studio AI**: Integrates deep machine-learning responsiveness, making layout adaptation across devices seamless.
4. **Relume AI**: Outstanding for wireframing and generating comprehensive sitemaps with styled component hierarchies.
5. **V0 by Vercel**: Ideal for creators looking to generate custom styled React UI elements with Tailwind code outputs.`,
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    category: 'Website Building',
    tags: ['AI Tools', 'No-Code', 'Web Design'],
    author: 'Kelvin Junior',
    createdAt: new Date().toISOString(),
  }
];

let fallbackCommunityPosts: any[] = [
  {
    id: 1,
    userId: 1,
    userName: 'Kelvin Junior',
    userPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    title: 'Welcome to the Kelvin Digital Creator Hub! 👋',
    content: "Hey awesome creators! I am incredibly excited to welcome you all to our official platform. This space was designed for you to connect, share your projects, ask questions, and collaborate with other ambitious minds. Drop a comment below introducing yourself, what skill you are focused on learning first, and let's win together!",
    likes: [],
    comments: [
      { id: 'c-1', userName: 'Adebayo Tobi', comment: 'So glad to be here! Ready to master CapCut speed ramps!', date: new Date().toISOString() }
    ],
    tags: ['General', 'Welcome'],
    badges: ['Mentor', 'Admin'],
    createdAt: new Date().toISOString(),
  }
];

let fallbackServiceRequests: any[] = [];

// ==========================================
// DB INITIALIZATION ON SERVER START
// ==========================================
async function initDb() {
  try {
    if (!process.env.SQL_HOST) {
      console.warn('SQL_HOST is not set. Switching to in-memory fallback engine.');
      useFallback = true;
      return;
    }
    await seedDatabase();
    console.log('PostgreSQL initialized & seeded successfully.');
  } catch (err) {
    console.error('Failed to initialize or connect to SQL database. Safe fallbacks activated.', err);
    useFallback = true;
  }
}
initDb();

// Helper: Sync or create user record from AuthRequest
async function getOrRegisterUser(req: AuthRequest) {
  if (!req.user) throw new Error('Unauthenticated');
  const { uid, email, name, picture } = req.user;

  if (useFallback) {
    let user = fallbackUsers.find(u => u.uid === uid);
    if (!user) {
      const isAdmin = email === 'juniasdiyaolu@gmail.com' || email === 'admin@shullamite.com';
      user = {
        id: fallbackUsers.length + 1,
        uid,
        email,
        displayName: name || email.split('@')[0],
        profilePhoto: picture || '',
        xp: 0,
        streak: 1,
        lastStudyAt: new Date().toISOString(),
        isAdmin,
        createdAt: new Date().toISOString(),
      };
      fallbackUsers.push(user);
    } else {
      user.displayName = name || user.displayName;
      user.profilePhoto = picture || user.profilePhoto;
    }
    return user;
  } else {
    const existing = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    const isAdmin = email === 'juniasdiyaolu@gmail.com' || email === 'admin@shullamite.com';

    if (existing.length === 0) {
      const inserted = await db.insert(users).values({
        uid,
        email,
        displayName: name || email.split('@')[0],
        profilePhoto: picture || '',
        xp: 0,
        streak: 1,
        lastStudyAt: new Date(),
        isAdmin,
      }).returning();
      return inserted[0];
    } else {
      const record = existing[0];
      const updated = await db.update(users)
        .set({
          displayName: name || record.displayName,
          profilePhoto: picture || record.profilePhoto,
          lastStudyAt: new Date(),
        })
        .where(eq(users.id, record.id))
        .returning();
      return updated[0];
    }
  }
}

// ==========================================
// ENDPOINTS
// ==========================================

// 1. Auth Sync
app.post('/api/auth/sync', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userRecord = await getOrRegisterUser(req);
    res.json({ success: true, user: userRecord });
  } catch (error: any) {
    console.error('Auth sync error:', error);
    res.status(500).json({ error: 'Failed to synchronize account', details: error.message });
  }
});

// 2. Site Settings
app.get('/api/settings', async (req, res) => {
  try {
    if (useFallback) {
      res.json(fallbackSettings);
    } else {
      const settingsList = await db.select().from(siteSettings).limit(1);
      if (settingsList.length === 0) {
        res.json(fallbackSettings);
      } else {
        res.json(settingsList[0]);
      }
    }
  } catch (error: any) {
    res.json(fallbackSettings);
  }
});

app.put('/api/settings', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await getOrRegisterUser(req);
    if (!user.isAdmin) return res.status(403).json({ error: 'Admin access only' });

    const newSettings = req.body;
    if (useFallback) {
      fallbackSettings = { ...fallbackSettings, ...newSettings };
      res.json(fallbackSettings);
    } else {
      const existing = await db.select().from(siteSettings).limit(1);
      if (existing.length === 0) {
        const inserted = await db.insert(siteSettings).values({
          ...fallbackSettings,
          ...newSettings,
        }).returning();
        res.json(inserted[0]);
      } else {
        const updated = await db.update(siteSettings)
          .set(newSettings)
          .where(eq(siteSettings.id, existing[0].id))
          .returning();
        res.json(updated[0]);
      }
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update settings', details: error.message });
  }
});

// 3. Courses API
app.get('/api/courses', async (req, res) => {
  try {
    if (useFallback) {
      res.json(fallbackCourses);
    } else {
      const list = await db.select().from(courses);
      const parsed = list.map(c => ({
        ...c,
        lessons: JSON.parse(c.lessons),
        downloadableResources: JSON.parse(c.downloadableResources),
        reviews: JSON.parse(c.reviews),
      }));
      res.json(parsed);
    }
  } catch (error: any) {
    res.json(fallbackCourses);
  }
});

app.get('/api/courses/:id', async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    if (useFallback) {
      const course = fallbackCourses.find(c => c.id === courseId);
      if (!course) return res.status(404).json({ error: 'Course not found' });
      res.json(course);
    } else {
      const result = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
      if (result.length === 0) return res.status(404).json({ error: 'Course not found' });
      const c = result[0];
      res.json({
        ...c,
        lessons: JSON.parse(c.lessons),
        downloadableResources: JSON.parse(c.downloadableResources),
        reviews: JSON.parse(c.reviews),
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/courses', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await getOrRegisterUser(req);
    if (!user.isAdmin) return res.status(403).json({ error: 'Admin access only' });

    const courseData = req.body;
    if (useFallback) {
      const newCourse = {
        id: fallbackCourses.length + 1,
        title: courseData.title,
        description: courseData.description,
        thumbnail: courseData.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
        difficulty: courseData.difficulty || 'Beginner',
        duration: courseData.duration || '2h 0m',
        instructor: 'Kelvin Junior',
        lessons: courseData.lessons || [],
        downloadableResources: courseData.downloadableResources || [],
        rating: 5.0,
        reviews: [],
      };
      fallbackCourses.push(newCourse);
      res.json(newCourse);
    } else {
      const inserted = await db.insert(courses).values({
        title: courseData.title,
        description: courseData.description,
        thumbnail: courseData.thumbnail || '',
        difficulty: courseData.difficulty || 'Beginner',
        duration: courseData.duration || '2h 0m',
        instructor: 'Kelvin Junior',
        lessons: JSON.stringify(courseData.lessons || []),
        downloadableResources: JSON.stringify(courseData.downloadableResources || []),
        rating: 5.0,
        reviews: JSON.stringify([]),
      }).returning();
      res.json(inserted[0]);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/courses/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await getOrRegisterUser(req);
    if (!user.isAdmin) return res.status(403).json({ error: 'Admin access only' });

    const courseId = parseInt(req.params.id);
    const updateData = req.body;

    if (useFallback) {
      const index = fallbackCourses.findIndex(c => c.id === courseId);
      if (index === -1) return res.status(404).json({ error: 'Course not found' });
      fallbackCourses[index] = { ...fallbackCourses[index], ...updateData };
      res.json(fallbackCourses[index]);
    } else {
      const dbData: any = {};
      if (updateData.title) dbData.title = updateData.title;
      if (updateData.description) dbData.description = updateData.description;
      if (updateData.thumbnail) dbData.thumbnail = updateData.thumbnail;
      if (updateData.difficulty) dbData.difficulty = updateData.difficulty;
      if (updateData.duration) dbData.duration = updateData.duration;
      if (updateData.lessons) dbData.lessons = JSON.stringify(updateData.lessons);
      if (updateData.downloadableResources) dbData.downloadableResources = JSON.stringify(updateData.downloadableResources);

      const updated = await db.update(courses)
        .set(dbData)
        .where(eq(courses.id, courseId))
        .returning();
      res.json(updated[0]);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/courses/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await getOrRegisterUser(req);
    if (!user.isAdmin) return res.status(403).json({ error: 'Admin access only' });

    const courseId = parseInt(req.params.id);
    if (useFallback) {
      fallbackCourses = fallbackCourses.filter(c => c.id !== courseId);
      res.json({ success: true });
    } else {
      await db.delete(courses).where(eq(courses.id, courseId));
      res.json({ success: true });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Enrollments & Dashboard
app.get('/api/enrollments', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await getOrRegisterUser(req);
    if (useFallback) {
      const userEnrollments = fallbackEnrollments.filter(e => e.userId === user.id);
      res.json(userEnrollments);
    } else {
      const list = await db.select().from(enrollments).where(eq(enrollments.userId, user.id));
      const parsed = list.map(e => ({
        ...e,
        savedNotes: JSON.parse(e.savedNotes),
        bookmarkedLessons: JSON.parse(e.bookmarkedLessons),
      }));
      res.json(parsed);
    }
  } catch (error: any) {
    res.json([]);
  }
});

app.post('/api/courses/:id/enroll', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await getOrRegisterUser(req);
    const courseId = parseInt(req.params.id);

    if (useFallback) {
      let enrollment = fallbackEnrollments.find(e => e.userId === user.id && e.courseId === courseId);
      if (!enrollment) {
        enrollment = {
          id: fallbackEnrollments.length + 1,
          userId: user.id,
          courseId,
          progress: 0,
          completed: false,
          certificateId: null,
          savedNotes: {},
          bookmarkedLessons: [],
          createdAt: new Date().toISOString(),
        };
        fallbackEnrollments.push(enrollment);
      }
      res.json(enrollment);
    } else {
      const existing = await db.select().from(enrollments)
        .where(and(eq(enrollments.userId, user.id), eq(enrollments.courseId, courseId)))
        .limit(1);

      if (existing.length > 0) {
        const e = existing[0];
        return res.json({
          ...e,
          savedNotes: JSON.parse(e.savedNotes),
          bookmarkedLessons: JSON.parse(e.bookmarkedLessons),
        });
      }

      const inserted = await db.insert(enrollments).values({
        userId: user.id,
        courseId,
        progress: 0,
        completed: false,
        savedNotes: JSON.stringify({}),
        bookmarkedLessons: JSON.stringify([]),
      }).returning();
      res.json(inserted[0]);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update Progress (quiz score, lesson watch, notes)
app.put('/api/enrollments/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await getOrRegisterUser(req);
    const enrollmentId = parseInt(req.params.id);
    const { progress, completed, certificateId, savedNotes, bookmarkedLessons } = req.body;

    if (useFallback) {
      const index = fallbackEnrollments.findIndex(e => e.id === enrollmentId && e.userId === user.id);
      if (index === -1) return res.status(404).json({ error: 'Enrollment not found' });

      const e = fallbackEnrollments[index];
      if (progress !== undefined) e.progress = progress;
      if (completed !== undefined) {
        e.completed = completed;
        if (completed && !e.certificateId) {
          e.certificateId = certificateId || `CERT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        }
      }
      if (savedNotes !== undefined) e.savedNotes = savedNotes;
      if (bookmarkedLessons !== undefined) e.bookmarkedLessons = bookmarkedLessons;

      // Add XP
      user.xp += 20;

      res.json(e);
    } else {
      const dbData: any = {};
      if (progress !== undefined) dbData.progress = progress;
      if (completed !== undefined) {
        dbData.completed = completed;
        if (completed) {
          dbData.certificateId = certificateId || `CERT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        }
      }
      if (savedNotes !== undefined) dbData.savedNotes = JSON.stringify(savedNotes);
      if (bookmarkedLessons !== undefined) dbData.bookmarkedLessons = JSON.stringify(bookmarkedLessons);

      const updated = await db.update(enrollments)
        .set(dbData)
        .where(and(eq(enrollments.id, enrollmentId), eq(enrollments.userId, user.id)))
        .returning();

      await db.update(users).set({ xp: user.xp + 20 }).where(eq(users.id, user.id));

      res.json(updated[0]);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Live Classes
app.get('/api/live-classes', async (req, res) => {
  try {
    if (useFallback) {
      res.json(fallbackLiveClasses);
    } else {
      const list = await db.select().from(liveClasses);
      const parsed = list.map(lc => ({
        ...lc,
        resources: JSON.parse(lc.resources),
        registeredUsers: JSON.parse(lc.registeredUsers),
        attendance: JSON.parse(lc.attendance),
        polls: JSON.parse(lc.polls),
        qa: JSON.parse(lc.qa),
        chatMessages: JSON.parse(lc.chatMessages),
        teacherAnnouncements: JSON.parse(lc.teacherAnnouncements),
      }));
      res.json(parsed);
    }
  } catch (error: any) {
    res.json(fallbackLiveClasses);
  }
});

app.post('/api/live-classes', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await getOrRegisterUser(req);
    if (!user.isAdmin) return res.status(403).json({ error: 'Admin access only' });

    const cData = req.body;
    if (useFallback) {
      const newClass = {
        id: fallbackLiveClasses.length + 1,
        title: cData.title,
        description: cData.description,
        scheduledAt: cData.scheduledAt,
        youtubeUrl: cData.youtubeUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        resources: cData.resources || [],
        registeredUsers: [],
        attendance: [],
        polls: cData.polls || [],
        qa: [],
        chatMessages: [],
        teacherAnnouncements: cData.teacherAnnouncements || [],
        isCompleted: false,
      };
      fallbackLiveClasses.push(newClass);
      res.json(newClass);
    } else {
      const inserted = await db.insert(liveClasses).values({
        title: cData.title,
        description: cData.description,
        scheduledAt: cData.scheduledAt,
        youtubeUrl: cData.youtubeUrl || '',
        resources: JSON.stringify(cData.resources || []),
        registeredUsers: JSON.stringify([]),
        attendance: JSON.stringify([]),
        polls: JSON.stringify(cData.polls || []),
        qa: JSON.stringify([]),
        chatMessages: JSON.stringify([]),
        teacherAnnouncements: JSON.stringify(cData.teacherAnnouncements || []),
        isCompleted: false,
      }).returning();
      res.json(inserted[0]);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/live-classes/:id/register', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await getOrRegisterUser(req);
    const classId = parseInt(req.params.id);

    if (useFallback) {
      const index = fallbackLiveClasses.findIndex(c => c.id === classId);
      if (index === -1) return res.status(404).json({ error: 'Class not found' });
      const lc = fallbackLiveClasses[index];
      if (!lc.registeredUsers.includes(user.uid)) {
        lc.registeredUsers.push(user.uid);
      }
      res.json(lc);
    } else {
      const result = await db.select().from(liveClasses).where(eq(liveClasses.id, classId)).limit(1);
      if (result.length === 0) return res.status(404).json({ error: 'Class not found' });
      const lc = result[0];
      const registered = JSON.parse(lc.registeredUsers) as string[];
      if (!registered.includes(user.uid)) {
        registered.push(user.uid);
      }
      const updated = await db.update(liveClasses)
        .set({ registeredUsers: JSON.stringify(registered) })
        .where(eq(liveClasses.id, classId))
        .returning();
      res.json(updated[0]);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Post live chat messages, polls, Q&A inside Live Class
app.post('/api/live-classes/:id/interaction', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await getOrRegisterUser(req);
    const classId = parseInt(req.params.id);
    const { type, message, pollId, option, qaText, announcement } = req.body;

    if (useFallback) {
      const index = fallbackLiveClasses.findIndex(c => c.id === classId);
      if (index === -1) return res.status(404).json({ error: 'Class not found' });
      const lc = fallbackLiveClasses[index];

      if (type === 'chat') {
        lc.chatMessages.push({
          id: `m-${Date.now()}`,
          sender: user.displayName || user.email,
          message,
          timestamp: new Date().toISOString(),
        });
      } else if (type === 'vote') {
        const pollIndex = lc.polls.findIndex((p: any) => p.id === pollId);
        if (pollIndex !== -1) {
          const poll = lc.polls[pollIndex];
          poll.votes[option] = (poll.votes[option] || 0) + 1;
        }
      } else if (type === 'qa') {
        lc.qa.push({
          id: `qa-${Date.now()}`,
          question: qaText,
          askedBy: user.displayName || user.email,
          votes: 1,
          answered: false,
        });
      } else if (type === 'attendance') {
        if (!lc.attendance.includes(user.uid)) {
          lc.attendance.push(user.uid);
          user.xp += 50; // XP for attending live class
        }
      } else if (type === 'announcement' && user.isAdmin) {
        lc.teacherAnnouncements.push({
          id: `ann-${Date.now()}`,
          text: announcement,
          date: new Date().toISOString(),
        });
      }
      res.json(lc);
    } else {
      const result = await db.select().from(liveClasses).where(eq(liveClasses.id, classId)).limit(1);
      if (result.length === 0) return res.status(404).json({ error: 'Class not found' });
      const lc = result[0];

      const chat = JSON.parse(lc.chatMessages);
      const pollsList = JSON.parse(lc.polls);
      const qas = JSON.parse(lc.qa);
      const att = JSON.parse(lc.attendance);
      const anns = JSON.parse(lc.teacherAnnouncements);

      if (type === 'chat') {
        chat.push({
          id: `m-${Date.now()}`,
          sender: user.displayName || user.email,
          message,
          timestamp: new Date().toISOString(),
        });
      } else if (type === 'vote') {
        const poll = pollsList.find((p: any) => p.id === pollId);
        if (poll) {
          poll.votes[option] = (poll.votes[option] || 0) + 1;
        }
      } else if (type === 'qa') {
        qas.push({
          id: `qa-${Date.now()}`,
          question: qaText,
          askedBy: user.displayName || user.email,
          votes: 1,
          answered: false,
        });
      } else if (type === 'attendance') {
        if (!att.includes(user.uid)) {
          att.push(user.uid);
          await db.update(users).set({ xp: user.xp + 50 }).where(eq(users.id, user.id));
        }
      } else if (type === 'announcement' && user.isAdmin) {
        anns.push({
          id: `ann-${Date.now()}`,
          text: announcement,
          date: new Date().toISOString(),
        });
      }

      const updated = await db.update(liveClasses)
        .set({
          chatMessages: JSON.stringify(chat),
          polls: JSON.stringify(pollsList),
          qa: JSON.stringify(qas),
          attendance: JSON.stringify(att),
          teacherAnnouncements: JSON.stringify(anns),
        })
        .where(eq(liveClasses.id, classId))
        .returning();

      res.json({
        ...updated[0],
        resources: JSON.parse(updated[0].resources),
        registeredUsers: JSON.parse(updated[0].registeredUsers),
        attendance: JSON.parse(updated[0].attendance),
        polls: JSON.parse(updated[0].polls),
        qa: JSON.parse(updated[0].qa),
        chatMessages: JSON.parse(updated[0].chatMessages),
        teacherAnnouncements: JSON.parse(updated[0].teacherAnnouncements),
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Digital Store API
app.get('/api/store', async (req, res) => {
  try {
    if (useFallback) {
      res.json(fallbackStoreItems);
    } else {
      const list = await db.select().from(storeItems);
      res.json(list);
    }
  } catch (error: any) {
    res.json(fallbackStoreItems);
  }
});

app.post('/api/store', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await getOrRegisterUser(req);
    if (!user.isAdmin) return res.status(403).json({ error: 'Admin access only' });

    const item = req.body;
    if (useFallback) {
      const newItem = {
        id: fallbackStoreItems.length + 1,
        name: item.name,
        description: item.description,
        price: parseFloat(item.price || '0'),
        type: item.type || 'Template',
        downloadUrl: item.downloadUrl || '#',
        thumbnail: item.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
        rating: 5.0,
        reviewsCount: 0,
      };
      fallbackStoreItems.push(newItem);
      res.json(newItem);
    } else {
      const inserted = await db.insert(storeItems).values({
        name: item.name,
        description: item.description,
        price: parseFloat(item.price || '0'),
        type: item.type || 'Template',
        downloadUrl: item.downloadUrl || '',
        thumbnail: item.thumbnail || '',
        rating: 5.0,
        reviewsCount: 0,
      }).returning();
      res.json(inserted[0]);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Blog Posts API
app.get('/api/blog', async (req, res) => {
  try {
    if (useFallback) {
      res.json(fallbackBlogPosts);
    } else {
      const list = await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
      const parsed = list.map(b => ({
        ...b,
        tags: JSON.parse(b.tags),
      }));
      res.json(parsed);
    }
  } catch (error: any) {
    res.json(fallbackBlogPosts);
  }
});

app.post('/api/blog', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await getOrRegisterUser(req);
    if (!user.isAdmin) return res.status(403).json({ error: 'Admin access only' });

    const post = req.body;
    if (useFallback) {
      const newPost = {
        id: fallbackBlogPosts.length + 1,
        title: post.title,
        content: post.content,
        thumbnail: post.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
        category: post.category || 'General',
        tags: post.tags || ['Creative'],
        author: 'Kelvin Junior',
        createdAt: new Date().toISOString(),
      };
      fallbackBlogPosts.push(newPost);
      res.json(newPost);
    } else {
      const inserted = await db.insert(blogPosts).values({
        title: post.title,
        content: post.content,
        thumbnail: post.thumbnail || '',
        category: post.category || 'General',
        tags: JSON.stringify(post.tags || []),
        author: 'Kelvin Junior',
      }).returning();
      res.json(inserted[0]);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Community Feed API
app.get('/api/community', async (req, res) => {
  try {
    if (useFallback) {
      res.json(fallbackCommunityPosts);
    } else {
      const list = await db.select().from(communityPosts).orderBy(desc(communityPosts.createdAt));
      const parsed = list.map(p => ({
        ...p,
        likes: JSON.parse(p.likes),
        comments: JSON.parse(p.comments),
        tags: JSON.parse(p.tags),
        badges: JSON.parse(p.badges),
      }));
      res.json(parsed);
    }
  } catch (error: any) {
    res.json(fallbackCommunityPosts);
  }
});

app.post('/api/community', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await getOrRegisterUser(req);
    const { title, content, tags } = req.body;

    if (useFallback) {
      const newPost = {
        id: fallbackCommunityPosts.length + 1,
        userId: user.id,
        userName: user.displayName || user.email,
        userPhoto: user.profilePhoto,
        title,
        content,
        likes: [],
        comments: [],
        tags: tags || ['Discussion'],
        badges: user.isAdmin ? ['Mentor', 'Admin'] : ['Student'],
        createdAt: new Date().toISOString(),
      };
      fallbackCommunityPosts.unshift(newPost);

      // Award XP
      user.xp += 15;

      res.json(newPost);
    } else {
      const inserted = await db.insert(communityPosts).values({
        userId: user.id,
        userName: user.displayName || user.email,
        userPhoto: user.profilePhoto,
        title,
        content,
        likes: JSON.stringify([]),
        comments: JSON.stringify([]),
        tags: JSON.stringify(tags || ['Discussion']),
        badges: JSON.stringify(user.isAdmin ? ['Mentor', 'Admin'] : ['Student']),
      }).returning();

      await db.update(users).set({ xp: user.xp + 15 }).where(eq(users.id, user.id));

      res.json(inserted[0]);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/community/:id/like', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await getOrRegisterUser(req);
    const postId = parseInt(req.params.id);

    if (useFallback) {
      const index = fallbackCommunityPosts.findIndex(p => p.id === postId);
      if (index === -1) return res.status(404).json({ error: 'Post not found' });
      const post = fallbackCommunityPosts[index];
      if (post.likes.includes(user.uid)) {
        post.likes = post.likes.filter((uid: string) => uid !== user.uid);
      } else {
        post.likes.push(user.uid);
      }
      res.json(post);
    } else {
      const result = await db.select().from(communityPosts).where(eq(communityPosts.id, postId)).limit(1);
      if (result.length === 0) return res.status(404).json({ error: 'Post not found' });
      const p = result[0];
      const likesList = JSON.parse(p.likes) as string[];

      if (likesList.includes(user.uid)) {
        const filtered = likesList.filter(uid => uid !== user.uid);
        const updated = await db.update(communityPosts)
          .set({ likes: JSON.stringify(filtered) })
          .where(eq(communityPosts.id, postId))
          .returning();
        res.json(updated[0]);
      } else {
        likesList.push(user.uid);
        const updated = await db.update(communityPosts)
          .set({ likes: JSON.stringify(likesList) })
          .where(eq(communityPosts.id, postId))
          .returning();
        res.json(updated[0]);
      }
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/community/:id/comment', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await getOrRegisterUser(req);
    const postId = parseInt(req.params.id);
    const { comment } = req.body;

    if (useFallback) {
      const index = fallbackCommunityPosts.findIndex(p => p.id === postId);
      if (index === -1) return res.status(404).json({ error: 'Post not found' });
      const post = fallbackCommunityPosts[index];
      post.comments.push({
        id: `c-${Date.now()}`,
        userName: user.displayName || user.email,
        comment,
        date: new Date().toISOString(),
      });
      res.json(post);
    } else {
      const result = await db.select().from(communityPosts).where(eq(communityPosts.id, postId)).limit(1);
      if (result.length === 0) return res.status(404).json({ error: 'Post not found' });
      const p = result[0];
      const commentsList = JSON.parse(p.comments);
      commentsList.push({
        id: `c-${Date.now()}`,
        userName: user.displayName || user.email,
        comment,
        date: new Date().toISOString(),
      });

      const updated = await db.update(communityPosts)
        .set({ comments: JSON.stringify(commentsList) })
        .where(eq(communityPosts.id, postId))
        .returning();
      res.json(updated[0]);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 9. Services Hiring requests
app.get('/api/services/requests', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await getOrRegisterUser(req);
    if (useFallback) {
      if (user.isAdmin) {
        res.json(fallbackServiceRequests);
      } else {
        res.json(fallbackServiceRequests.filter(s => s.userId === user.id));
      }
    } else {
      if (user.isAdmin) {
        const list = await db.select().from(serviceRequests).orderBy(desc(serviceRequests.createdAt));
        res.json(list);
      } else {
        const list = await db.select().from(serviceRequests)
          .where(eq(serviceRequests.userId, user.id))
          .orderBy(desc(serviceRequests.createdAt));
        res.json(list);
      }
    }
  } catch (error: any) {
    res.json([]);
  }
});

app.post('/api/services/request', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await getOrRegisterUser(req);
    const { serviceName, details, contactPhone } = req.body;

    if (useFallback) {
      const newRequest = {
        id: fallbackServiceRequests.length + 1,
        userId: user.id,
        userName: user.displayName || user.email,
        serviceName,
        details,
        contactPhone,
        status: 'Pending',
        createdAt: new Date().toISOString(),
      };
      fallbackServiceRequests.push(newRequest);
      res.json(newRequest);
    } else {
      const inserted = await db.insert(serviceRequests).values({
        userId: user.id,
        userName: user.displayName || user.email,
        serviceName,
        details,
        contactPhone,
        status: 'Pending',
      }).returning();
      res.json(inserted[0]);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/services/requests/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await getOrRegisterUser(req);
    if (!user.isAdmin) return res.status(403).json({ error: 'Admin access only' });

    const requestId = parseInt(req.params.id);
    const { status } = req.body;

    if (useFallback) {
      const index = fallbackServiceRequests.findIndex(r => r.id === requestId);
      if (index === -1) return res.status(404).json({ error: 'Request not found' });
      fallbackServiceRequests[index].status = status;
      res.json(fallbackServiceRequests[index]);
    } else {
      const updated = await db.update(serviceRequests)
        .set({ status })
        .where(eq(serviceRequests.id, requestId))
        .returning();
      res.json(updated[0]);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Analytics and Management
app.get('/api/admin/students', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await getOrRegisterUser(req);
    if (!user.isAdmin) return res.status(403).json({ error: 'Admin access only' });

    if (useFallback) {
      res.json(fallbackUsers);
    } else {
      const studentList = await db.select().from(users).orderBy(desc(users.xp));
      res.json(studentList);
    }
  } catch (error: any) {
    res.json(fallbackUsers);
  }
});

// 10. AI Chatbot Companion
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        reply: "Hi there! I'm Kelvin's AI Assistant. To get started with real-time smart learning guidance, please ask Kelvin to supply the `GEMINI_API_KEY` in the AI Studio secrets menu. In the meantime, I can tell you that Kelvin Digital Creator Hub offers world-class courses in CapCut video editing, AI website building, content creation, productivity automation, and digital marketing!",
      });
    }

    const ai = getAiClient();
    const systemInstruction = `You are a professional, helpful, and friendly AI Learning Guide for Kelvin Digital Creator Hub.
Kelvin Junior is an expert AI Creator, Video Editor, and Digital Skills Mentor who teaches:
1. CapCut Masterclass (video editing, velocity ramps, color grading)
2. AI Website Building (no-code, lightning-fast design, ChatGPT styling)
3. AI Content Creation (writing video scripts, hooks, social media calendars)
4. AI Productivity Tools (Zapier automation, email management, companion workflows)
5. Online Marketing (organic sales, high-yield WhatsApp funnels, FB/IG ads)

Your goal is to answer student questions cheerfully, recommend exact lessons from Kelvin's courses, and help them with their creative career or online earning ideas. Keep answers concise, practical, highly encouraging, and strictly professional. Avoid technical jargon unless asked. Do not lie or make up resources outside what is described. Keep the focus entirely on helping them succeed inside Kelvin Junior's Digital Creator Hub.`;

    // Construct contents compatible with @google/genai chats
    const formattedContents = [];
    if (history && Array.isArray(history)) {
      for (const h of history) {
        formattedContents.push({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.content }],
        });
      }
    }
    // Append current query
    formattedContents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const aiResponse = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ reply: aiResponse.text || "I'm sorry, I couldn't formulate a response right now. Let's try again!" });
  } catch (error: any) {
    console.error('Gemini API chat error:', error);
    res.json({
      reply: `Hello! I am Kelvin's AI guide. I'm currently running in baseline helper mode. Kelvin Junior is our expert mentor, and you can browse our beautiful catalog of courses (including the CapCut Masterclass and AI Website Builder) or join our upcoming Live Classroom right from the navigation bar above!`,
    });
  }
});

// ==========================================
// STATIC BUILD SERVING & VITE DEV SERVER
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kelvin Creator Hub server running on port ${PORT}`);
  });
}

startServer();
