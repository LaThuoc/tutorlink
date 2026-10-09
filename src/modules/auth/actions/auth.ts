'use server'

import { createClient } from "@/src/lib/supabase/server"
import { signupSchema, loginSchema } from "../validations/auth.schema"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { ActionState } from "../types/auth.type"


export async function signup(prevState: ActionState, formData: FormData): Promise<ActionState | void>{
    const supabase = await createClient()

    const rawData = {
        email: formData.get('email'),
        password: formData.get('password'),
        fullName: formData.get('full_name'),
        role: formData.get('role')
    }

    const validationResult = signupSchema.safeParse(rawData)
    if(!validationResult.success){
        return {
            success: false,
            errors: 'Vui lòng kiểm tra lại thông tin nhấp',
            fieldErrors: validationResult.error.flatten().fieldErrors,
        }
    }
    const {email, password, fullName, role} = validationResult.data

    const { data: existingUser} = await supabase.from('profiles').select('id').eq('email', email).maybeSingle()

    if(existingUser){
        return {
            success: false,
            errors: 'Email này đã được sử dụng.Vui lòng chọn email khác hoặc Đăng nhập',
            fieldErrors: {
                email: ['Email này đã tồn tại trên hệ thống']
            }
        }
    }
    const {error} = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                role, 
                full_name: fullName,
            }
        }
    })
    if(error){
        if(error.code === 'user_already_exists' || error.code === 'email_exists'){
            return {
                success: false,
                errors: 'Email này đã được đăng ký tài khoản',
                fieldErrors: {
                    email: ['Email đã được đăng ký']
                }
            }
        }
        return {
            success: false,
            errors: error.message
        }
    }
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login?signup=success')
}


export async function login(prevState: ActionState, formData: FormData){
    const supabase = await createClient()

    const rawData = {
        email: formData.get('email'),
        password: formData.get('password')
    }
    const validationResult = loginSchema.safeParse(rawData)
    if(!validationResult.success){
        return {
            success: false,
            errors: 'Vui lòng nhập thông tin đầy đủ',
            fieldErrors: validationResult.error.flatten().fieldErrors
        }
    }

    const { email, password} = validationResult.data
    const redirectTo = (formData.get('redirectTo') as string ) || '/dashboard'

    const {error} = await supabase.auth.signInWithPassword({
        email,
        password
    })
    if(error){
        return {
            success: false,
            error: 'Email hoặc mật khẩu không chính xác'
        }
    }
    revalidatePath('/', 'layout')
    redirect(redirectTo)

}

export async function logout(){
    const supabase = await createClient()
    await supabase.auth.signOut()

    revalidatePath('/','layout')
    redirect('/login')
}

export async function signInWithGoogle(){
    const supabase = await createClient()

    const origin = process.env.NEXT_PUBLIC_STIE_URL || 'http://localhost:3000'

    const {data, error} = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${origin}/auth/callback`,
            queryParams: {
                access_type: 'offline',
                prompt: 'select_account'
            }
        }
    })
    if(error){
        return{
            success: false,
            error: error.message
        }
    }
    if(data.url){
        redirect(data.url)
    }
}

export async function forgetPassword(prevState: ActionState, formData: FormData){
    const supabase = await createClient()
    const email = formData.get('email') as string

    if(!email){
        return {
            success: false,
            error: 'Vui lòng nhập email',
            fieldErrors: {email: ['Email không được để trống']}
        }
    }

    const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const {error} = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/reset-password`
    })
    if(error){
        return {
            sucess: false,
            errors: error.message
        }
    }
    return {
        success: true,
        errors: 'Vui lòng kiểm tra hộp thư email của bạn để đặt lại mật khẩu'
    }
}


export async function updatePassword(prevState: ActionState, formData: FormData): Promise<ActionState | void>{
    const supabase = await createClient()
    const newPassword = formData.get('password') as string

    if(!newPassword || newPassword.length < 6){
        return {
            success:false,
            errors: 'Mật khẩu phải chứa ít nhất 6 kí tự',
            fieldErrors: {
                password: ['Mật khấu quá ngắn']
            }
        }
    }

    const {error} = await supabase.auth.updateUser({
        password: newPassword
    })
    if(error){
        return {
            success: false,
            errors: error.message
        }
    }
    revalidatePath('/', 'layout')
    redirect('/login?reset=success')
}