export interface User {
  id: number;
  uid: string;
  email: string;
  displayName: string | null;
  profilePhoto: string | null;
  xp: number;
  streak: number;
  lastStudyAt: string | null;
  isAdmin: boolean;
  createdAt: string;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  notes: string;
  quiz?: {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  };
}

export interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  lessonsCount: number;
  instructor: string;
  lessons: Lesson[];
  downloadableResources: { name: string; url: string }[];
  rating: number;
  reviews: { studentName: string; rating: number; comment: string; date: string }[];
}

export interface Enrollment {
  id: number;
  userId: number;
  courseId: number;
  progress: number; // 0 - 100
  completed: boolean;
  certificateId: string | null;
  savedNotes: Record<string, string>; // lessonId -> noteText
  bookmarkedLessons: string[]; // array of lessonIds
  createdAt: string;
}

export interface Poll {
  id: string;
  question: string;
  options: string[];
  votes: Record<string, number>; // option -> voteCount
  active: boolean;
}

export interface QaItem {
  id: string;
  question: string;
  askedBy: string;
  votes: number;
  answered: boolean;
}

export interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
}

export interface LiveClass {
  id: number;
  title: string;
  description: string;
  scheduledAt: string;
  youtubeUrl: string;
  resources: { name: string; url: string }[];
  registeredUsers: string[]; // uids
  attendance: string[]; // uids
  polls: Poll[];
  qa: QaItem[];
  chatMessages: ChatMessage[];
  teacherAnnouncements: { id: string; text: string; date: string }[];
  isCompleted: boolean;
}

export interface DigitalProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  type: 'Template' | 'Preset' | 'Prompt Pack' | 'E-book' | 'Resource';
  downloadUrl: string;
  thumbnail: string;
  rating: number;
  reviewsCount: number;
}

export interface BlogPost {
  id: number;
  title: string;
  content: string;
  thumbnail: string;
  category: string;
  tags: string[];
  author: string;
  createdAt: string;
}

export interface CommunityPost {
  id: number;
  userId: number;
  userName: string;
  userPhoto: string | null;
  title: string;
  content: string;
  likes: string[]; // uids
  comments: { id: string; userName: string; comment: string; date: string }[];
  tags: string[];
  badges: string[];
  createdAt: string;
}

export interface SiteSettings {
  brandName: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  kelvinBio: string;
  kelvinPhoto: string;
  phoneNumber: string;
  email: string;
  socialLinks: {
    whatsapp: string;
    instagram: string;
    youtube: string;
    tiktok: string;
  };
  paymentDetails: string;
  businessHours: string;
  address: string;
}

export interface Service {
  name: string;
  description: string;
  iconName: string;
}

export interface ServiceRequest {
  id: number;
  userId: number;
  userName: string;
  serviceName: string;
  details: string;
  contactPhone: string;
  status: 'Pending' | 'Approved' | 'Completed';
  createdAt: string;
}

export interface Certificate {
  id: string;
  userId: number;
  studentName: string;
  courseId: number;
  courseTitle: string;
  issuedAt: string;
}
