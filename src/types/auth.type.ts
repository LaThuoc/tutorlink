export type ActionState = {
    errors?: string,
    success?: boolean,
    fieldErrors?: Record<string, string[] | undefined>
    message?: string,
}