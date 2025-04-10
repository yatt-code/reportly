import mongoose from 'mongoose';

/**
 * Report Schema
 * 
 * Updated to support the multi-tenant architecture with organizations and workspaces.
 */
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
    type: String, // Supabase user ID
    required: true,
    index: true, // Index for faster user-specific report lookups
  },
  // Multi-tenant fields
  workspaceId: {
    type: String,
    required: true,
    index: true, // Index for faster workspace-specific report lookups
  },
  organizationId: {
    type: String,
    required: true,
    index: true, // Index for faster organization-specific report lookups
  },
  // Legacy field - will be migrated to workspaces
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    index: true, // Index for faster group-specific report lookups
  },
  // Status of the report
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  },
  // Tags for categorization
  tags: {
    type: [String],
    default: [],
  },
  // Sentiment analysis tags
  sentimentTags: {
    type: [String],
    default: [],
  },
  // Audit timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true // Automatically manages createdAt and updatedAt
});

// Create compound indexes for efficient queries
ReportSchema.index({ userId: 1, workspaceId: 1 });
ReportSchema.index({ organizationId: 1, workspaceId: 1 });
ReportSchema.index({ workspaceId: 1, status: 1 });

// Export as mongoose model
const Report = mongoose.models.Report || mongoose.model('Report', ReportSchema);

// TypeScript interface for type safety
export interface ReportDocument extends mongoose.Document {
  title: string;
  content: string;
  userId: string;
  workspaceId: string;
  organizationId: string;
  groupId?: mongoose.Types.ObjectId;
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  sentimentTags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export default Report;
