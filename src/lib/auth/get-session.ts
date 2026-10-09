import { createClient } from "../supabase/server";

export async function getCurrentUserInfo(){
    const supabase = await createClient()
    
    const {data: {user}, error: userError } = await supabase.auth.getUser()

    if(userError || !user){
        return {user: null, profile: null}
    }

    const {data: profile, error: profileError} = await supabase
        .from('profile')
        .select('*')
        .eq('id', user.id )
        .single()

    if(profileError){
        return {user,profile: null}
    }
    return { user, profile}
}