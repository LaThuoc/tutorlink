import { createClient } from "@/src/lib/supabase/server";   
import { NextResponse } from "next/server";

export async function GET(request: Request){
    const {searchParams , origin} = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('redirectTo') ?? '/dashboard'
    
    if(code){
        const supabase = await createClient()
        const {error} = await supabase.auth.exchangeCodeForSession(code)

        if(!error){
            const {data: {user}} = await supabase.auth.getUser()
            if(user){
                const {data: profile} = await supabase.from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single()
                const role = profile?.role
                if(next){
                    return NextResponse.redirect(`${origin}${next}`)
                }
                if(role === 'admin'){
                    return NextResponse.redirect(`${origin}/admin`)
                }else if (role === 'tutor'){
                    return NextResponse.redirect(`${origin}/dashboard/tutor`)
                }else {
                    return NextResponse.redirect(`${origin}/dashboard/student`)
                }
            }
        }
    }
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
}