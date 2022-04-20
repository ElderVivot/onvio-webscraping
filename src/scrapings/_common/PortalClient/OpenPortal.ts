
import { Page } from 'playwright'

import { logger } from '@common/log'

export async function OpenPortal (page: Page): Promise<void> {
    try {
        await page.goto('https://onvio.com.br/atendimento/#/news/staff')
    } catch (error) {
        logger.error(error)
    }
}