export interface IUser {
    id: string
    nameUser: string
    email: string
    count: number
    sendEmail: boolean
    alreadyTrySendEmail?: boolean
}