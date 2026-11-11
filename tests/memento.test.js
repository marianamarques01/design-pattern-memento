import { describe, expect, it } from "vitest";
import { Memento, Personagem } from "../src/dominio/Personagem";
import { Historico } from "../src/dominio/Historico";
import {
  ESTADO_INICIAL,
  criarSessao,
  executarDesfazer,
  executarRefazer,
  executarTroca,
  executarTrocaGenero,
} from "../src/cliente/sessao";

const estado = () => ({ ...ESTADO_INICIAL });

describe("Personagem e Memento", () => {
  it("cria snapshot independente do estado vivo", () => {
    const personagem = new Personagem(estado());
    const memento = personagem.criarMemento();

    personagem.alterarPeca("cabelo", "longo-preto");
    expect(personagem.obterAparencia().cabelo).toBe("longo-preto");

    personagem.restaurar(memento);
    expect(personagem.obterAparencia()).toEqual(estado());
  });

  it("inclui o gênero no snapshot e restaura o corpo anterior", () => {
    const personagem = new Personagem(estado());
    const memento = personagem.criarMemento();
    personagem.alterarGenero("feminino");
    expect(personagem.obterAparencia().genero).toBe("feminino");
    personagem.restaurar(memento);
    expect(personagem.obterAparencia().genero).toBe("masculino");
  });

  it("rejeita gênero inválido", () => {
    const personagem = new Personagem(estado());
    expect(() => personagem.alterarGenero("outro")).toThrow(/Gênero desconhecido/);
  });

  it("não compartilha a cópia devolvida por obterAparencia", () => {
    const personagem = new Personagem(estado());
    const copia = personagem.obterAparencia();
    copia.cabelo = "coque-loiro";
    expect(personagem.obterAparencia().cabelo).toBe("curto-castanho");
  });

  it("mantém o conteúdo do Memento opaco", () => {
    const personagem = new Personagem(estado());
    const memento = personagem.criarMemento();

    expect(memento).toBeInstanceOf(Memento);
    expect(Object.keys(memento)).toEqual([]);
    expect(JSON.stringify(memento)).toBe("{}");
    expect(Object.getOwnPropertyNames(memento)).toEqual([]);
  });

  it("rejeita Memento estranho sem lançar no fluxo normal de restaurar", () => {
    const personagem = new Personagem(estado());
    expect(() => personagem.restaurar({})).toThrow(/Memento inválido/);
    expect(() => personagem.restaurar(new Memento())).toThrow(/Memento inválido/);
  });
});

describe("Historico (Caretaker)", () => {
  it("guarda e devolve objetos Memento, sem ler o snapshot", () => {
    const personagem = new Personagem(estado());
    const historico = new Historico();
    const memento = personagem.criarMemento();

    const salvo = historico.guardar(memento, "Antes de trocar");
    expect(salvo.numero).toBe(1);
    expect(historico.obterVisao().desfazer[0].rotulo).toBe("Antes de trocar");

    const devolvido = historico.desfazer(personagem.criarMemento(), "Atual");
    expect(devolvido.memento).toBe(memento);
  });

  it("trata pilhas vazias sem erros", () => {
    const personagem = new Personagem(estado());
    const historico = new Historico();
    expect(historico.desfazer(personagem.criarMemento())).toBeNull();
    expect(historico.refazer(personagem.criarMemento())).toBeNull();
    expect(historico.temDesfazer()).toBe(false);
    expect(historico.temRefazer()).toBe(false);
  });

  it("não expõe estado do snapshot na visão das pilhas", () => {
    const personagem = new Personagem(estado());
    const historico = new Historico();
    historico.guardar(personagem.criarMemento(), "Antes de trocar a camisa");
    const visao = historico.obterVisao();
    const serializada = JSON.stringify(visao);

    expect(serializada).not.toContain("curto-castanho");
    expect(serializada).not.toContain("azul");
    expect(visao.desfazer[0]).toEqual({
      numero: 1,
      rotulo: "Antes de trocar a camisa",
      topo: true,
    });
  });
});

