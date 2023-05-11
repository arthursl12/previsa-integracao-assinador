# previsa-integracao-assinador

Projeto para integrar o Assinador Previsa com o Ploomes, além de enviar e-mails quando um contrato for assinado.

## Instalação
- Faça clone ou download do repositório
- Use `npm install` para instalar as dependências

## Utilização
- A aplicação consiste em um servidor que escuta no endereço `http://localhost:3000` 
- Uma requisição GET no endereço "/" deve retornar uma página web simples, para verificação do funcionamento
- Requisições POST para o endereço "/webhook" serão tratadas na automação

### Observações
- As únicas requisições POST que serão realmente processadas são aquelas que tiverem o tipo `DocumentConcluded`. Outros tipos serão ignoradas.
- No momento da criação do documento no assinador, ele deve estar numa pasta com o nome da empresa, com o exato mesmo nome que está no Ploomes. Caso não esteja, a automação dará prosseguimento.
- Além disso, para prosseguir na integração, deve haver um card com a mesma empresa na fase "Ag. Assinatura do contrato" do funil Comercial Previsa para receber o anexo do contrato assinado
- 
