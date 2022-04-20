import { Page } from 'playwright'

import { logger } from '@common/log'

export async function OpenUserRegistration (page: Page, id: string): Promise<void> {
    try {
        await page.goto(`https://onvio.com.br/atendimento/#/setup/clients-users/update/${id}`)
    } catch (error) {
        logger.error(error)
    }
}