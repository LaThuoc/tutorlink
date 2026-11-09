import { createClient } from "@/src/lib/supabase/server";   
import { NextResponse } from "next/server";

export async function GET(request: Request){
    const {searchParams , origin} = new URL(request.url)
    const code = searchParams.get('code')
    const redirectTo = searchParams.get('redirectTo')
    
    if(code){
        const supabase = await createClient()
        const {error} = await supabase.auth.exchangeCodeForSession(code)

        if(!error){
            if(redirectTo){
                return NextResponse.redirect(`${origin}${redirectTo}`)
            }
            const {data: {user}} = await supabase.auth.getUser()
            if(user){
                const {data: profile} = await supabase.from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single()
                const role = profile?.role
                if(role === 'admin'){
                    return NextResponse.redirect(`${origin}/admin`)
                }else if (role === 'tutor'){
                    return NextResponse.redirect(`${origin}/dashboard/tutor`)
                }else {
                    return NextResponse.redirect(`${origin}/`)
                }
            }
        }
    }
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
}