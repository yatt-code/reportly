import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  // Supabase Auth User ID will be the primary identifier,
  // but we might store it here for easier linking if needed.
  // Alternatively, rely solely on Supabase for user identity.
  // For now, let's assume we store some profile data here linked by email or a Supabase ID.
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
  // Removed achievements array field - using separate Achievement collection now
  // achievements: {
  //   type: [String],
  //   default: [],
  // },
  // Link to the Group model
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    // required: true // A user must belong to a group? Or can be unassigned initially?
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

// Ensure the model is not recompiled if it already exists
export default mongoose.models.User || mongoose.model('User', UserSchema);