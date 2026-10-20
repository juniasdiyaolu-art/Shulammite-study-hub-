import { db } from './index.ts';
import { courses, storeItems, blogPosts, liveClasses, communityPosts, siteSettings } from './schema.ts';

export async function seedDatabase() {
  try {
    // Check if site settings already exist (our baseline indicator)
    const existingSettings = await db.select().from(siteSettings).limit(1);
    if (existingSettings.length > 0) {
      console.log('Database already contains seeded content.');
      return;
    }

    console.log('Seeding Kelvin Digital Creator Hub database...');

    // 1. Seed Site Settings
    const defaultSettings = {
      brandName: 'Kelvin Digital Creator Hub',
      tagline: 'Learn. Create. Earn.',
      heroTitle: 'Become the Digital Creator Everyone Wants to Hire.',
      heroSubtitle: 'Master CapCut editing, AI tools, AI website building, content creation, online marketing, and other high-income digital skills—all in one place.',
      kelvinBio: "I'm Kelvin Junior, a digital creator passionate about helping people learn practical skills that create real opportunities. I specialize in CapCut video editing, AI-powered website building, content creation, AI productivity, online marketing, and creative digital solutions. My mission is to make learning simple, practical, and results-driven so students can confidently build careers, businesses, and income online.",
      kelvinPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80', // Premium profile image
      phoneNumber: '08128844540',
      email: 'kelvin@digitalcreatorhub.com',
      whatsapp: 'https://wa.me/2348128844540',
      instagram: 'https://instagram.com/kelvin_junior',
      youtube: 'https://youtube.com/kelvin_creator',
      tiktok: 'https://tiktok.com/@kelvin_editor',
      paymentDetails: 'Kelvin Digital Creator Hub LTD - Bank: GTBank - Account: 0123456789',
      businessHours: 'Mon - Sat: 9:00 AM - 6:00 PM (GMT+1)',
      address: 'Lagos, Nigeria & Online Globally',
    };

    await db.insert(siteSettings).values(defaultSettings);

    // 2. Seed Initial Courses
    const initialCourses = [
      {
        title: 'CapCut Masterclass',
        description: 'Go from complete beginner to a highly paid video editor. Master speed ramping, color grading, mask transitions, audio design, and advanced visual effects inside CapCut Mobile & Desktop.',
        thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80',
        difficulty: 'Beginner',
        duration: '6h 45m',
        instructor: 'Kelvin Junior',
        lessons: JSON.stringify([
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
        ]),
        downloadableResources: JSON.stringify([
          { name: 'Practice Video Raw Files', url: 'https://example.com/resources/capcut-raw.zip' },
          { name: 'Cinematic Sound Effects Pack', url: 'https://example.com/resources/sfx-pack.zip' }
        ]),
        rating: 4.9,
        reviews: JSON.stringify([
          { studentName: 'Adewale Okafor', rating: 5, comment: 'This course alone got me my first freelance edit client on Upwork! Thank you Kelvin!', date: '2026-06-10' },
          { studentName: 'Chioma Bello', rating: 4.8, comment: 'Very easy to follow. The speed ramping lesson is pure gold.', date: '2026-07-02' }
        ])
      },
      {
        title: 'AI Website Building',
        description: 'Build premium, gorgeous, and blazing-fast websites for businesses using modern AI website builders, no-code solutions, and ChatGPT/Gemini code templates. Sell websites for $500+.',
        thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
        difficulty: 'Beginner',
        duration: '5h 15m',
        instructor: 'Kelvin Junior',
        lessons: JSON.stringify([
          {
            id: 'aiweb-l1',
            title: 'The AI Web Design Blueprint',
            duration: '18:30',
            videoUrl: 'https://www.w3schools.com/html/movie.mp4',
            notes: 'Introduction to AI-powered web design. How to use ChatGPT and Gemini to generate layout structures, copy, and clean typography scales.',
          }
        ]),
        downloadableResources: JSON.stringify([
          { name: 'AI Client Proposal Templates', url: 'https://example.com/resources/web-proposal.pdf' },
          { name: 'Sleek UI Layout Prompt PDF', url: 'https://example.com/resources/layout-prompts.pdf' }
        ]),
        rating: 4.8,
        reviews: JSON.stringify([
          { studentName: 'Musa Ibrahim', rating: 5, comment: 'Insanely practical. Built my first business site in 1 hour.', date: '2026-06-18' }
        ])
      },
      {
        title: 'AI Content Creation',
        description: 'Generate high-quality video hooks, scripts, images, voiceovers, and daily social media calendar systems entirely with AI tools like ChatGPT, Gemini, Midjourney, and ElevenLabs.',
        thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
        difficulty: 'Beginner',
        duration: '4h 30m',
        instructor: 'Kelvin Junior',
        lessons: JSON.stringify([
          {
            id: 'aicont-l1',
            title: 'Generating Viral Hooks with LLMs',
            duration: '20:15',
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            notes: 'How to structure prompts to extract high-attention 3-second hooks based on human psychology and current social algorithms.',
          }
        ]),
        downloadableResources: JSON.stringify([
          { name: 'Ultimate Viral Hook Templates List', url: 'https://example.com/resources/hooks-list.pdf' }
        ]),
        rating: 4.9,
        reviews: JSON.stringify([
          { studentName: 'Sarah Lawson', rating: 5, comment: 'My TikTok views doubled since using Kelvin\'s hook prompts!', date: '2026-07-08' }
        ])
      },
      {
        title: 'AI Productivity Tools',
        description: 'Supercharge your daily work, studies, and creator output. Learn to delegate administrative tasks, automate emails, summarize data, and code minor utilities with AI companion tools.',
        thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
        difficulty: 'Beginner',
        duration: '3h 50m',
        instructor: 'Kelvin Junior',
        lessons: JSON.stringify([
          {
            id: 'aiprod-l1',
            title: 'Automating Gmail & Calendars',
            duration: '25:00',
            videoUrl: 'https://www.w3schools.com/html/movie.mp4',
            notes: 'Create automated workflows that trigger emails and calendar slots based on form entries or specific keyword receipts.',
          }
        ]),
        downloadableResources: JSON.stringify([
          { name: 'Zapier Automation Recipes', url: 'https://example.com/resources/ zapier-flows.pdf' }
        ]),
        rating: 4.7,
        reviews: JSON.stringify([])
      },
      {
        title: 'Online Marketing',
        description: 'Learn how to package, launch, and advertise digital skills. Master organic content marketing, highly profitable Facebook/Instagram ads, WhatsApp funnel sales, and client closing.',
        thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
        difficulty: 'Intermediate',
        duration: '8h 20m',
        instructor: 'Kelvin Junior',
        lessons: JSON.stringify([
          {
            id: 'mkt-l1',
            title: 'Building a High-Conversion WhatsApp Funnel',
            duration: '35:10',
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            notes: 'Step-by-step architecture on how to drive cold traffic from Reels to your WhatsApp and close sales with elegant automated broadcasts.',
          }
        ]),
        downloadableResources: JSON.stringify([
          { name: 'WhatsApp Sales Script Handbook', url: 'https://example.com/resources/sales-scripts.pdf' }
        ]),
        rating: 4.9,
        reviews: JSON.stringify([])
      }
    ];

    for (const c of initialCourses) {
      await db.insert(courses).values(c);
    }

    // 3. Seed Store Items (Digital Products)
    const seedStoreItems = [
      {
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

    for (const item of seedStoreItems) {
      await db.insert(storeItems).values(item);
    }

    // 4. Seed Live Classes
    const seedClasses = [
      {
        title: 'CapCut Video Editing Intensive Live',
        description: 'Join Kelvin Junior live as he breaks down real speed-ramping projects, edits a viral short reel on the fly, answers your editing questions, and critiques student-submitted videos.',
        scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
        youtubeUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder
        resources: JSON.stringify([{ name: 'Live Stream Asset Files', url: 'https://example.com/live-assets.zip' }]),
        registeredUsers: JSON.stringify([]),
        attendance: JSON.stringify([]),
        polls: JSON.stringify([
          { id: 'poll-1', question: 'Which CapCut platform do you use most?', options: ['CapCut Mobile', 'CapCut Desktop', 'Both Equally'], votes: { 'CapCut Mobile': 0, 'CapCut Desktop': 0, 'Both Equally': 0 }, active: true }
        ]),
        qa: JSON.stringify([]),
        chatMessages: JSON.stringify([]),
        teacherAnnouncements: JSON.stringify([
          { id: 'ann-1', text: 'Hi guys! Please download the raw practice files before the stream starts!', date: new Date().toISOString() }
        ]),
        isCompleted: false
      }
    ];

    for (const lc of seedClasses) {
      await db.insert(liveClasses).values(lc);
    }

    // 5. Seed Blog Posts
    const seedBlogs = [
      {
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
        tags: JSON.stringify(['CapCut', 'Video Editing', 'Tutorial']),
        author: 'Kelvin Junior',
      },
      {
        title: 'Top 5 AI Website Builders in 2026 (No-Code)',
        content: `In 2026, web design is faster and smarter than ever before. No-code web development is a high-demand skill, and knowing how to utilize AI design software is a massive competitive advantage.

Here are the top 5 AI website builders we recommend to build and sell premium sites:

1. **Framer AI**: Generates gorgeous, highly interactive layouts from simple text prompts. Excellent for creative portolios.
2. **Durable**: Perfect for local service businesses. Generates a fully structured site with copy, images, contact forms, and maps in under 30 seconds.
3. **Wix Studio AI**: Integrates deep machine-learning responsiveness, making layout adaptation across devices seamless.
4. **Relume AI**: Outstanding for wireframing and generating comprehensive sitemaps with styled component hierarchies.
5. **V0 by Vercel**: Ideal for creators looking to generate custom styled React UI elements with Tailwind code outputs.`,
        thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
        category: 'Website Building',
        tags: JSON.stringify(['AI Tools', 'No-Code', 'Web Design']),
        author: 'Kelvin Junior',
      }
    ];

    for (const blog of seedBlogs) {
      await db.insert(blogPosts).values(blog);
    }

    // 6. Seed Community Posts
    const seedCommunity = [
      {
        userId: 1, // Will map to Kelvin / Admin
        userName: 'Kelvin Junior',
        userPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
        title: 'Welcome to the Kelvin Digital Creator Hub! 👋',
        content: "Hey awesome creators! I am incredibly excited to welcome you all to our official platform. This space was designed for you to connect, share your projects, ask questions, and collaborate with other ambitious minds. Drop a comment below introducing yourself, what skill you are focused on learning first, and let's win together!",
        likes: JSON.stringify([]),
        comments: JSON.stringify([
          { id: 'c-1', userName: 'Adebayo Tobi', comment: 'So glad to be here! Ready to master CapCut speed ramps!', date: new Date().toISOString() }
        ]),
        tags: JSON.stringify(['General', 'Welcome']),
        badges: JSON.stringify(['Mentor', 'Admin']),
      }
    ];

    for (const post of seedCommunity) {
      // Note: we link it to a user. If users exist, we can refer to user_id.
      // We will handle safety in server.ts if user is missing.
      await db.insert(communityPosts).values({
        ...post,
        userId: 1 // Default fallback user
      });
    }

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}
