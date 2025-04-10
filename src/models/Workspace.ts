import mongoose from 'mongoose';

/**
 * Workspace Schema
 * 
 * Represents a subdivision of an organization (e.g., department, team, project).
 * Each workspace belongs to one organization and can have multiple members.
 * Content (reports, comments) is scoped to a specific workspace.
 */
const WorkspaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  organizationId: {
    type: String,
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['team', 'department', 'project'],
    default: 'team',
  },
  memberIds: {
    type: [String],
    default: [],
    index: true,
  },
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

// Create indexes for efficient queries
WorkspaceSchema.index({ name: 1, organizationId: 1 }, { unique: true });
WorkspaceSchema.index({ organizationId: 1 });
WorkspaceSchema.index({ memberIds: 1 });

// Export as mongoose model
export const Workspace = mongoose.models.Workspace || 
  mongoose.model('Workspace', WorkspaceSchema);

// TypeScript interface for type safety
export interface WorkspaceDocument extends mongoose.Document {
  name: string;
  organizationId: string;
  type: 'team' | 'department' | 'project';
  memberIds: string[];
  createdAt: Date;
  updatedAt: Date;
}
