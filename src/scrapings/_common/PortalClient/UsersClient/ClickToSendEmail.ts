import { Page } from 'playwright'

import { logger } from '@common/log'

export async function ClickToSendEmail (page: Page): Promise<void> {
    try {
        // Click button[name="client-portal-access-on"]
        await page.locator('button[name="client-portal-access-on"]').click()
        // Click text=ENVIAR AGORA
        if (await page.locator('text=ENVIAR AGORA').isDisabled()) {
            await page.locator('form[name="vm\\.sendInviteForm"] >> text=CANCELAR').click()
        } else {
            await page.locator('text=ENVIAR AGORA').click()
        }
    } catch (error) {
        logger.error(error)
    }
}