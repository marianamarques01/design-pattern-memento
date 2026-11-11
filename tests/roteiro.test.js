import { describe, expect, it } from "vitest";
import { PASSOS, GRUPOS_ROTEIRO } from "../src/interface/roteiro";

describe("Roteiro guiado", () => {
  it("divide a primeira troca em seis etapas e termina com a nova edição", () => {
    expect(GRUPOS_ROTEIRO).toHaveLength(6);
    expect(PASSOS).toHaveLength(26);
    expect(PASSOS.slice(0, 6).map((passo) => passo.tipo)).toEqual([
      "criar",
      "revelar-snapshot",
      "guardar",
      "exibir-pilhas",
      "alterar",
      "sincronizar",
    ]);
    expect(PASSOS[5].alterar).toBeUndefined();
    expect(PASSOS[4]).toMatchObject({ categoria: "cabelo", valor: "longo-preto" });
    expect(PASSOS[25].final).toBe(true);
  });

  it("usa metadados de rótulo separados do snapshot", () => {
    const guardar = PASSOS.find((passo) => passo.tipo === "guardar");
    expect(guardar.rotuloSnapshot).toBe("Antes de trocar o cabelo");
    const desfazer = PASSOS.find((passo) => passo.tipo === "desfazer");
    expect(desfazer.rotuloAtual).toBe("Reaplicar camisa roxa");
  });

});
