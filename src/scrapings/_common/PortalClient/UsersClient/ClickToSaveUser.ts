import { Page } from 'playwright'

import { logger } from '@common/log'

export async function ClickToSaveUser (page: Page): Promise<void> {
    try {
        // Click button:has-text("Salvar")
        await Promise.all([
            page.waitForNavigation(),
            page.locator('button:has-text("Salvar")').click()
        ])
    } catch (error) {
        logger.error(error)
    }
}