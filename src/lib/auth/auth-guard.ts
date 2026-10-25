import { createClient } from "../supabase/server";

export async function requireAuth(){
    const supabase = await createClient()

    const {data: {user}} = await supabase.auth.getUser()
    if(!user){
        throw new Error('Bạn cần đăng nhập để thực hiện thao tác này')
    }

    return {user, supabase}
}

export async function requireAdminRole(){
    const {user, supabase} = await requireAuth()


    const {data: profile} = await supabase.from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
    
    if(profile?.role !== 'admin'){
        throw new Error('Thao tác này yêu cầu quyền Admin')
    }
    return {user, supabase}
}

export async function requireTutorRole(){
    const {user, supabase} = await requireAuth()

    const {data: profile} = await supabase.from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if(profile?.role !== 'tutor'){
        throw new Error('Thao tác này chỉ dành cho gia sư')
    }

    return {user, supabase}
}


