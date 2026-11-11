import { Personagem } from "../dominio/Personagem";
import { Historico } from "../dominio/Historico";

export const ESTADO_INICIAL = Object.freeze({
  genero: "masculino",
  cabelo: "curto-castanho",
  camisa: "azul",
  calca: "cinza",
  acessorio: "nenhum",
});

export function criarSessao(estadoInicial = ESTADO_INICIAL) {
  return {
    personagem: new Personagem(estadoInicial),
    historico: new Historico(),
  };
}

export function lerSessao(sessao) {
  return {
    aparencia: sessao.personagem.obterAparencia(),
    historico: sessao.historico.obterVisao(),
  };
}

/**
 * Camada cliente: coordena as chamadas, mas não conhece o conteúdo do snapshot.
 * Retorna resultados descritivos para a interface — nunca o estado do Memento.
 */
export function executarTroca(sessao, { categoria, pecaId, rotulo }) {
  const atual = sessao.personagem.obterAparencia();
  if (atual[categoria] === pecaId) {
    return { tipo: "sem-mudanca", aparencia: atual };
  }

  const memento = sessao.personagem.criarMemento();
  const salvo = sessao.historico.guardar(memento, rotulo);
  sessao.personagem.alterarPeca(categoria, pecaId);

  return {
    tipo: "troca",
    aparencia: sessao.personagem.obterAparencia(),
    mementoSalvo: salvo,
  };
}

export function executarTrocaGenero(sessao, { genero, rotulo }) {
  const atual = sessao.personagem.obterAparencia();
  if (atual.genero === genero) {
    return { tipo: "sem-mudanca", aparencia: atual };
  }

  const memento = sessao.personagem.criarMemento();
  const salvo = sessao.historico.guardar(memento, rotulo);
  sessao.personagem.alterarGenero(genero);

  return {
    tipo: "troca",
    aparencia: sessao.personagem.obterAparencia(),
    mementoSalvo: salvo,
  };
}

export function executarDesfazer(sessao, { rotuloAtual }) {
  if (!sessao.historico.temDesfazer()) {
    return { tipo: "pilha-vazia", pilha: "desfazer" };
  }

  const mementoAtual = sessao.personagem.criarMemento();
  const alvo = sessao.historico.desfazer(mementoAtual, rotuloAtual);
  if (!alvo) return { tipo: "pilha-vazia", pilha: "desfazer" };

  sessao.personagem.restaurar(alvo.memento);
  return {
    tipo: "desfazer",
    aparencia: sessao.personagem.obterAparencia(),
    mementoRestaurado: { numero: alvo.numero, rotulo: alvo.rotulo },
  };
}

export function executarRefazer(sessao, { rotuloAtual }) {
  if (!sessao.historico.temRefazer()) {
    return { tipo: "pilha-vazia", pilha: "refazer" };
  }

  const mementoAtual = sessao.personagem.criarMemento();
  const alvo = sessao.historico.refazer(mementoAtual, rotuloAtual);
  if (!alvo) return { tipo: "pilha-vazia", pilha: "refazer" };

  sessao.personagem.restaurar(alvo.memento);
  return {
    tipo: "refazer",
    aparencia: sessao.personagem.obterAparencia(),
    mementoRestaurado: { numero: alvo.numero, rotulo: alvo.rotulo },
  };
}
