import { Page } from 'playwright'

import { logger } from '@common/log'
import { treateTextField } from '@common/utils/functions'

export async function SetPermissionOfDocuments (page: Page, departamentsSelected: string[]): Promise<void> {
    try {
        const clientsDocsList = await page.$$('div[role=tablist] > div')
        for (const element of clientsDocsList) {
            const elementToExpandedCompanie = await element.$('div')
            await elementToExpandedCompanie.click()

            const elementOptionsFolderOfCompanie = await element.$$('div:nth-child(2) > div > div[ng-repeat*=folder]')
            for (const elementOption of elementOptionsFolderOfCompanie) {
                const label = treateTextField(await elementOption.$eval('label', el => el.textContent))
                if (departamentsSelected.indexOf(label) >= 0) {
                    await (await elementOption.$('input')).check()
                } else {
                    await (await elementOption.$('input')).uncheck()
                }
            }
        }
    } catch (error) {
        logger.error(error)
    }
}