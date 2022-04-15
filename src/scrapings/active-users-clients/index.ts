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
    alreadyTrySendEmail?: boolean
}

async function mainActiveUsers () {
    try {
        const browser = await webkit.launch({ headless: false, slowMo: 1500, timeout: 10000 })
        const page = await browser.newPage()

        logger.info('1- Abrindo site ONVIO')
        await page.goto('https://onvio.com.br/#/')

        logger.info('2- Informando usuario e senha')
        await page.locator('[placeholder="Endereço de E-mail \\(Thomson Reuters ID\\)"]').fill(process.env.USER_LOGIN)
        await page.locator('[placeholder="Senha"]').fill(process.env.USER_PASSWORD)

        logger.info('3- Clicando no botao entrar')
        await page.locator('button[name="signinBtn"]').click()

        logger.info('4- Clicando pra lembrar mais tarde sobre autenticacao multi-fator')
        await Promise.all([
            page.waitForNavigation(),
            page.locator('text=Lembrar Mais Tarde').click()
        ])

        logger.info('5- Abrindo portal cliente')
        await page.goto('https://onvio.com.br/atendimento/#/news/staff')

        logger.info('6- Clicando no botao "Configuracoes"')
        await page.locator('text=Configurações').click()

        logger.info('7- Selecionando opção "Usuarios de cliente"')
        await page.locator('text=Usuários de cliente').click()

        logger.info('8- Selecionando opcao "Todos" pra listar os usuarios de todos os clientes')
        await page.locator('[aria-label="Select Here"]').click()
        await page.locator('text=Todos').click()

        logger.info('9- Filtrando inativos')
        await page.locator('[uib-tooltip]="Mostrar Filtros"').click()
        await page.locator('text=Ações Usuário do cliente Status Endereço de e-mail Ativo Inativo >> [aria-label="Dropdown Arrow"] i').click()
        await page.locator('span:has-text("Inativo")').click()

        logger.info('10- Coletando todos usuarios da listagem')
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

        const users:IUser[] = (await axios.get(`${baseURL}?sendEmail=false`)).data

        logger.info('11- Abrindo o cadastro de cada usuario, ativando e enviado email')
        for (const user of users) {
            if (user?.alreadyTrySendEmail) {
                logger.info(`\t- Ja enviado ou tentativa com erro do usuario: "${user.nameUser}" | "${user.email}"`)
                continue
            }
            try {
                await page.goto(`https://onvio.com.br/atendimento/#/setup/clients-users/update/${user.id}`)

                // Click button[name="client-portal-access-on"]
                await page.locator('button[name="client-portal-access-on"]').click()
                // Click text=ENVIAR AGORA
                if (await page.locator('text=ENVIAR AGORA').isDisabled()) {
                    await page.locator('form[name="vm\\.sendInviteForm"] >> text=CANCELAR').click()
                } else {
                    await page.locator('text=ENVIAR AGORA').click()
                }
                // Click button:has-text("Salvar")
                await Promise.all([
                    page.waitForNavigation(),
                    page.locator('button:has-text("Salvar")').click()
                ])

                user.sendEmail = true
                await axios.put(`${baseURL}/${user.id}`, { ...user })

                logger.info(`\t- Enviado do usuario: "${user.nameUser}" | "${user.email}"`)
            } catch (error) {
                user.alreadyTrySendEmail = true
                await axios.put(`${baseURL}/${user.id}`, { ...user })

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