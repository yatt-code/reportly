import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Interface defining the structure of a Comment document
 * Updated to support the multi-tenant architecture with organizations and workspaces.
 */
export interface IComment extends Document {
  reportId: string;
  userId: string;
  content: string;
  parentId: string | null;
  mentions: string[];
  workspaceId: string;
  organizationId: string;
  // createdAt and updatedAt are handled by timestamps option
}

/**
 * Mongoose Schema for Comments
 * Updated to support the multi-tenant architecture with organizations and workspaces.
 */
const CommentSchema: Schema<IComment> = new Schema<IComment>({
  reportId: {
    type: String, // MongoDB ObjectId string
    required: true,
    index: true, // Index for efficient querying by report
  },
  userId: {
    type: String, // Supabase User ID
    required: true,
    index: true, // Index for efficient querying by user
  },
  content: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
  },
  parentId: {
    type: String, // MongoDB ObjectId string
    default: null, // null indicates a top-level comment
    index: true, // Index for efficient fetching of replies
  },
  mentions: {
    type: [String], // Array of mentioned User IDs
    default: [],
  },
  // Multi-tenant fields
  workspaceId: {
    type: String,
    required: true,
    index: true, // Index for efficient querying by workspace
  },
  organizationId: {
    type: String,
    required: true,
    index: true, // Index for efficient querying by organization
  },
  // createdAt and updatedAt are added automatically by timestamps: true
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt fields
});

// Create compound indexes for efficient queries
CommentSchema.index({ reportId: 1, workspaceId: 1 });
CommentSchema.index({ userId: 1, workspaceId: 1 });
CommentSchema.index({ organizationId: 1, workspaceId: 1 });

// Ensure the model is not recompiled if it already exists
// Use Model<IComment> for typing the Mongoose model
const CommentModel: Model<IComment> = mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);

export default CommentModel;