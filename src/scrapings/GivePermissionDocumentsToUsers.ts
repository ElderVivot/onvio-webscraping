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
// import { FilterUsers } from '@scrapings/_common/PortalClient/UsersClient/FilterUsers'
import { OpenUserRegistration } from '@scrapings/_common/PortalClient/UsersClient/OpenUserRegistration'
import { SaveUsersList } from '@scrapings/_common/PortalClient/UsersClient/SaveUsersList'
import { SelectOptionAllClients } from '@scrapings/_common/PortalClient/UsersClient/SelectOptionAllClients'

import { ClickToOpenTabDocuments } from './_common/PortalClient/UsersClient/ClickToOpenTabDocuments'
import { GetDepartamentsSelectedUser } from './_common/PortalClient/UsersClient/GetDepartamentsSelectedUser'
import { SetPermissionOfDocuments } from './_common/PortalClient/UsersClient/SetPermissionOfDocuments'

async function mainGivePermissionDocuments () {
    try {
        const browser = await webkit.launch({ headless: true, slowMo: 700, timeout: 10000 })
        const page = await browser.newPage()

        logger.info('1- Abrindo site ONVIO e realizando Login')
        await Login(page)

        logger.info('2- Abrindo portal cliente')
        await OpenPortal(page)

        logger.info('3- Clicando no botao "Configuracoes"')
        await ClickButtonConfiguracoes(page)

        logger.info('4- Selecionando opção "Usuarios de cliente"')
        await ClickUsersClient(page)

        logger.info('5- Selecionando opcao "Todos" pra listar os usuarios de todos os clientes')
        await SelectOptionAllClients(page)

        // logger.info('6- Filtrando ativos')
        // await FilterUsers(page, 'Ativo')

        // logger.info('7- Coletando todos usuarios da listagem')
        // await SaveUsersList(page)

        const users:IUser[] = (await axios.get(`${baseURL}?statusUser=ATIVO`)).data
        // const users:IUser[] = (await axios.get(`${baseURL}?id=6FD51ABD0C1742A2835050EB0382915D`)).data

        logger.info('8- Abrindo o cadastro de cada usuario, e ajustando permissoes dos documentos')
        for (const user of users) {
            logger.info(`\t- Atualizando usuario "${user.nameUser}" | "${user.email}"`)
            if (user?.updatePermissionDocuments) {
                logger.info('\t\t- Ja atualizado permissoes anteriormente')
                continue
            }
            try {
                logger.info('\t\t- Abrindo cadastro')
                await OpenUserRegistration(page, user.id)

                logger.info('\t\t- Pegando departamentos que usuario tem permissao')
                const departamentsSelected = await GetDepartamentsSelectedUser(page)
                logger.info(`\t\t- Usuario tem permissoes dos deptos: ${departamentsSelected}`)

                if (departamentsSelected.length > 0) {
                    logger.info('\t\t- Abrindo aba documentos')
                    await ClickToOpenTabDocuments(page)

                    logger.info('\t\t- Setando permissoes')
                    await SetPermissionOfDocuments(page, departamentsSelected)
                } else throw 'Usuario sem departamento vinculado'

                await ClickToSaveUser(page)

                user.updatePermissionDocuments = true
                await axios.put(`${baseURL}/${user.id}`, { ...user })

                logger.info('\t\t- Salvo dados')
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

mainGivePermissionDocuments().then(_ => logger.info(_)).catch(_ => logger.error)