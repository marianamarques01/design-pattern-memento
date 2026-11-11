import { obterNomePeca } from "../dados/pecas";

export const GRUPOS_ROTEIRO = [
  {
    id: "troca-cabelo",
    rotulo: "Troca 1",
    detalhe: "Cabelo longo",
    tipo: "troca",
    categoria: "cabelo",
    valor: "longo-preto",
    rotuloSnapshot: "Antes de trocar o cabelo",
    final: false,
  },
  {
    id: "troca-camisa",
    rotulo: "Troca 2",
    detalhe: "Camisa roxa",
    tipo: "troca",
    categoria: "camisa",
    valor: "roxa",
    rotuloSnapshot: "Antes de trocar a camisa",
    falaAlterar: "O estado interno passa a ser roxo.",
    falaRedesenho: "A camisa roxa aparece no personagem.",
    final: false,
  },
  {
    id: "undo-camisa",
    rotulo: "Desfazer 1",
    detalhe: "Camisa volta a azul",
    tipo: "desfazer",
    rotuloAtual: "Reaplicar camisa roxa",
    falaFoto: "Para poder voltar, o estado de agora também vira foto.",
    falaPuxar: "O Histórico devolve o último Memento e guarda o atual no refazer.",
    falaRedesenho: "A camisa azul volta para o personagem.",
    final: false,
  },
  {
    id: "undo-cabelo",
    rotulo: "Desfazer 2",
    detalhe: "Cabelo volta a curto",
    tipo: "desfazer",
    rotuloAtual: "Reaplicar cabelo longo",
    falaFoto: "Mais uma foto: o estado de agora tem cabelo longo.",
    falaPuxar: "Devolve o Memento do cabelo curto. O atual vai para o refazer.",
    falaRedesenho: "O cabelo curto volta para o personagem.",
    final: false,
  },
  {
    id: "redo-cabelo",
    rotulo: "Refazer",
    detalhe: "Cabelo longo de novo",
    tipo: "refazer",
    rotuloAtual: "Desfazer cabelo longo",
    falaFoto: "Até o refazer precisa saber de onde está saindo.",
    falaPuxar: "Sai do refazer, e o estado atual entra no desfazer.",
    falaRedesenho: "O cabelo longo volta. A camisa continua azul.",
    final: false,
  },
  {
    id: "nova-calca",
    rotulo: "Nova edição",
    detalhe: "Calça verde",
    tipo: "troca",
    categoria: "calca",
    valor: "verde",
    rotuloSnapshot: "Antes de trocar a calça",
    falaAlterar: "O estado interno passa a ter calça verde.",
    falaRedesenho: "A tela mostra a calça verde.",
    final: true,
  },
];

const CLIENTE = "src/cliente/sessao.js";
const PERSONAGEM = "src/dominio/Personagem.js";
const HISTORICO = "src/dominio/Historico.js";

function codigoCriar() {
  return {
    arquivo: CLIENTE,
    metodo: "criarMemento()",
    codigo: ["const memento = sessao.personagem.criarMemento();"],
    destaque: [0],
  };
}

function codigoSincronizar() {
  return {
    arquivo: CLIENTE,
    metodo: "obterAparencia()",
    codigo: [
      "const aparencia = sessao.personagem.obterAparencia();",
      "renderizarPersonagem(aparencia);",
    ],
    destaque: [0, 1],
  };
}

/** Primeira troca: um passo por ideia, para apresentar o ciclo inteiro devagar. */
function passosPrimeiraTroca(grupo) {
  return [
    {
      id: `${grupo.id}-1`,
      tipo: "criar",
      titulo: "A interface pede a foto",
      fala: "Antes de mexer no cabelo, ela guarda como o personagem está agora.",
      ...codigoCriar(),
    },
    {
      id: `${grupo.id}-2`,
      tipo: "revelar-snapshot",
      titulo: "O Personagem tira a foto",
      fala: "A cópia fica presa ao Memento, dentro do Personagem. A interface só recebe o envelope.",
      arquivo: PERSONAGEM,
      metodo: "criarMemento()",
      codigo: [
        "criarMemento() {",
        "  const memento = new Memento();",
        "  snapshots.set(memento, { ...this.#estado });",
        "  return memento;",
        "}",
      ],
      destaque: [1, 2],
    },
    {
      id: `${grupo.id}-3`,
      tipo: "guardar",
      rotuloSnapshot: grupo.rotuloSnapshot,
      titulo: "A foto vai para o Histórico",
      fala: "Vai o envelope e um rótulo à parte, só para aparecer na pilha.",
      arquivo: CLIENTE,
      metodo: "guardar()",
      codigo: [`sessao.historico.guardar(memento, "${grupo.rotuloSnapshot}");`],
      destaque: [0],
    },
    {
      id: `${grupo.id}-4`,
      tipo: "exibir-pilhas",
      titulo: "O Histórico empilha",
      fala: "Entrou no topo do desfazer, e o refazer foi limpo.",
      arquivo: HISTORICO,
      metodo: "guardar()",
      codigo: [
        "guardar(memento, rotulo) {",
        "  const entrada = this.#criarEntrada(memento, rotulo);",
        "  this.#desfazer.push(entrada);",
        "  this.#refazer.length = 0;",
        "}",
      ],
      destaque: [2, 3],
    },
    {
      id: `${grupo.id}-5`,
      tipo: "alterar",
      categoria: grupo.categoria,
      valor: grupo.valor,
      titulo: "Troca o cabelo",
      fala: "O estado interno já é longo. A tela ainda desenha o cabelo antigo.",
      arquivo: CLIENTE,
      metodo: "alterarPeca()",
      codigo: [`sessao.personagem.alterarPeca("${grupo.categoria}", "${grupo.valor}");`],
      destaque: [0],
    },
    {
      id: `${grupo.id}-6`,
      tipo: "sincronizar",
      titulo: "Redesenha a tela",
      fala: "A interface pede a aparência atual e atualiza o desenho.",
      ...codigoSincronizar(),
    },
  ];
}

