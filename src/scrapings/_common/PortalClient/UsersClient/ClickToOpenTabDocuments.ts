import { Page } from 'playwright'

import { logger } from '@common/log'

export async function ClickToOpenTabDocuments (page: Page): Promise<void> {
    try {
        await page.locator('uib-tab-heading:has-text("Documentos")').click()
    } catch (error) {
        logger.error(error)
    }
}