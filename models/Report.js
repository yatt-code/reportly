import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String, // Storing Markdown content
    required: true,
  },
  // Reference to the User who created the report
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true, // Index for faster user-specific report lookups
  },
  // Reference to the Group this report belongs to
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
    index: true, // Index for faster group-specific report lookups
  },

  // --- Passive AI Generated Metadata ---
  // Prefixed with 'ai_' as per architectural guidelines
  ai_summary: {
    type: String,
    trim: true,
  },
  ai_tags: {
    type: [String], // e.g., ['bug', 'feature', 'update']
    default: [],
  },
  ai_clusterId: { // Used for grouping similar reports (e.g., by vector similarity)
    type: mongoose.Schema.Types.ObjectId,
    // ref: 'ReportCluster' // If you create a separate model for clusters
    index: true,
  },

  // Optional: Store metadata about the AI processing for this report
  aiMeta: {
    modelUsed: String, // e.g., "gpt-4-turbo"
    promptTokens: Number,
    completionTokens: Number,
    totalTokens: Number,
    cost: Number, // Optional: track cost if needed
    processedAt: Date, // When the AI processing occurred
  },

  // Audit timestamps managed by Mongoose
}, {
  timestamps: true // Automatically manages createdAt and updatedAt
});

// Compound index for common dashboard queries (e.g., latest reports for a group)
ReportSchema.index({ groupId: 1, createdAt: -1 });
ReportSchema.index({ userId: 1, createdAt: -1 });

// Ensure the model is not recompiled if it already exists
export default mongoose.models.Report || mongoose.model('Report', ReportSchema);