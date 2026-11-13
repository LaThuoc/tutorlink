import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

function getHomePath(role: string) {
    if (role === 'admin') return '/admin'
    if (role === 'tutor') return '/dashboard/tutor'
    return '/'
}
export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    const protectedRoutes = ['/dashboard', '/profile', '/admin']
    const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password']

    const isProtectedRoute = protectedRoutes.some((path) => pathname.startsWith(path))
    const isAuthRoute = authRoutes.some((path) => pathname.startsWith(path))
    const isHomeRoute = pathname === '/'



    if (!isProtectedRoute && !isAuthRoute && !isHomeRoute) {
        return NextResponse.next({request})
    }
    const hasAuthCookie = request.cookies.getAll().some(cookie => cookie.name.startsWith('sb-'))
    if (!hasAuthCookie) {
        if (isProtectedRoute) {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            url.searchParams.set('redirectTo', pathname)
            return NextResponse.redirect(url)
        }
        return NextResponse.next({ request })
    }

    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                }
            }
        }
    )


    const { data: { user } } = await supabase.auth.getUser()
    if(isHomeRoute && !user){
        return supabaseResponse
    }

    if (isProtectedRoute && !user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('redirectTo', pathname)
        return NextResponse.redirect(url)
    }

    if (user) {
        let userRole: string = user.user_metadata?.role ?? 'student'
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
        if (profile?.role) {
            userRole = profile.role
        }

        const home = getHomePath(userRole)
        if(isHomeRoute){
            if(home !== '/'){
                const url = request.nextUrl.clone()
                url.pathname = home
                url.search = ''
                return NextResponse.redirect(url)
            }
            return supabaseResponse
        }

        if (isAuthRoute) {
            const url = request.nextUrl.clone()
            url.pathname = home
            url.search = ''
            return NextResponse.redirect(url)
        }

        if (pathname === '/dashboard') {
            const url = request.nextUrl.clone()
            url.pathname = home
            url.search = ''
            return NextResponse.redirect(url)
        }
        if (pathname.startsWith('/admin') && userRole !== 'admin') {
            const url = request.nextUrl.clone()
            url.pathname = home
            return NextResponse.redirect(url)
        }

        if (pathname.startsWith('/dashboard/tutor') && userRole !== 'tutor' && userRole !== 'admin') {
            const url = request.nextUrl.clone()
            url.pathname = home
            return NextResponse.redirect(url)
        }

        if (pathname.startsWith('/dashboard/student') && userRole !== 'student' && userRole !== 'admin') {
            const url = request.nextUrl.clone()
            url.pathname = home
            return NextResponse.redirect(url)
        }
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}