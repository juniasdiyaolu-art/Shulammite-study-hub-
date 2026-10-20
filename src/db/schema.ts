import { pgTable, serial, text, integer, boolean, timestamp, doublePrecision } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users Table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  profilePhoto: text('profile_photo'),
  xp: integer('xp').default(0).notNull(),
  streak: integer('streak').default(0).notNull(),
  lastStudyAt: timestamp('last_study_at'),
  isAdmin: boolean('is_admin').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Courses Table
export const courses = pgTable('courses', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  thumbnail: text('thumbnail').notNull(),
  difficulty: text('difficulty').notNull(), // Beginner, Intermediate, Advanced
  duration: text('duration').notNull(),
  instructor: text('instructor').notNull(),
  lessons: text('lessons').notNull(), // JSON array of Lesson
  downloadableResources: text('downloadable_resources').notNull(), // JSON array of name, url
  rating: doublePrecision('rating').default(5.0).notNull(),
  reviews: text('reviews').notNull(), // JSON array of Review
});

// Enrollments & Study Progress
export const enrollments = pgTable('enrollments', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  courseId: integer('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  progress: integer('progress').default(0).notNull(), // 0 - 100
  completed: boolean('completed').default(false).notNull(),
  certificateId: text('certificate_id'),
  savedNotes: text('saved_notes').notNull(), // JSON string map of lessonId -> noteText
  bookmarkedLessons: text('bookmarked_lessons').notNull(), // JSON array of lessonId strings
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Live Classes Table
export const liveClasses = pgTable('live_classes', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  scheduledAt: text('scheduled_at').notNull(), // ISO string or Date-Time string
  youtubeUrl: text('youtube_url').notNull(),
  resources: text('resources').notNull(), // JSON array of resources
  registeredUsers: text('registered_users').notNull(), // JSON array of uids
  attendance: text('attendance').notNull(), // JSON array of uids
  polls: text('polls').notNull(), // JSON array of Polls
  qa: text('qa').notNull(), // JSON array of QAs
  chatMessages: text('chat_messages').notNull(), // JSON array of chat messages
  teacherAnnouncements: text('teacher_announcements').notNull(), // JSON array of teacher announcements
  isCompleted: boolean('is_completed').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Digital Store Items
export const storeItems = pgTable('store_items', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  price: doublePrecision('price').notNull(),
  type: text('type').notNull(), // Template, Preset, Prompt Pack, E-book, Resource
  downloadUrl: text('download_url').notNull(),
  thumbnail: text('thumbnail').notNull(),
  rating: doublePrecision('rating').default(5.0).notNull(),
  reviewsCount: integer('reviews_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Blog Posts
export const blogPosts = pgTable('blog_posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  thumbnail: text('thumbnail').notNull(),
  category: text('category').notNull(),
  tags: text('tags').notNull(), // JSON array of strings
  author: text('author').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Community Posts
export const communityPosts = pgTable('community_posts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  userName: text('user_name').notNull(),
  userPhoto: text('user_photo'),
  title: text('title').notNull(),
  content: text('content').notNull(),
  likes: text('likes').notNull(), // JSON array of uids who liked
  comments: text('comments').notNull(), // JSON array of Comment objects
  tags: text('tags').notNull(), // JSON array of strings
  badges: text('badges').notNull(), // JSON array of badges earned
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Service Requests (Hire Kelvin)
export const serviceRequests = pgTable('service_requests', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  userName: text('user_name').notNull(),
  serviceName: text('service_name').notNull(),
  details: text('details').notNull(),
  contactPhone: text('contact_phone').notNull(),
  status: text('status').default('Pending').notNull(), // Pending, Approved, Completed
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Dynamic Site Settings (Branding, profile photo, bio, contact, etc.)
export const siteSettings = pgTable('site_settings', {
  id: serial('id').primaryKey(),
  brandName: text('brand_name').notNull(),
  tagline: text('tagline').notNull(),
  heroTitle: text('hero_title').notNull(),
  heroSubtitle: text('hero_subtitle').notNull(),
  kelvinBio: text('kelvin_bio').notNull(),
  kelvinPhoto: text('kelvin_photo').notNull(),
  phoneNumber: text('phone_number').notNull(),
  email: text('email').notNull(),
  whatsapp: text('whatsapp').notNull(),
  instagram: text('instagram').notNull(),
  youtube: text('youtube').notNull(),
  tiktok: text('tiktok').notNull(),
  paymentDetails: text('payment_details').notNull(),
  businessHours: text('business_hours').notNull(),
  address: text('address').notNull(),
});

// Relations Definitions
export const usersRelations = relations(users, ({ many }) => ({
  enrollments: many(enrollments),
  communityPosts: many(communityPosts),
  serviceRequests: many(serviceRequests),
}));

export const coursesRelations = relations(courses, ({ many }) => ({
  enrollments: many(enrollments),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  user: one(users, {
    fields: [enrollments.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id],
  }),
}));

export const communityPostsRelations = relations(communityPosts, ({ one }) => ({
  user: one(users, {
    fields: [communityPosts.userId],
    references: [users.id],
  }),
}));

export const serviceRequestsRelations = relations(serviceRequests, ({ one }) => ({
  user: one(users, {
    fields: [serviceRequests.userId],
    references: [users.id],
  }),
}));
