import { Page } from 'playwright'

import { logger } from '@common/log'

export async function SelectOptionAllClients (page: Page): Promise<void> {
    try {
        await page.locator('[aria-label="Select Here"]').click()
        await page.locator('text=Todos').click()
    } catch (error) {
        logger.error(error)
    }
}