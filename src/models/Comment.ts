import mongoose, { Schema, Document, Model } from 'mongoose';

// Interface defining the structure of a Comment document
export interface IComment extends Document {
  reportId: string;
  userId: string;
  content: string;
  parentId: string | null;
  mentions: string[];
  // createdAt and updatedAt are handled by timestamps option
}

// Mongoose Schema for Comments
const CommentSchema: Schema<IComment> = new Schema<IComment>({
  reportId: {
    type: String, // Assuming Report ID is a string (e.g., MongoDB ObjectId string)
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
    type: String, // Assuming Comment ID is a string (e.g., MongoDB ObjectId string)
    default: null, // null indicates a top-level comment
    index: true, // Index for efficient fetching of replies
  },
  mentions: {
    type: [String], // Array of mentioned User IDs
    default: [],
  },
  // createdAt and updatedAt are added automatically by timestamps: true
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt fields
});

// Ensure the model is not recompiled if it already exists
// Use Model<IComment> for typing the Mongoose model
const CommentModel: Model<IComment> = mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);

export default CommentModel;