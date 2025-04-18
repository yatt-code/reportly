import { z } from 'zod';

// Basic ObjectId validation (adjust regex if needed for specific format)
const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId');

// Schema for creating a report (used within saveReport)
// Note: userId and groupId are crucial and should ideally come from authenticated session, not client input.
// For now, we include them but mark them as potentially needing server-side assignment.
export const CreateReportSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters long').trim(),
    content: z.string().min(1, 'Content cannot be empty'), // Basic check, could add more rules
    userId: objectIdSchema, // Should be validated/set server-side based on auth
    groupId: objectIdSchema, // Should be validated/set server-side based on auth or user profile
});

// Schema for updating a report (used within saveReport and updateReport)
export const UpdateReportSchema = z.object({
    reportId: objectIdSchema,
    title: z.string().min(3, 'Title must be at least 3 characters long').trim().optional(), // Allow partial updates
    content: z.string().min(1, 'Content cannot be empty').optional(), // Allow partial updates
    // userId and groupId typically shouldn't be updatable directly here
});

// Schema specifically for the generic updateReport action (allows more fields potentially)
// Be cautious about which fields are allowed to be updated generically.
export const GenericUpdateReportSchema = z.object({
    // Define allowed updatable fields explicitly
    title: z.string().min(3).trim().optional(),
    content: z.string().min(1).optional(),
    // Add other fields ONLY if they should be updatable via this generic action
    // e.g., status: z.enum(['Draft', 'Complete']).optional(),
}).strict(); // Use strict to prevent extra fields unless explicitly allowed

// Schema for identifying a report (e.g., for delete, duplicate, getById)
export const ReportIdSchema = z.object({
    reportId: objectIdSchema,
});

// Schema for user identification (for getReportsByUser)
export const UserIdSchema = z.object({
    userId: objectIdSchema, // Should come from authenticated session
});

// Type definitions inferred from schemas
export type CreateReportInput = z.infer<typeof CreateReportSchema>;
export type UpdateReportInput = z.infer<typeof UpdateReportSchema>;
export type GenericUpdateReportInput = z.infer<typeof GenericUpdateReportSchema>;

// Interface representing the structure of a Report document from MongoDB
// Adjust based on your actual Mongoose model definition in models/Report.js
export interface ReportDocument {
    _id: string; // Or ObjectId if not using .lean() or transforming
    title: string;
    content: string;
    userId: string; // Or ObjectId
    groupId: string; // Or ObjectId
    createdAt: Date;
    updatedAt: Date;
    ai_summary?: string;
    ai_tags?: string[];
    ai_clusterId?: string; // Or ObjectId
    aiMeta?: {
        modelUsed?: string;
        promptTokens?: number;
        completionTokens?: number;
        totalTokens?: number;
        cost?: number;
        processedAt?: Date;
        // Add fields from both summary and category if needed
        summary_modelUsed?: string;
        summary_promptTokens?: number;
        summary_completionTokens?: number;
        summary_totalTokens?: number;
        summary_cost?: number;
        category_modelUsed?: string;
        category_promptTokens?: number;
        category_completionTokens?: number;
        category_totalTokens?: number;
        category_cost?: number;
    };
    // Add any other fields from your Mongoose schema
}

// Type for data specifically needed by the ReportListItem component
export interface ReportListItemData {
    id: string; // Use a consistent 'id' field
    title: string;
    status: 'Draft' | 'Complete'; // Assuming status exists or can be derived
    createdAt: Date;
    sentimentTags: string[];
}

// Interface representing the structure of a User document from MongoDB
// Adjust based on your actual Mongoose model definition in models/User.js
export interface UserDocument {
    _id: string; // Or ObjectId
    supabaseUserId?: string;
    name: string;
    username: string;
    email: string;
    role: 'admin' | 'developer';
    achievements?: string[];
    groupId?: string; // Or ObjectId
    activeWorkspaceId?: string; // Or ObjectId
    workspaceIds?: string[]; // Or ObjectId[]
    organizationId?: string; // Or ObjectId - Add the missing field
    createdAt: Date;
    updatedAt: Date;
}

// Interface representing the structure of an Organization document from MongoDB
// Adjust based on your actual Mongoose model definition in models/Organization.ts
export interface OrganizationDocument {
    _id: string; // Or ObjectId
    name: string;
    ownerId: string; // Or ObjectId
    memberIds?: string[]; // Or ObjectId[]
    createdAt: Date;
    updatedAt: Date;
    // Add other fields like description, settings etc.
}

// Interface representing the structure of a Workspace document from MongoDB
// Adjust based on your actual Mongoose model definition in models/Workspace.ts
export interface WorkspaceDocument {
    _id: string; // Or ObjectId
    name: string;
    organizationId: string; // Matches Workspace.ts
    type: 'team' | 'department' | 'project'; // Matches Workspace.ts
    memberIds?: string[];
    createdAt: Date;
    updatedAt: Date;
    // Add other fields if they exist in Workspace.ts
}