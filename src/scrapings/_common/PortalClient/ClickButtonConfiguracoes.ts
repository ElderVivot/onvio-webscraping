
import { Page } from 'playwright'

import { logger } from '@common/log'

export async function ClickButtonConfiguracoes (page: Page): Promise<void> {
    try {
        await page.locator('text=Configurações').click()
    } catch (error) {
        logger.error(error)
    }
}