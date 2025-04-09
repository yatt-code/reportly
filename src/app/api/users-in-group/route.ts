import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr'; // Use server client for auth
import connectDB from '@/lib/db/connectDB';
import UserModel from '@/models/User';
import logger from '@/lib/utils/logger';
import type { UserDocument } from '@/lib/schemas/reportSchemas'; // Import UserDocument type

// Define the structure of the user data returned by the API
interface MentionableUser {
    id: string; // Supabase user ID
    username: string; // The @username handle
    name: string; // Display name
    // Add avatarUrl if available/needed
}

export async function GET(request: Request) {
    const functionName = 'GET /api/users-in-group';
    logger.log(`[${functionName}] Received request.`);

    // --- Authentication ---
    const cookieStore = cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    if (!supabaseUrl || !supabaseAnonKey) {
        logger.error(`[${functionName}] Missing Supabase config.`);
        return NextResponse.json({ error: 'Internal server configuration error.' }, { status: 500 });
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, { cookies: { get: cookieStore.get } });
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !currentUser) {
        // Pass error only if it exists
        logger.warn(`[${functionName}] Authentication failed or no user found.`, authError || undefined);
        return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }
    logger.log(`[${functionName}] User authenticated: ${currentUser.id}`);
    // --- End Authentication ---

    try {
        await connectDB();

        // --- Find Current User's Group ---
        // We need the user's profile from our DB (which has groupId) using their Supabase ID
        // Assuming supabaseUserId is stored in your User model
        // Cast the result to UserDocument
        const userProfile = await UserModel.findOne({ supabaseUserId: currentUser.id }).lean() as UserDocument | null;

        if (!userProfile || !userProfile.groupId) {
            logger.warn(`[${functionName}] User profile or groupId not found for user: ${currentUser.id}`);
            // Return empty list if user isn't in a group or profile missing
            return NextResponse.json({ users: [] });
        }
        const userGroupId = userProfile.groupId;
        logger.log(`[${functionName}] User ${currentUser.id} belongs to group ${userGroupId}.`);
        // --- End Group Find ---

        // --- Fetch Users in the Same Group ---
        // Fetch users matching the groupId, selecting only necessary fields
        const groupUsers = await UserModel.find(
            { groupId: userGroupId },
            { supabaseUserId: 1, username: 1, name: 1, _id: 0 } // Select fields, exclude MongoDB _id
        ).lean();

        // Map to the desired output structure
        const mentionableUsers: MentionableUser[] = groupUsers.map(u => ({
            id: u.supabaseUserId || '', // Use supabaseUserId as the primary ID
            username: u.username,
            name: u.name,
        })).filter(u => u.id); // Filter out any potential users without a supabaseUserId

        logger.log(`[${functionName}] Found ${mentionableUsers.length} users in group ${userGroupId}.`);
        return NextResponse.json({ users: mentionableUsers });
        // --- End Fetch Users ---

    } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error(`[${functionName}] Error fetching users in group.`, error);
        return NextResponse.json({ error: 'Failed to fetch users due to a server error.' }, { status: 500 });
    }
}

// Note: Add query parameter handling (e.g., for search/filtering) if needed later.
// Example: const { searchParams } = new URL(request.url);
// const query = searchParams.get('q');