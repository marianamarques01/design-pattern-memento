import { useEffect, useState } from "react";
import { PainelLivre } from "./componentes/PainelLivre";
import { SpritePersonagem } from "./componentes/SpritePersonagem";
import { ModoApresentacao } from "./componentes/ModoApresentacao";
import { ModalCreditos } from "./componentes/ModalCreditos";
import { LinhasNeon } from "./componentes/LinhasNeon";
import { useSessaoGuiada, useSessaoLivre } from "./interface/useSessoes";

function UndoIcon({ direction = "left" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {direction === "left" ? (
        <path d="M9 7 4 12l5 5M5 12h9a5 5 0 0 1 5 5" />
      ) : (
        <path d="m15 7 5 5-5 5m4-5h-9a5 5 0 0 0-5 5" />
      )}
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 11a8 8 0 1 1 2.34 5.66M4 7v4h4" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export default function App() {
  const [creditosAbertos, setCreditosAbertos] = useState(false);
  const [apresentacaoAberta, setApresentacaoAberta] = useState(false);
  const livre = useSessaoLivre();
  const guiado = useSessaoGuiada();

  useEffect(() => {
    const aoTeclar = (evento) => {
      if (creditosAbertos || apresentacaoAberta || !(evento.metaKey || evento.ctrlKey)) {
        return;
      }
      if (evento.key.toLowerCase() !== "z") return;
      evento.preventDefault();
      if (evento.shiftKey) livre.refazer();
      else livre.desfazer();
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [livre.desfazer, livre.refazer, creditosAbertos, apresentacaoAberta]);

  const status =
    livre.aviso ||
    (livre.ultimoEvento
      ? `${livre.ultimoEvento.titulo}. ${livre.ultimoEvento.detalhe}.`
      : "Cada troca cria um Memento antes de alterar o personagem.");

  return (
    <div className="app">
      <LinhasNeon />
      <header className="minimal-header">
        <p className="wordmark">Memento</p>
      </header>

      <main className="atelier">
        <div className="workspace">
          <section className="hero">
            <header className="intro">
              <h1 id="titulo-principal">Monte seu personagem</h1>
              <p>O Memento guarda um snapshot do estado para desfazer e refazer sem expor o conteúdo à interface.</p>
              <span className="title-rule" aria-hidden="true" />
            </header>

            <div className="character-area">
              <div className="character-aura" aria-hidden="true" />
              <SpritePersonagem aparencia={livre.aparenciaRenderizada} />
              <div className="character-floor" aria-hidden="true" />
            </div>

            <div className="character-actions">
              <button
                type="button"
                className="round-button"
                onClick={livre.desfazer}
                disabled={!livre.podeDesfazer}
                title="Desfazer (Ctrl/Cmd + Z)"
              >
                <UndoIcon direction="left" />
                Desfazer
              </button>
              <button
                type="button"
                className="round-button"
                onClick={livre.refazer}
                disabled={!livre.podeRefazer}
                title="Refazer (Ctrl/Cmd + Shift + Z)"
              >
                Refazer
                <UndoIcon direction="right" />
              </button>
              <button type="button" className="text-button reset-button" onClick={livre.reiniciar}>
                <ResetIcon />
                Reiniciar
              </button>
            </div>

            <p className={`status-line ${livre.aviso ? "is-warning" : ""}`} role="status" aria-live="polite">
              {status}
            </p>
          </section>

          <PainelLivre
            aparencia={livre.aparencia}
            trocar={livre.trocar}
            trocarGenero={livre.trocarGenero}
          />
        </div>
      </main>

      <footer className="minimal-footer">
        <button
          type="button"
          className="step-toggle"
          onClick={() => setApresentacaoAberta(true)}
        >
          <ChevronDown />
          Ver execução passo a passo
        </button>
      </footer>

      <ModoApresentacao
        aberto={apresentacaoAberta}
        aoFechar={() => setApresentacaoAberta(false)}
        aoAbrirCreditos={() => setCreditosAbertos(true)}
        guiado={guiado}
        teclasBloqueadas={creditosAbertos}
      />
      <ModalCreditos aberto={creditosAbertos} aoFechar={() => setCreditosAbertos(false)} />
    </div>
  );
}
