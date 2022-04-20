import { Page } from 'playwright'

import { logger } from '@common/log'

export async function FilterUsers (page: Page, status: string): Promise<void> {
    try {
        await page.locator('[uib-tooltip="Mostrar Filtros"]').click()
        await page.locator('text=Ações Usuário do cliente Status Endereço de e-mail Ativo Inativo >> [aria-label="Dropdown Arrow"] i').click()
        await page.locator(`span:has-text("${status}")`).click()
        await page.locator('[uib-tooltip="Esconder Filtros"]').click()
    } catch (error) {
        logger.error(error)
    }
}