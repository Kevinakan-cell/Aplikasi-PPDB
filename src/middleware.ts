import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  
  // 1. Setup response and Supabase client
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 2. Fetch authenticated user details
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = url.pathname;

  // 3. Route Guard Logic
  if (pathname.startsWith('/dashboard')) {
    // If not logged in, redirect to login
    if (!user) {
      url.pathname = '/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }

    const userRole = user.user_metadata?.role || 'siswa';

    // Role-based Access Control
    if (pathname.startsWith('/dashboard/admin') && userRole !== 'admin') {
      // Students cannot access Admin dashboard
      url.pathname = '/dashboard/siswa';
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith('/dashboard/siswa') && userRole !== 'siswa') {
      // Admins cannot access Student dashboard
      url.pathname = '/dashboard/admin';
      return NextResponse.redirect(url);
    }
  }

  // Redirect authenticated user away from login page to their dashboard
  if (pathname === '/login' && user) {
    const userRole = user.user_metadata?.role || 'siswa';
    if (userRole === 'admin') {
      url.pathname = '/dashboard/admin';
    } else {
      url.pathname = '/dashboard/siswa';
    }
    return NextResponse.redirect(url);
  }

  return response;
}

// Apply middleware configuration to all dashboard routes and login page
export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