describe("Cliente coordenando troca, desfazer e refazer", () => {
  it("primeira troca cria Memento e pode ser desfeita", () => {
    const sessao = criarSessao();
    executarTroca(sessao, {
      categoria: "cabelo",
      pecaId: "longo-preto",
      rotulo: "Antes do cabelo",
    });
    expect(sessao.personagem.obterAparencia().cabelo).toBe("longo-preto");
    expect(sessao.historico.obterVisao().totalDesfazer).toBe(1);

    const resultado = executarDesfazer(sessao, { rotuloAtual: "Para refazer" });
    expect(resultado.tipo).toBe("desfazer");
    expect(sessao.personagem.obterAparencia()).toEqual(estado());
    expect(sessao.historico.obterVisao().totalRefazer).toBe(1);
  });

  it("não cria entrada para a mesma peça", () => {
    const sessao = criarSessao();
    const resultado = executarTroca(sessao, {
      categoria: "camisa",
      pecaId: "azul",
      rotulo: "Antes da camisa",
    });
    expect(resultado.tipo).toBe("sem-mudanca");
    expect(sessao.historico.obterVisao().totalDesfazer).toBe(0);
    expect(sessao.historico.obterVisao().totalRefazer).toBe(0);
  });

  it("refaz depois de desfazer", () => {
    const sessao = criarSessao();
    executarTroca(sessao, { categoria: "cabelo", pecaId: "longo-preto", rotulo: "A" });
    executarDesfazer(sessao, { rotuloAtual: "B" });
    executarRefazer(sessao, { rotuloAtual: "C" });

    expect(sessao.personagem.obterAparencia().cabelo).toBe("longo-preto");
    expect(sessao.historico.obterVisao().totalRefazer).toBe(0);
  });

  it("troca de corpo também cria Memento e pode ser desfeita", () => {
    const sessao = criarSessao();
    const resultado = executarTrocaGenero(sessao, {
      genero: "feminino",
      rotulo: "Antes de trocar o corpo",
    });
    expect(resultado.tipo).toBe("troca");
    expect(sessao.personagem.obterAparencia().genero).toBe("feminino");
    expect(sessao.historico.obterVisao().totalDesfazer).toBe(1);

    executarDesfazer(sessao, { rotuloAtual: "Para refazer" });
    expect(sessao.personagem.obterAparencia().genero).toBe("masculino");
  });

  it("nova edição limpa o refazer", () => {
    const sessao = criarSessao();
    executarTroca(sessao, { categoria: "cabelo", pecaId: "longo-preto", rotulo: "A" });
    executarTroca(sessao, { categoria: "camisa", pecaId: "roxa", rotulo: "B" });
    executarDesfazer(sessao, { rotuloAtual: "C" });
    expect(sessao.historico.temRefazer()).toBe(true);

    executarTroca(sessao, { categoria: "calca", pecaId: "verde", rotulo: "D" });
    expect(sessao.historico.temRefazer()).toBe(false);
    expect(sessao.historico.obterVisao().totalRefazer).toBe(0);
  });

  it("percorre o roteiro da apresentação", () => {
    const sessao = criarSessao();

    executarTroca(sessao, { categoria: "cabelo", pecaId: "longo-preto", rotulo: "1" });
    executarTroca(sessao, { categoria: "camisa", pecaId: "roxa", rotulo: "2" });

    executarDesfazer(sessao, { rotuloAtual: "3" });
    expect(sessao.personagem.obterAparencia()).toMatchObject({
      cabelo: "longo-preto",
      camisa: "azul",
    });

    executarDesfazer(sessao, { rotuloAtual: "4" });
    expect(sessao.personagem.obterAparencia()).toMatchObject({
      cabelo: "curto-castanho",
      camisa: "azul",
    });

    executarRefazer(sessao, { rotuloAtual: "5" });
    expect(sessao.personagem.obterAparencia().cabelo).toBe("longo-preto");
    expect(sessao.historico.temRefazer()).toBe(true);

    executarTroca(sessao, { categoria: "calca", pecaId: "verde", rotulo: "6" });
    expect(sessao.personagem.obterAparencia().calca).toBe("verde");
    expect(sessao.historico.temRefazer()).toBe(false);
  });
});
