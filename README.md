## Projeto de webscraping pro ONVIO da Thomson Reuters (Domínio Sistemas)
#

### Desenvolvido com nodejs usando biblioteca Playwright

###### Implementado apenas a parte de ***ativar os usuários do cliente do escritório e setar as pastas dos documentos de acordos os departamentos que eles tem acesso*** (portal do cliente). Muito útil pra quem migra do DA (Domínio Atendimento) e os usuários vem todos inativos, tendo que ativar cada um manualmente afim de que o ***cliente receba o email*** e comece utilizar o novo portal já com as permissões devida de acordo os departamentos que eles estão vinculados.
#

### Colocando pra funcionar
**A) Requisitos**
- NodeJS (link pra download https://nodejs.org/en/download/ versão sugerida é a 16.13.1)
- OBS.: No ONVIO não pode estar configurado a autenticação multi-fato, este projeto não está preparado pra lidar com tal autenticação ainda
  
**B) Instalando projeto e configurando usuário e senha**
- Faça um clone do projeto com `git clone ` para uma pasta do seu computador
- Dentro da pasta do projeto , crie um arquivo **.env** inserindo o USER_LOGIN e USER_PASSWORD conforme está no arquivo exemplo **.env.example**
- Abra o terminal e execute `npm install`
  
**C) Startando projeto**
- No terminal que já está aberto execute `npm run startDB`
- Abra um novo terminal (*NÃO feche/finalize o que está aberto - startDB*) e execute `npm run ActiveUsersClients` para ativar os usuários de cliente e enviar os emails pros clientes confirmar o cadastro
- Após o comando acima terminar, execute `npm run GivePermissionDocumentsToUsers` para dar permissões nas pastas que os usuários devem ter acesso de acordo os departamentos vinculados
