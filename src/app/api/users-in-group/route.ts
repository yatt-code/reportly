import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr'; // Use server client for auth
import logger from '@/lib/utils/logger';
import { getUsersInGroup } from '@/lib/users/getUsersInGroup';

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
        // Use the extracted function to get users in the same group
        const users = await getUsersInGroup(currentUser.id);

        logger.log(`[${functionName}] Found ${users.length} users in the same group as user ${currentUser.id}.`);
        return NextResponse.json({ users });

    } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error(`[${functionName}] Error fetching users in group.`, error);
        return NextResponse.json({ error: 'Failed to fetch users due to a server error.' }, { status: 500 });
    }
}

// Note: Add query parameter handling (e.g., for search/filtering) if needed later.
// Example: const { searchParams } = new URL(request.url);
// const query = searchParams.get('q');