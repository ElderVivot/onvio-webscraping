import 'dotenv/config'
import axios from 'axios'
import { webkit } from 'playwright'

import { logger } from '@common/log'

const baseURL = 'http://localhost:3491/users_clients'

interface IUser {
    id: string
    nameUser: string
    email: string
    count: number
    sendEmail: boolean
}

async function mainActiveUsers () {
    try {
        const browser = await webkit.launch({ headless: false, slowMo: 1500 })
        const page = await browser.newPage()

        logger.info('1- Abrindo site ONVIO')
        await page.goto('https://onvio.com.br/#/')

        logger.info('2- Informando usuário e senha')
        await page.locator('[placeholder="Endereço de E-mail \\(Thomson Reuters ID\\)"]').fill(process.env.USER_LOGIN)
        await page.locator('[placeholder="Senha"]').fill(process.env.USER_PASSWORD)

        logger.info('3- Clicando no botão entrar')
        await page.locator('button[name="signinBtn"]').click()

        logger.info('4- Clicando pra lembrar mais tarde sobre autenticação multi-fator')
        await Promise.all([
            page.waitForNavigation(),
            page.locator('text=Lembrar Mais Tarde').click()
        ])

        logger.info('5- Abrindo portal cliente')
        await page.goto('https://onvio.com.br/atendimento/#/news/staff')

        logger.info('6- Clicando no botão "Configurações"')
        await page.locator('text=Configurações').click()

        logger.info('7- Selecionando opção "Usuários de cliente"')
        await page.locator('text=Usuários de cliente').click()

        logger.info('8- Selecionando opção "Todos" pra listar os usuários de todos os clientes')
        await page.locator('[aria-label="Select Here"]').click()
        await page.locator('text=Todos').click()

        logger.info('9- Coletando todos usuários da listagem')
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
                    user.count = user.count + 1
                    await axios.put(`${baseURL}/${user.id}`, { ...user })
                } catch (error) {
                    await axios.post(baseURL, { id, nameUser, email, count: 1, sendEmail: false })
                }

                const user: IUser = (await axios.get(`${baseURL}/${id}`)).data

                // if load the same user two times so finish all PageDown possible
                if (user.count > 2) {
                    stopLoop = true
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

        const users:IUser[] = (await axios.get(`${baseURL}?sendEmail=false`)).data

        logger.info('10- Abrindo o cadastro de cada usuário, ativando e enviado email')
        for (const user of users) {
            try {
                await page.goto(`https://onvio.com.br/atendimento/#/setup/clients-users/update/${user.id}`)

                // Click button[name="client-portal-access-on"]
                await page.locator('button[name="client-portal-access-on"]').click()

                // Click text=ENVIAR AGORA
                await page.locator('text=ENVIAR AGORA').click()

                // Click button:has-text("Salvar")
                await Promise.all([
                    page.waitForNavigation(),
                    page.locator('button:has-text("Salvar")').click()
                ])

                user.sendEmail = true
                await axios.put(`${baseURL}/${user.id}`, { ...user })

                logger.info(`\t- Enviado do usuário: "${user.nameUser}" | "${user.email}"`)
            } catch (error) {
                if (axios.isAxiosError(error)) logger.error(error.response?.data)
                else logger.error(error)
            }
        }

        await browser.close()
    } catch (error) {
        if (axios.isAxiosError(error)) logger.error(error.response?.data)
        else logger.error(error)
    }
}

mainActiveUsers().then(_ => logger.info(_)).catch(_ => logger.error)