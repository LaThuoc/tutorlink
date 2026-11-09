export interface ActionState  {
    errors?: string,
    success?: boolean,
    fieldErrors?: Record<string, string[] | undefined>
    message?: string,
    role?: string;
    redirectTo?: string;
    isCompleted?:boolean;
}