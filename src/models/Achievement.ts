import mongoose from 'mongoose';

const AchievementSchema = new mongoose.Schema({
  // Using string type for userId to match Supabase user ID pattern
  // (consistent with Report.js model implementation)
  userId: {
    type: String,
    required: true,
    index: true, // Individual index for user-specific queries
  },
  
  // Unique identifier for the achievement
  slug: {
    type: String,
    required: true,
    trim: true,
  },
  
  // Timestamp when the achievement was unlocked
  unlockedAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  
  // Audit fields (following project's schema-first pattern)
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true, // Automatically manages createdAt and updatedAt
});

// Compound unique index to prevent duplicate achievements
AchievementSchema.index({ userId: 1, slug: 1 }, { unique: true });

// Export as mongoose model (following project's pattern)
export const Achievement = mongoose.models.Achievement || mongoose.model('Achievement', AchievementSchema);

// TypeScript interface for type safety
export interface AchievementDocument extends mongoose.Document {
  userId: string;
  slug: string;
  unlockedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}