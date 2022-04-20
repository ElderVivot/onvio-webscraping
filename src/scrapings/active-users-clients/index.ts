import 'dotenv/config'
import axios from 'axios'
import { webkit } from 'playwright'

import { logger } from '@common/log'
import { baseURL } from '@scrapings/_common/_baseUrl'
import { IUser } from '@scrapings/_common/_interfaces'
import { Login } from '@scrapings/_common/Login'
import { ClickButtonConfiguracoes } from '@scrapings/_common/PortalClient/ClickButtonConfiguracoes'
import { ClickUsersClient } from '@scrapings/_common/PortalClient/ClickUsersClient'
import { OpenPortal } from '@scrapings/_common/PortalClient/OpenPortal'
import { ClickToSaveUser } from '@scrapings/_common/PortalClient/UsersClient/ClickToSaveUser'
import { ClickToSendEmail } from '@scrapings/_common/PortalClient/UsersClient/ClickToSendEmail'
import { FilterUsers } from '@scrapings/_common/PortalClient/UsersClient/FilterUsers'
import { OpenUserRegistration } from '@scrapings/_common/PortalClient/UsersClient/OpenUserRegistration'
import { SaveUsersList } from '@scrapings/_common/PortalClient/UsersClient/SaveUsersList'
import { SelectOptionAllClients } from '@scrapings/_common/PortalClient/UsersClient/SelectOptionAllClients'

async function mainActiveUsers () {
    try {
        const browser = await webkit.launch({ headless: false, slowMo: 1500, timeout: 10000 })
        const page = await browser.newPage()

        logger.info('1- Abrindo site ONVIO e realizando Login')
        await Login(page)

        logger.info('5- Abrindo portal cliente')
        await OpenPortal(page)

        logger.info('6- Clicando no botao "Configuracoes"')
        await ClickButtonConfiguracoes(page)

        logger.info('7- Selecionando opção "Usuarios de cliente"')
        await ClickUsersClient(page)

        logger.info('8- Selecionando opcao "Todos" pra listar os usuarios de todos os clientes')
        await SelectOptionAllClients(page)

        logger.info('9- Filtrando inativos')
        await FilterUsers(page, 'Inativo')

        logger.info('10- Coletando todos usuarios da listagem')
        await SaveUsersList(page)

        const users:IUser[] = (await axios.get(`${baseURL}?sendEmail=false`)).data

        logger.info('11- Abrindo o cadastro de cada usuario, ativando e enviado email')
        for (const user of users) {
            if (user?.alreadyTrySendEmail) {
                logger.info(`\t- Ja enviado ou tentativa com erro do usuario: "${user.nameUser}" | "${user.email}"`)
                continue
            }
            try {
                await OpenUserRegistration(page, user.id)

                await ClickToSendEmail(page)

                await ClickToSaveUser(page)

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