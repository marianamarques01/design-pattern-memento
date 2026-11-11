/**
 * Histórico (Caretaker).
 *
 * Guarda apenas objetos Memento + metadados de exibição (número e rótulo).
 * Nunca lê o snapshot: não há acesso a roupas, cabelo, etc. nesta classe.
 */
export class Historico {
  #desfazer = [];
  #refazer = [];
  #proximoNumero = 1;

  #criarEntrada(memento, rotulo) {
    return {
      numero: this.#proximoNumero++,
      memento,
      rotulo: rotulo || "Estado anterior",
    };
  }

  #resumo(entrada) {
    return { numero: entrada.numero, rotulo: entrada.rotulo };
  }

  #mapearPilha(pilha) {
    return pilha
      .slice()
      .reverse()
      .map((entrada, indice) => ({
        numero: entrada.numero,
        rotulo: entrada.rotulo,
        topo: indice === 0,
      }));
  }

  guardar(memento, rotulo = "Estado anterior") {
    const entrada = this.#criarEntrada(memento, rotulo);
    this.#desfazer.push(entrada);
    // Regra do Memento: uma nova alteração invalida o futuro refeito.
    this.#refazer.length = 0;
    return this.#resumo(entrada);
  }

  desfazer(mementoAtual, rotuloAtual = "Estado antes de desfazer") {
    if (this.#desfazer.length === 0) return null;

    this.#refazer.push(this.#criarEntrada(mementoAtual, rotuloAtual));
    const alvo = this.#desfazer.pop();
    return { memento: alvo.memento, ...this.#resumo(alvo) };
  }

  refazer(mementoAtual, rotuloAtual = "Estado antes de refazer") {
    if (this.#refazer.length === 0) return null;

    this.#desfazer.push(this.#criarEntrada(mementoAtual, rotuloAtual));
    const alvo = this.#refazer.pop();
    return { memento: alvo.memento, ...this.#resumo(alvo) };
  }

  temDesfazer() {
    return this.#desfazer.length > 0;
  }

  temRefazer() {
    return this.#refazer.length > 0;
  }

  obterVisao() {
    return {
      desfazer: this.#mapearPilha(this.#desfazer),
      refazer: this.#mapearPilha(this.#refazer),
      totalDesfazer: this.#desfazer.length,
      totalRefazer: this.#refazer.length,
    };
  }
}
