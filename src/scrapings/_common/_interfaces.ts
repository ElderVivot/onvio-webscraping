export interface IUser {
    id: string
    nameUser: string
    email: string
    statusUser: string
    sendEmail: boolean
    alreadyTrySendEmail?: boolean
    updatePermissionDocuments?: boolean
}