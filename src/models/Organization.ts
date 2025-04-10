import mongoose from 'mongoose';

/**
 * Organization Schema
 * 
 * Represents a top-level entity (company or institution) in the multi-tenant architecture.
 * Each user belongs to one organization, and an organization can have multiple workspaces.
 */
const OrganizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  ownerId: {
    type: String,
    required: true,
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
OrganizationSchema.index({ name: 1 });
OrganizationSchema.index({ ownerId: 1 });

// Export as mongoose model
export const Organization = mongoose.models.Organization || 
  mongoose.model('Organization', OrganizationSchema);

// TypeScript interface for type safety
export interface OrganizationDocument extends mongoose.Document {
  name: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}
