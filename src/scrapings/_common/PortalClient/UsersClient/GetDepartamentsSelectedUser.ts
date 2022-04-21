import { Page } from 'playwright'

import { logger } from '@common/log'
import { treateTextField } from '@common/utils/functions'

export async function GetDepartamentsSelectedUser (page: Page): Promise<string[]> {
    const departamentsSelected = []
    try {
        const departamentsSelectedPage = await page.locator('.selected-items-group > span').allInnerTexts()
        departamentsSelectedPage.map(value => departamentsSelected.push(treateTextField(value)))
        return departamentsSelected
    } catch (error) {
        logger.error(error)
    }
}