
import { Page } from 'playwright'

import { logger } from '@common/log'

export async function ClickUsersClient (page: Page): Promise<void> {
    try {
        await page.locator('text=Usuários de cliente').click()
    } catch (error) {
        logger.error(error)
    }
}