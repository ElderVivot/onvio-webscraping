
import { Page } from 'playwright'

import { logger } from '@common/log'

export async function Login (page: Page): Promise<void> {
    try {
        await page.goto('https://onvio.com.br/#/')

        logger.info('\t- Informando usuario e senha')
        await page.locator('[placeholder="Endereço de E-mail \\(Thomson Reuters ID\\)"]').fill(process.env.USER_LOGIN)
        await page.locator('[placeholder="Senha"]').fill(process.env.USER_PASSWORD)

        logger.info('\t- Clicando no botao entrar')
        await page.locator('button[name="signinBtn"]').click()

        logger.info('\t- Clicando pra lembrar mais tarde sobre autenticacao multi-fator')
        await Promise.all([
            page.waitForNavigation(),
            page.locator('text=Lembrar Mais Tarde').click()
        ])
    } catch (error) {
        logger.error(error)
    }
}