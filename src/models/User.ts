import mongoose from 'mongoose';

/**
 * User Schema
 * 
 * Updated to support the multi-tenant architecture with organizations and workspaces.
 */
const UserSchema = new mongoose.Schema({
  // Supabase Auth User ID
  supabaseUserId: {
    type: String,
    // required: true, // Depending on auth flow completion
    // unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  // Password hash is managed by Supabase Auth, not stored here.
  role: {
    type: String,
    enum: ['admin', 'developer'],
    default: 'developer',
  },
  // Organization and Workspace fields for multi-tenancy
  organizationId: {
    type: String,
    index: true,
  },
  workspaceIds: {
    type: [String],
    default: [],
    index: true,
  },
  // Default active workspace for the user
  activeWorkspaceId: {
    type: String,
  },
  // Legacy field - will be migrated to workspaces
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
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

// Indexing for faster lookups
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ supabaseUserId: 1 });
UserSchema.index({ organizationId: 1 });
UserSchema.index({ workspaceIds: 1 });

// Export as mongoose model
const User = mongoose.models.User || mongoose.model('User', UserSchema);

// TypeScript interface for type safety
export interface UserDocument extends mongoose.Document {
  supabaseUserId?: string;
  name: string;
  username: string;
  email: string;
  role: 'admin' | 'developer';
  organizationId?: string;
  workspaceIds: string[];
  activeWorkspaceId?: string;
  groupId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export default User;
