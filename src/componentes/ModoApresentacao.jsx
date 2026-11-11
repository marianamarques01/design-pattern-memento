import { useEffect } from "react";
import { PainelGuiado } from "./PainelGuiado";
import { SpritePersonagem } from "./SpritePersonagem";
import {
  CAMPOS_ESTADO,
  obterNomeGenero,
  obterNomePeca,
} from "../dados/pecas";

function PilhaApresentacao({ titulo, tipo, itens, vaziaLimpa }) {
  return (
    <section className={`p-stack p-stack-${tipo}`}>
      <header>
        <span aria-hidden="true">{tipo === "undo" ? "↶" : "↷"}</span>
        <h4>{titulo}</h4>
        <b>{itens.length}</b>
      </header>
      <div className="p-stack-list">
        {itens.length === 0 ? (
          <p className={vaziaLimpa ? "is-clean" : ""}>
            {vaziaLimpa ? "limpa pela nova edição" : "pilha vazia"}
          </p>
        ) : (
          itens.map((item) => (
            <article className={item.topo ? "is-top" : ""} key={`${tipo}-${item.numero}`}>
              <div>
                <span>Memento #{item.numero}</span>
                {item.topo && <em>topo</em>}
              </div>
              <p>{item.rotulo}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function valorDoCampo(campo, aparencia) {
  if (campo.id === "genero") return obterNomeGenero(aparencia.genero);
  return obterNomePeca(campo.id, aparencia[campo.id]);
}

export function ModoApresentacao({ aberto, aoFechar, aoAbrirCreditos, guiado, teclasBloqueadas }) {
  useEffect(() => {
    if (!aberto) return undefined;
    const overflowOriginal = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const aoTeclar = (evento) => {
      if (teclasBloqueadas) return;
      if (evento.key === "Escape") {
        aoFechar();
        return;
      }
      if (evento.repeat) return;
      if (evento.key === "ArrowRight" || evento.key === "PageDown") {
        evento.preventDefault();
        guiado.avancar();
      }
    };
    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.body.style.overflow = overflowOriginal;
      document.removeEventListener("keydown", aoTeclar);
    };
  }, [aberto, aoFechar, teclasBloqueadas, guiado.avancar]);

  if (!aberto) return null;

  return (
    <div className="presentation-shell" role="presentation">
      <div
        className="presentation-page"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-apresentacao"
      >
      <header className="presentation-head">
        <div>
          <p className="eyebrow">Memento · apresentação</p>
          <h2 id="titulo-apresentacao">Execução passo a passo</h2>
          <p className="presentation-subtitle">Uma operação por vez. O roteiro começa no estado base.</p>
        </div>
        <div className="presentation-actions">
          <button type="button" className="credits-presentation" onClick={aoAbrirCreditos}>
            Créditos e licenças
          </button>
          <button type="button" className="close-presentation" onClick={aoFechar}>
            Voltar ao ateliê
          </button>
        </div>
      </header>

      <div className="presentation-grid">
        <aside className="presentation-side">
          <div className="presentation-character">
            <div className="character-aura small" aria-hidden="true" />
            <SpritePersonagem aparencia={guiado.aparenciaRenderizada} />
            {guiado.renderPendente && (
              <span className="stale-note">aguardando redesenho</span>
            )}
          </div>

          <section className="presentation-state">
            <p className="eyebrow">Estado interno</p>
            <dl>
              {CAMPOS_ESTADO.map((campo) => (
                <div key={campo.id}>
                  <dt>{campo.rotulo}</dt>
                  <dd>{valorDoCampo(campo, guiado.aparencia)}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="presentation-stacks" aria-label="Pilhas do Histórico">
            <div className="presentation-stacks-head">
              <p className="eyebrow">Pilhas do Histórico</p>
              <span>{guiado.historico.totalDesfazer + guiado.historico.totalRefazer} Mementos</span>
            </div>
            <div className="p-stacks">
              <PilhaApresentacao
                titulo="Desfazer"
                tipo="undo"
                itens={guiado.historico.desfazer}
              />
              <PilhaApresentacao
                titulo="Refazer"
                tipo="redo"
                itens={guiado.historico.refazer}
                vaziaLimpa={guiado.concluido && guiado.historico.totalRefazer === 0}
              />
            </div>
            <p className="presentation-note">O Histórico nunca abre o snapshot.</p>
          </section>
        </aside>

        <PainelGuiado
          passoAtual={guiado.passoAtual}
          indice={guiado.indice}
          totalPassos={guiado.totalPassos}
          concluido={guiado.concluido}
          avancar={guiado.avancar}
          reiniciar={guiado.reiniciar}
          aparencia={guiado.aparencia}
          erro={guiado.erro}
        />
      </div>
      </div>
    </div>
  );
}
