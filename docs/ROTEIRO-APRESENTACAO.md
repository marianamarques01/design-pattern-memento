# Roteiro de apresentação

## Antes de começar

1. Execute `npm run dev`.
2. Abra a aplicação em tela cheia, zoom em 100%, preferencialmente em 1440×900 ou maior.
3. Confirme que o ateliê está no estado inicial: corpo masculino, cabelo curto, roupa azul, calça cinza e nenhum acessório.

## Fala de abertura

> “Este é um ateliê de personagem. A cada escolha, o sistema precisa lembrar do estado anterior para desfazer. O padrão Memento resolve isso sem que a interface conheça o conteúdo dos snapshots.”

Aponte os três elementos principais da tela: **personagem**, **personalização** e os botões **Desfazer/Refazer** sempre visíveis.

## 1. Personalização livre (2 minutos)

1. Troque **Roupa → Roxa**.
2. Mostre que **Desfazer** ficou ativo e que a linha abaixo do personagem informa o Memento salvo.
3. Clique em **Desfazer** e depois em **Refazer**.
4. Clique novamente na peça já selecionada.
   > “Nenhum Memento novo: a troca não foi efetiva.”
5. Troque o **Corpo** para **Feminino**.
6. Desfaça. O corpo volta para masculino.
   > “Gênero também é estado: ele entra no snapshot, não é só um detalhe visual.”
7. Troque o corpo novamente para feminino e escolha uma calça e um cabelo diferentes.

## 2. Abrir a execução (3 minutos)

Clique em **Ver execução passo a passo**, no rodapé.

Cada etapa mostra uma coisa só: a frase que você fala, o código daquela chamada e o efeito na tela.

- à esquerda, o personagem do roteiro, o estado interno e as pilhas;
- no centro, a frase grande da etapa;
- abaixo dela, o código com **arquivo**, **método** e a linha executada em destaque;
- o botão **Próxima etapa** (ou a tecla → / espaço), que executa uma chamada real por vez.

### Primeira troca, seis momentos

Clique em **Próxima etapa** seis vezes, lendo a frase em voz alta:

1. **A interface pede a foto** — `criarMemento()` parte do cliente.
   > “Antes de mexer no cabelo, ela guarda como o personagem está agora.”
2. **O Personagem tira a foto** — a cópia fica presa ao Memento, dentro do `WeakMap`.
   > “A interface só recebe o envelope; não consegue abrir.”
3. **A foto vai para o Histórico** — vai o Memento e um rótulo à parte.
4. **O Histórico empilha** — entra no topo do desfazer e o refazer é limpo.
5. **Troca o cabelo** — o estado interno muda; a tela ainda mostra o cabelo antigo.
6. **Redesenha a tela** — a interface lê `obterAparencia()` e atualiza o desenho.

Neste ponto, mostre a frase que fecha a didática: **a interface decide quando chamar; o Personagem cria e restaura; o Histórico organiza**.

## 3. Restante do roteiro (2 minutos)

Continue clicando em **Próxima etapa** e narrando os quatro passos de cada grupo:

- **Troca 2 — Camisa roxa:** fotografa, empilha e limpa o refazer, troca a camisa, redesenha.
- **Desfazer 1:** fotografa o atual, puxa do topo do desfazer, o Personagem restaura, redesenha.
- **Desfazer 2:** o mesmo ciclo, agora devolvendo o cabelo curto.
- **Refazer:** fotografa o atual, puxa do topo do refazer, restaura, redesenha.
- **Nova edição — Calça verde:** fotografa, empilha e descarta o refazer, troca a calça, redesenha.

No fim, aponte:

- Estado final do roteiro: cabelo longo, camisa azul, calça verde.
- Desfazer: Memento #6 no topo e Memento #5 abaixo.
- Refazer: **vazio**, com **“limpa pela nova edição”**.
- A caixa **Fim do roteiro** resume o estado e confirma o refazer vazio.

Feche com **Voltar ao ateliê**. O estado livre anterior continua preservado.

## 4. Fechamento

> “A interface decide quando chamar. O Personagem sabe criar e restaurar o estado. O Histórico organiza os Mementos sem ler o conteúdo. Por isso a interface pode desenhar o personagem, mas não consegue abrir um snapshot antigo.”

## Onde abrir o código durante a apresentação

- **Personagem + Memento + WeakMap:** `src/dominio/Personagem.js`
- **Pilhas privadas:** `src/dominio/Historico.js`
- **Cliente coordenando:** `src/cliente/sessao.js`
- **Tela minimalista:** `src/App.jsx` e `src/componentes/PainelLivre.jsx`
- **Apresentação:** `src/componentes/ModoApresentacao.jsx`
- **Definição dos 26 passos:** `src/interface/roteiro.js`
- **Execução real dos passos:** `src/interface/useSessoes.js`
- **Testes:** `tests/memento.test.js` e `tests/roteiro.test.js`
