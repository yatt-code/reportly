import mongoose from 'mongoose';

const GroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true, // Assuming group names should be unique
  },
  description: {
    type: String,
    trim: true,
  },
  // Array of User ObjectIds who are members of this group
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  // Optional: Reference to an admin or owner of the group
  // ownerId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User',
  //   required: true
  // },
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

// Indexing for faster lookups by name
GroupSchema.index({ name: 1 });

// Ensure the model is not recompiled if it already exists
export default mongoose.models.Group || mongoose.model('Group', GroupSchema);