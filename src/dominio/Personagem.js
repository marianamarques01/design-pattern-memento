/**
 * Personagem (Originator) e Memento.
 *
 * O WeakMap fica no escopo deste módulo e NÃO é exportado. Assim, o objeto
 * Memento é opaco: a interface e o Histórico podem segurá-lo, mas não ler o
 * snapshot. A única forma de restaurar é entregá-lo de volta ao Personagem.
 */

const snapshots = new WeakMap();
const CAMPOS = new Set(["genero", "cabelo", "camisa", "calca", "acessorio"]);
const GENEROS = new Set(["masculino", "feminino"]);

export class Memento {
  constructor() {
    Object.freeze(this);
  }
}

export class Personagem {
  #estado;

  constructor(estadoInicial) {
    this.#validarEstado(estadoInicial);
    // O estado é composto apenas por strings: uma cópia rasa é suficiente.
    this.#estado = { ...estadoInicial };
  }

  #validarEstado(estado) {
    if (!estado || typeof estado !== "object") {
      throw new TypeError("O estado inicial precisa ser um objeto.");
    }
    for (const categoria of CAMPOS) {
      if (typeof estado[categoria] !== "string") {
        throw new TypeError(`O campo "${categoria}" precisa ser uma string.`);
      }
    }
    if (!GENEROS.has(estado.genero)) {
      throw new TypeError('O campo "genero" precisa ser "masculino" ou "feminino".');
    }
  }

  /**
   * Cópia de leitura para a interface desenhar o personagem.
   * Isso não expõe nenhum Memento.
   */
  obterAparencia() {
    return { ...this.#estado };
  }

  /** Cria um snapshot independente do estado atual. */
  criarMemento() {
    const memento = new Memento();
    // Cópia rasa: todos os valores são strings, então não há objetos internos
    // compartilhados entre o estado vivo e o snapshot.
    snapshots.set(memento, { ...this.#estado });
    return memento;
  }

  /** Restaura um Memento criado por ESTE personagem. */
  restaurar(memento) {
    const estadoSalvo = snapshots.get(memento);
    if (!(memento instanceof Memento) || !estadoSalvo) {
      throw new TypeError("Memento inválido ou criado por outro Personagem.");
    }
    // Nova cópia: o estado vivo nunca compartilha o objeto guardado no Memento.
    this.#estado = { ...estadoSalvo };
  }

  /** Altera o corpo escolhido; o gênero também faz parte do snapshot. */
  alterarGenero(genero) {
    if (!GENEROS.has(genero)) {
      throw new TypeError(`Gênero desconhecido: ${genero}`);
    }
    this.#estado = { ...this.#estado, genero };
  }

  /** Altera uma peça; a interface decide quando e qual peça trocar. */
  alterarPeca(categoria, pecaId) {
    if (categoria === "genero" || !CAMPOS.has(categoria)) {
      throw new TypeError(`Categoria de peça desconhecida: ${categoria}`);
    }
    if (typeof pecaId !== "string") {
      throw new TypeError("O identificador da peça precisa ser uma string.");
    }
    this.#estado = { ...this.#estado, [categoria]: pecaId };
  }
}
