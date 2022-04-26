import { webkit } from 'playwright'

async function process () {
    try {
        const browser = await webkit.launch({ headless: false, slowMo: 1500, timeout: 10000 })
        const page = await browser.newPage()
        // Go to https://www.economia.go.gov.br/
        await page.goto('https://www.economia.go.gov.br/')

        const form = await page.waitForSelector('form[name="frmAcesso"]')
        await form.evaluate((form: any) => form.removeAttribute('target'))

        // Click [placeholder="CPF"]
        await page.locator('[placeholder="CPF"]').click()

        // Fill [placeholder="CPF"]
        await page.locator('[placeholder="CPF"]').fill('CPF')

        // Press Tab
        await page.locator('[placeholder="CPF"]').press('Tab')

        // Fill [placeholder="Senha"]
        await page.locator('[placeholder="Senha"]').fill('PASSWORD')

        await page.locator('text=Entrar').click()

        // Click text=:: Nota Fiscal Eletronica
        await page.locator('text=:: Nota Fiscal Eletronica').click()

        // Click text=:: Baixar XML NFE
        const [page2] = await Promise.all([
            page.waitForEvent('popup'),
            page.locator('text=:: Baixar XML NFE').click()
        ])

        // Click text=Enviar mesmo assim
        await page2.locator('text=Enviar mesmo assim').click()
    } catch (error) {
        console.log(error)
    }
}

process().then(_ => console.log(_))