import axios from 'axios'
import { Page } from 'playwright'

import { logger } from '@common/log'
import { baseURL } from '@scrapings/_common/_baseUrl'
import { IUser } from '@scrapings/_common/_interfaces'

export async function SaveUsersList (page: Page): Promise<void> {
    try {
        let stopLoop = false
        while (!stopLoop) {
            const lenghtUsersSite = (await page.$$('#groupGrid > div:nth-child(5) > div:nth-child(1) > div.wj-cells > div.wj-row')).length

            for (let i = 1; i < lenghtUsersSite; i++) {
                const nthChild = i + 1

                const idText = await page.locator(`#groupGrid > div:nth-child(5) > div:nth-child(1) > div.wj-cells > div.wj-row:nth-child(${nthChild}) > div > div > span:nth-child(1)`).getAttribute('data-qe-id')
                const id = idText.split('-')[1].toUpperCase()

                const nameUser = await page.locator(`#groupGrid > div:nth-child(5) > div:nth-child(1) > div.wj-cells > div.wj-row:nth-child(${nthChild}) > div:nth-child(2) > div > div`).innerText()

                const email = await page.locator(`#groupGrid > div:nth-child(5) > div:nth-child(1) > div.wj-cells > div.wj-row:nth-child(${nthChild}) > div:nth-child(4) > div > div`).innerText()

                try {
                    const user: IUser = (await axios.get(`${baseURL}/${id}`)).data
                    // if already send email, dont save again
                    if (!user.sendEmail && !user?.alreadyTrySendEmail) {
                        user.count = user.count + 1
                        await axios.put(`${baseURL}/${user.id}`, { ...user })
                    }
                } catch (error) {
                    await axios.post(baseURL, { id, nameUser, email, count: 1, sendEmail: false, alreadyTrySendEmail: false })
                }

                const user: IUser = (await axios.get(`${baseURL}/${id}`)).data

                // if load the same user two times so finish all PageDown possible
                if (user.count > 2) {
                    stopLoop = true
                    logger.info('\t- Terminou de pegar listagem de usuarios')
                    break
                }
            }

            // Click placeholder="Pesquisa"
            await page.locator('[placeholder="Pesquisa"]').click()

            // Press Tab
            await page.locator('[placeholder="Pesquisa"]').press('Tab')

            // Press PageDown to load new users
            await page.locator('#groupGrid > div:nth-child(5) > div:nth-child(1) > div.wj-cells > div.wj-row').nth(1).press('PageDown')
        }
    } catch (error) {
        if (axios.isAxiosError(error)) logger.error(error.response?.data)
        else logger.error(error)
    }
}