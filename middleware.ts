import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import logger from './src/lib/utils/logger'; // Use relative path from root

// Environment variables (re-declared for middleware context)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Define protected and public routes
const protectedRoutes = ['/dashboard', '/report']; // Add base paths of protected areas
const publicRoutes = ['/login', '/register']; // Routes accessible without auth

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    // Create a Supabase client configured to use cookies
    const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    // If the cookie is updated, update the cookies for the request and response
                    request.cookies.set({ name, value, ...options });
                    response = NextResponse.next({ // Recreate response to apply updated cookies
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({ name, value, ...options });
                },
                remove(name: string, options: CookieOptions) {
                    // If the cookie is removed, update the cookies for the request and response
                    request.cookies.set({ name, value: '', ...options });
                     response = NextResponse.next({ // Recreate response to apply updated cookies
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({ name, value: '', ...options });
                },
            },
        }
    );

    // Refresh session if expired - important to keep session active
    const { data: { session }, error } = await supabase.auth.getSession();
     if (error) {
        logger.error('[Middleware] Error refreshing session:', error);
        // Handle error? Maybe allow request but log?
    } else {
        // logger.log('[Middleware] Session refreshed/checked.');
    }


    const { pathname } = request.nextUrl;

    // Check if user is authenticated
    const isAuthenticated = !!session?.user;

    // --- Route Protection Logic ---

    // If user is authenticated and tries to access login/register, redirect to dashboard
    if (isAuthenticated && publicRoutes.some(route => pathname.startsWith(route))) {
        logger.log('[Middleware] Authenticated user accessing public route, redirecting to dashboard.');
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // If user is NOT authenticated and tries to access a protected route, redirect to login
    if (!isAuthenticated && protectedRoutes.some(route => pathname.startsWith(route))) {
         logger.log('[Middleware] Unauthenticated user accessing protected route, redirecting to login.');
         return NextResponse.redirect(new URL('/login', request.url));
    }

    // Allow the request to proceed if none of the above conditions are met
    return response;
}

// --- Configure Middleware Path Matching ---
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
        // Explicitly include paths if needed, but above is generally sufficient
        // '/dashboard/:path*',
        // '/report/:path*',
        // '/login',
        // '/register',
    ],
};