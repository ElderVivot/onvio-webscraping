### Projeto de webscraping pro ONVIO da Thomson Reuters (Antigo Dominio Sistemas)
#

##### Desenvolvido com nodejs usando biblioteca Playwright
#

Implementado apenas a parte de ***ativar os usuários do cliente do escritório*** (portal do cliente). Muito útil pra quem migra do DA (Domínio Atendimento) e os usuários vem todos inativos, tendo que ativar cada um manualmente afim de que o ***cliente receba o email*** e comece utilizar o novo portal.

##### Colocando pra funcionar
- **A) Requisitos**
-- NodeJS (link pra download https://nodejs.org/en/download/ versão sugerida é a 16.13.1)
-- OBS.: No ONVIO não pode estar configurado a autenticação multi-fato, este projeto não está preparado pra lidar com tal autenticação ainda
- **B) Instalando projeto e configurando usuário e senha**
-- Faça um clone do projeto com `git clone ` para uma pasta do seu computador
-- Dentro da pasta do projeto , crie um arquivo **.env** inserindo o USER_LOGIN e USER_PASSWORD conforme está no arquivo exemplo **.env.example**
-- Abra o terminal e execute `npm install`
- **C) Startando projeto**
-- No terminal que já está aberto execute `npm run startDB`
-- Abra um novo terminal (*mantenha o que está aberto da forma que está*) e execute `npm run activeUsersClients`