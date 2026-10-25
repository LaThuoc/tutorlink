import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest){
    let supabaseResponse = NextResponse.next({
        request
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll(){
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet){
                    cookiesToSet.forEach(({name, value}) => request.cookies.set(name,value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({name,value, options}) =>
                        supabaseResponse.cookies.set(name,value, options)
                    )
                }
            }
        }
    )

    const pathname = request.nextUrl.pathname

    const protectedRoutes = ['/dashboard', '/profile', '/admin']
    const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password']

    const isProtectedRoute = protectedRoutes.some((path) => pathname.startsWith(path))
    const isAuthRoute = authRoutes.some((path) => pathname.startsWith(path))
    
    if(isProtectedRoute || isAuthRoute){
        const {data : {user}} = await supabase.auth.getUser()

        if(isProtectedRoute && !user){
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            url.searchParams.set('redirectTo', pathname)
            return NextResponse.redirect(url)
        }
        if(isAuthRoute && user){
            const url = request.nextUrl.clone()
            url.pathname = '/dashboard'
            return NextResponse.redirect(url)
        }
        if(isProtectedRoute && user){
            const {data: profile} = await supabase.from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            const userRole = profile?.role

            if(pathname.startsWith('/admin') && userRole !== 'admin'){
                const url = request.nextUrl.clone()
                url.pathname = userRole === 'tutor' ? '/dashboard/tutor' : '/dashboard/student'
                return NextResponse.redirect(url)
            }
            if(pathname.startsWith('/dashboard/tutor') && userRole !== 'tutor' && userRole !== 'admin'){
                const url = request.nextUrl.clone()
                url.pathname = '/dashboard/student'
                return NextResponse.redirect(url)
            }
            if(pathname.startsWith('/dashboard/student') && userRole !== 'student' && userRole !== 'admin'){
                const url = request.nextUrl.clone()
                url.pathname = '/dashboard/tutor'
                return NextResponse.redirect(url)
            }
        }
    }
    return supabaseResponse
    
}
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}














