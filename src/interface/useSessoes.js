import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  criarSessao,
  executarDesfazer,
  executarRefazer,
  executarTroca,
  executarTrocaGenero,
  lerSessao,
} from "../cliente/sessao";
import { obterCategoria, obterNomeGenero, obterNomePeca } from "../dados/pecas";
import { PASSOS } from "./roteiro";

function resumo(sessao) {
  const dados = lerSessao(sessao);
  return {
    aparencia: dados.aparencia,
    desfazer: dados.historico.totalDesfazer,
    refazer: dados.historico.totalRefazer,
  };
}

function visaoInicial(sessao) {
  const dados = lerSessao(sessao);
  return {
    ...dados,
    aparenciaRenderizada: dados.aparencia,
    eventos: [],
  };
}

export function useSessaoLivre() {
  const sessaoRef = useRef(null);
  if (!sessaoRef.current) sessaoRef.current = criarSessao();

  const [visao, setVisao] = useState(() => visaoInicial(sessaoRef.current));
  const [ultimaMudanca, setUltimaMudanca] = useState(null);
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    if (!aviso) return undefined;
    const timer = window.setTimeout(() => setAviso(""), 3200);
    return () => window.clearTimeout(timer);
  }, [aviso]);

  const registrar = useCallback((evento, antes, depois) => {
    setVisao((atual) => {
      const dados = lerSessao(sessaoRef.current);
      return {
        ...dados,
        aparenciaRenderizada: dados.aparencia,
        eventos: [{ ...evento, id: `${Date.now()}-${Math.random()}` }, ...atual.eventos].slice(0, 8),
      };
    });
    setUltimaMudanca({ antes, depois, evento });
  }, []);

  const trocar = useCallback(
    (categoria, pecaId) => {
      const sessao = sessaoRef.current;
      const atual = sessao.personagem.obterAparencia();
      if (atual[categoria] === pecaId) {
        setAviso(
          `${obterNomePeca(categoria, pecaId)} já está em uso. Nenhum Memento foi criado.`,
        );
        return;
      }

      const antes = resumo(sessao);
      const resultado = executarTroca(sessao, {
        categoria,
        pecaId,
        rotulo: `Antes de trocar ${obterCategoria(categoria).singular}`,
      });
      const depois = resumo(sessao);

      if (resultado.tipo === "sem-mudanca") {
        setAviso("A peça escolhida já estava no personagem.");
        return;
      }

      setAviso("");
      registrar(
        {
          tipo: "troca",
          titulo: `Memento #${resultado.mementoSalvo.numero} guardado`,
          detalhe: `${obterCategoria(categoria).rotulo}: ${obterNomePeca(categoria, pecaId)}`,
        },
        antes,
        depois,
      );
    },
    [registrar],
  );

  const trocarGenero = useCallback(
    (genero) => {
      const sessao = sessaoRef.current;
      const atual = sessao.personagem.obterAparencia();
      if (atual.genero === genero) {
        setAviso(`O corpo ${obterNomeGenero(genero).toLowerCase()} já está em uso.`);
        return;
      }

      const antes = resumo(sessao);
      const resultado = executarTrocaGenero(sessao, {
        genero,
        rotulo: "Antes de trocar o corpo",
      });
      if (resultado.tipo === "sem-mudanca") return;
      const depois = resumo(sessao);
      setAviso("");
      registrar(
        {
          tipo: "troca",
          titulo: `Memento #${resultado.mementoSalvo.numero} guardado`,
          detalhe: `Corpo: ${obterNomeGenero(genero)}`,
        },
        antes,
        depois,
      );
    },
    [registrar],
  );

  const desfazer = useCallback(() => {
    const sessao = sessaoRef.current;
    const antes = resumo(sessao);
    const resultado = executarDesfazer(sessao, {
      rotuloAtual: "Estado antes de desfazer",
    });
    if (resultado.tipo === "pilha-vazia") {
      setAviso("A pilha de desfazer está vazia.");
      return;
    }
    const depois = resumo(sessao);
    setAviso("");
    registrar(
      {
        tipo: "desfazer",
        titulo: `Memento #${resultado.mementoRestaurado.numero} restaurado`,
        detalhe: resultado.mementoRestaurado.rotulo,
      },
      antes,
      depois,
    );
  }, [registrar]);

  const refazer = useCallback(() => {
    const sessao = sessaoRef.current;
    const antes = resumo(sessao);
    const resultado = executarRefazer(sessao, {
      rotuloAtual: "Estado antes de refazer",
    });
    if (resultado.tipo === "pilha-vazia") {
      setAviso("A pilha de refazer está vazia.");
      return;
    }
    const depois = resumo(sessao);
    setAviso("");
    registrar(
      {
        tipo: "refazer",
        titulo: `Memento #${resultado.mementoRestaurado.numero} reaplicado`,
        detalhe: resultado.mementoRestaurado.rotulo,
      },
      antes,
      depois,
    );
  }, [registrar]);

  const reiniciar = useCallback(() => {
    sessaoRef.current = criarSessao();
    setVisao(visaoInicial(sessaoRef.current));
    setUltimaMudanca(null);
    setAviso("");
  }, []);

  return {
    ...visao,
    ultimaMudanca,
    aviso,
    podeDesfazer: visao.historico.totalDesfazer > 0,
    podeRefazer: visao.historico.totalRefazer > 0,
    ultimoEvento: visao.eventos[0] ?? null,
    trocar,
    trocarGenero,
    desfazer,
    refazer,
    reiniciar,
  };
}

