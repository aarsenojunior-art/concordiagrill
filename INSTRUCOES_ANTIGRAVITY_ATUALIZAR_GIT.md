# Instruções para o Antigravity — atualizar o GitHub

Trabalhe neste projeto e publique somente as correções necessárias no repositório:

- Repositório: `https://github.com/aarsenojunior-art/concordiagrill.git`
- Branch: `main`

## Objetivo

Corrigir a implantação do projeto Node.js na Hostinger. O painel da Hostinger não permite selecionar diretamente a raiz do repositório, por isso foi criada a pasta `hostinger`, que deve ser escolhida como **Diretório raiz**.

## O que deve ser revisado e enviado

1. Confirmar que estes arquivos existem:
   - `hostinger/package.json`
   - `hostinger/server.js`
   - `hostinger/README.md`
2. No `package.json` da raiz, manter `esbuild` em uma versão compatível com o Vite 8 (`^0.28.2`).
3. Atualizar o `package-lock.json` depois da mudança de versão.
4. Executar a instalação limpa das dependências.
5. Executar e validar:
   - `npm run build`
   - `npm run lint`
6. Corrigir qualquer erro real encontrado, sem remover funcionalidades do site.
7. Não adicionar ao Git arquivos `.env`, senhas, tokens, chaves da Pagar.me ou credenciais do GitHub.
8. Não adicionar automaticamente arquivos antigos ou não relacionados que estejam soltos na pasta. Revise antes de incluir qualquer arquivo além das correções descritas aqui.
9. Criar um commit com uma mensagem semelhante a:
   - `fix: add Hostinger deployment root`
10. Enviar o commit para a branch `main` do repositório informado acima.

## Configuração esperada na Hostinger depois do envio

- Diretório raiz: `hostinger`
- Framework: Express
- Gerenciador de pacotes: npm
- Arquivo de entrada: `server.js`
- Versão do Node.js: `22.x`
- Comando de compilação: `npm run build`
- Comando de inicialização: `npm start`

Nas variáveis de ambiente, não criar `PORT=21`. A Hostinger deve fornecer a porta automaticamente. As chaves da Pagar.me devem ser configuradas exclusivamente nas variáveis de ambiente do servidor (`PAGARME_SECRET_KEY`).

Ao terminar, informe o hash do commit publicado e o resultado dos testes.