function passosTroca(grupo) {
  const nome = obterNomePeca(grupo.categoria, grupo.valor);
  return [
    {
      id: `${grupo.id}-1`,
      tipo: "criar",
      titulo: "Fotografa antes de trocar",
      fala: "Primeiro guarda o estado, depois mexe.",
      ...codigoCriar(),
    },
    {
      id: `${grupo.id}-2`,
      tipo: "guardar",
      rotuloSnapshot: grupo.rotuloSnapshot,
      titulo: "Empilha e limpa o refazer",
      fala: "Nova edição descarta o refazer antigo: aquele futuro não volta.",
      arquivo: CLIENTE,
      metodo: "guardar()",
      codigo: [`sessao.historico.guardar(memento, "${grupo.rotuloSnapshot}");`],
      destaque: [0],
    },
    {
      id: `${grupo.id}-3`,
      tipo: "alterar",
      categoria: grupo.categoria,
      valor: grupo.valor,
      titulo: `Troca a ${grupo.categoria === "calca" ? "calça" : "camisa"}`,
      fala: grupo.falaAlterar ?? `O estado interno agora é ${nome.toLowerCase()}.`,
      arquivo: CLIENTE,
      metodo: "alterarPeca()",
      codigo: [`sessao.personagem.alterarPeca("${grupo.categoria}", "${grupo.valor}");`],
      destaque: [0],
    },
    {
      id: `${grupo.id}-4`,
      tipo: "sincronizar",
      titulo: "Redesenha a tela",
      fala: grupo.falaRedesenho ?? `A tela mostra ${nome.toLowerCase()}.`,
      ...codigoSincronizar(),
    },
  ];
}

function passosDesfazer(grupo, refazer) {
  return [
    {
      id: `${grupo.id}-1`,
      tipo: "criar",
      titulo: "Fotografa o estado atual",
      fala: grupo.falaFoto ?? "Para poder voltar, o estado de agora também vira foto.",
      ...codigoCriar(),
    },
    {
      id: `${grupo.id}-2`,
      tipo: refazer ? "refazer" : "desfazer",
      rotuloAtual: grupo.rotuloAtual,
      titulo: refazer ? "Puxa do topo do refazer" : "Puxa do topo do desfazer",
      fala:
        grupo.falaPuxar ??
        (refazer
          ? "Sai do refazer, e o estado atual entra no desfazer."
          : "O Histórico devolve o último Memento e guarda o atual no refazer."),
      arquivo: CLIENTE,
      metodo: refazer ? "refazer()" : "desfazer()",
      codigo: [
        `sessao.historico.${refazer ? "refazer" : "desfazer"}(mementoAtual, "${grupo.rotuloAtual}");`,
      ],
      destaque: [0],
    },
    {
      id: `${grupo.id}-3`,
      tipo: "restaurar",
      titulo: "O Personagem restaura",
      fala: "O estado vivo é trocado pela cópia que estava guardada.",
      arquivo: CLIENTE,
      metodo: "restaurar()",
      codigo: ["sessao.personagem.restaurar(alvo.memento);"],
      destaque: [0],
    },
    {
      id: `${grupo.id}-4`,
      tipo: "sincronizar",
      titulo: "Redesenha a tela",
      fala: grupo.falaRedesenho ?? grupo.detalhe,
      ...codigoSincronizar(),
    },
  ];
}

function montarPassos() {
  const lista = [];
  GRUPOS_ROTEIRO.forEach((grupo, indiceGrupo) => {
    let passos;
    if (indiceGrupo === 0) passos = passosPrimeiraTroca(grupo);
    else if (grupo.tipo === "troca") passos = passosTroca(grupo);
    else passos = passosDesfazer(grupo, grupo.tipo === "refazer");

    passos.forEach((passo, indicePasso) => {
      lista.push({
        ...passo,
        grupoIndice: indiceGrupo,
        numeroNoGrupo: indicePasso + 1,
        totalNoGrupo: passos.length,
        grupo: grupo.rotulo,
        grupoDetalhe: grupo.detalhe,
        final: Boolean(grupo.final && indicePasso === passos.length - 1),
      });
    });
  });
  return lista;
}

export const PASSOS = montarPassos();