export function useSessaoGuiada() {
  const sessaoRef = useRef(null);
  if (!sessaoRef.current) sessaoRef.current = criarSessao();

  const mementoPendenteRef = useRef(null);
  const mementoAlvoRef = useRef(null);

  const [visao, setVisao] = useState(() => visaoInicial(sessaoRef.current));
  const [indice, setIndice] = useState(0);
  const [concluido, setConcluido] = useState(false);
  const [temPendente, setTemPendente] = useState(false);
  const [snapshotRevelado, setSnapshotRevelado] = useState(false);
  const [alvoInfo, setAlvoInfo] = useState(null);
  const [renderPendente, setRenderPendente] = useState(false);
  const [ultimaMudanca, setUltimaMudanca] = useState(null);
  const [erro, setErro] = useState("");

  const passoAtual = useMemo(() => {
    if (PASSOS.length === 0) return null;
    return PASSOS[Math.min(indice, PASSOS.length - 1)];
  }, [indice]);

  const sincronizarHistorico = useCallback(() => {
    const sessao = sessaoRef.current;
    setVisao((atual) => ({
      ...atual,
      historico: sessao.historico.obterVisao(),
    }));
  }, []);

  const sincronizarTudo = useCallback(() => {
    const sessao = sessaoRef.current;
    const dados = lerSessao(sessao);
    setVisao((atual) => ({
      ...atual,
      aparencia: dados.aparencia,
      aparenciaRenderizada: dados.aparencia,
      historico: dados.historico,
    }));
    setRenderPendente(false);
  }, []);

  const registrarEvento = useCallback((evento, antes, depois) => {
    setVisao((atual) => ({
      ...atual,
      eventos: [
        { ...evento, id: `${Date.now()}-${Math.random()}` },
        ...atual.eventos,
      ].slice(0, 10),
    }));
    setUltimaMudanca({ antes, depois, evento });
  }, []);

  const avancar = useCallback(() => {
    const sessao = sessaoRef.current;
    const passo = PASSOS[indice];
    if (!passo || concluido) return;

    const antes = resumo(sessao);
    let evento = null;

    try {
      switch (passo.tipo) {
        case "criar": {
          mementoPendenteRef.current = sessao.personagem.criarMemento();
          setTemPendente(true);
          setSnapshotRevelado(false);
          evento = {
            tipo: "criar",
            titulo: "Memento criado",
            detalhe: "Objeto opaco na mão da interface.",
          };
          break;
        }
        case "revelar-snapshot": {
          if (!mementoPendenteRef.current) throw new Error("Nenhum Memento pendente.");
          setSnapshotRevelado(true);
          evento = {
            tipo: "snapshot",
            titulo: "Snapshot selado",
            detalhe: "Conteúdo guardado no WeakMap privado.",
          };
          break;
        }
        case "guardar": {
          if (!mementoPendenteRef.current) throw new Error("Nenhum Memento para guardar.");
          const salvo = sessao.historico.guardar(
            mementoPendenteRef.current,
            passo.rotuloSnapshot ?? "Estado anterior",
          );
          mementoPendenteRef.current = null;
          setTemPendente(false);
          setSnapshotRevelado(false);
          sincronizarHistorico();
          evento = {
            tipo: "guardar",
            titulo: `Memento #${salvo.numero} guardado`,
            detalhe: "O refazer foi limpo pela nova edição.",
          };
          break;
        }
        case "exibir-pilhas": {
          sincronizarHistorico();
          evento = {
            tipo: "pilhas",
            titulo: "Pilhas renderizadas",
            detalhe: "Dados lidos de Historico.obterVisao().",
          };
          break;
        }
        case "alterar": {
          sessao.personagem.alterarPeca(passo.categoria, passo.valor);
          const aparencia = sessao.personagem.obterAparencia();
          setVisao((atual) => ({ ...atual, aparencia }));
          setRenderPendente(true);
          evento = {
            tipo: "alterar",
            titulo: "Estado interno alterado",
            detalhe: "O palco aguarda o próximo redesenho.",
          };
          break;
        }
        case "desfazer":
        case "refazer": {
          if (!mementoPendenteRef.current) throw new Error("Nenhum Memento pendente.");
          const alvo =
            passo.tipo === "refazer"
              ? sessao.historico.refazer(
                  mementoPendenteRef.current,
                  passo.rotuloAtual,
                )
              : sessao.historico.desfazer(
                  mementoPendenteRef.current,
                  passo.rotuloAtual,
                );
          mementoPendenteRef.current = null;
          setTemPendente(false);
          if (!alvo) throw new Error("Pilha vazia.");
          mementoAlvoRef.current = alvo.memento;
          setAlvoInfo({ numero: alvo.numero, rotulo: alvo.rotulo });
          sincronizarHistorico();
          evento = {
            tipo: passo.tipo,
            titulo: `Memento #${alvo.numero} recuperado`,
            detalhe:
              passo.tipo === "refazer"
                ? "Saiu do topo do refazer."
                : "Saiu do topo do desfazer.",
          };
          break;
        }
        case "restaurar": {
          if (!mementoAlvoRef.current) throw new Error("Nenhum Memento para restaurar.");
          sessao.personagem.restaurar(mementoAlvoRef.current);
          mementoAlvoRef.current = null;
          const aparencia = sessao.personagem.obterAparencia();
          setVisao((atual) => ({ ...atual, aparencia }));
          setRenderPendente(true);
          setAlvoInfo(null);
          evento = {
            tipo: "restaurar",
            titulo: "Memento restaurado",
            detalhe: "O Personagem trocou o estado vivo pelo snapshot.",
          };
          break;
        }
        case "sincronizar": {
          sincronizarTudo();
          evento = {
            tipo: "render",
            titulo: "Personagem redesenhado",
            detalhe: "A interface sincronizou palco, estado e pilhas.",
          };
          break;
        }
        default:
          throw new Error(`Tipo de passo desconhecido: ${passo.tipo}`);
      }

      const depois = resumo(sessaoRef.current);
      registrarEvento(evento, antes, depois);
      setErro("");
      const proximo = indice + 1;
      setIndice(proximo);
      if (proximo >= PASSOS.length) setConcluido(true);
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Falha ao executar a etapa.");
    }
  }, [
    concluido,
    indice,
    registrarEvento,
    sincronizarHistorico,
    sincronizarTudo,
  ]);

  const reiniciar = useCallback(() => {
    sessaoRef.current = criarSessao();
    mementoPendenteRef.current = null;
    mementoAlvoRef.current = null;
    setVisao(visaoInicial(sessaoRef.current));
    setIndice(0);
    setConcluido(false);
    setTemPendente(false);
    setSnapshotRevelado(false);
    setAlvoInfo(null);
    setRenderPendente(false);
    setUltimaMudanca(null);
    setErro("");
  }, []);

  return {
    ...visao,
    passoAtual,
    indice,
    totalPassos: PASSOS.length,
    concluido,
    temPendente,
    snapshotRevelado,
    alvoInfo,
    renderPendente,
    ultimaMudanca,
    erro,
    avancar,
    reiniciar,
  };
}

