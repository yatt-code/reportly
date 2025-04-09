import { z } from 'zod';

// Basic ObjectId validation (adjust regex if needed for specific format)
const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId');

// Schema for creating a comment
export const PostCommentSchema = z.object({
  reportId: objectIdSchema, // ID of the report being commented on
  content: z.string().min(1, 'Comment cannot be empty').trim(),
  parentId: objectIdSchema.nullable().optional(), // Optional ID of the parent comment for replies
  mentions: z.array(z.string()).optional(), // Optional array of mentioned user IDs (validate format if needed)
});

// Schema for identifying a comment (e.g., for deletion)
export const CommentIdSchema = z.object({
  commentId: objectIdSchema,
});

// Schema for fetching comments by report
export const ReportIdSchema = z.object({
    reportId: objectIdSchema,
});


// Type definitions inferred from schemas
export type PostCommentInput = z.infer<typeof PostCommentSchema>;

// Type for comment data used in frontend components
// Includes potential user details fetched separately
export interface CommentData {
    _id: string; // Use _id from MongoDB
    reportId: string;
    userId: string;
    content: string;
    parentId: string | null;
    mentions: string[];
    createdAt: string; // Use string for simplicity, can parse later
    updatedAt: string;
    // Optional: Add user details if populated
    user?: {
        name?: string;
        avatarUrl?: string; // Example
    };
    // Optional: Add reply count if needed
    // replyCount?: number;
}