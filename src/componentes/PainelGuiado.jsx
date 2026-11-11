import { GRUPOS_ROTEIRO } from "../interface/roteiro";
import { obterNomePeca } from "../dados/pecas";

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14m-5-5 5 5-5 5" />
    </svg>
  );
}

export function PainelGuiado({
  passoAtual,
  indice,
  totalPassos,
  concluido,
  avancar,
  reiniciar,
  aparencia,
  erro,
}) {
  if (!passoAtual) return null;

  const grupo = GRUPOS_ROTEIRO[passoAtual.grupoIndice];
  const etapaVisivel = concluido ? totalPassos : Math.min(indice + 1, totalPassos);
  const fecho = [
    `Cabelo ${obterNomePeca("cabelo", aparencia.cabelo).toLowerCase()}`,
    `camisa ${obterNomePeca("camisa", aparencia.camisa).toLowerCase()}`,
    `calça ${obterNomePeca("calca", aparencia.calca).toLowerCase()}`,
  ].join(", ");

  return (
    <aside className="panel panel-guide" aria-labelledby="titulo-guiado">
      <header className="guide-head">
        <div>
          <p className="eyebrow">Roteiro guiado</p>
          <h2 id="titulo-guiado">
            Etapa <strong>{etapaVisivel}</strong> <span>de {totalPassos}</span>
          </h2>
        </div>
        <button type="button" className="plain-button" onClick={reiniciar}>
          Reiniciar
        </button>
      </header>

      <div className="progress" aria-label={`Etapa ${etapaVisivel} de ${totalPassos}`}>
        <div className="progress-track" aria-hidden="true">
          <span
            className="progress-fill"
            style={{ width: `${(etapaVisivel / totalPassos) * 100}%` }}
          />
        </div>
        <div className="progress-caption">
          <span>
            {grupo.rotulo} · {grupo.detalhe}
          </span>
          <span>
            {passoAtual.numeroNoGrupo} de {passoAtual.totalNoGrupo}
          </span>
        </div>
      </div>

      <h3 className="step-title">{passoAtual.titulo}</h3>

      <figure className="code-hero">
        <figcaption className="code-head">
          <span className="code-file">{passoAtual.arquivo}</span>
          <span className="code-method">{passoAtual.metodo}</span>
        </figcaption>
        <div className="code-body">
          {passoAtual.codigo.map((linha, numero) => (
            <div
              className={`code-line ${passoAtual.destaque.includes(numero) ? "is-on" : ""}`}
              key={`${passoAtual.id}-${numero}`}
            >
              <i aria-hidden="true">{numero + 1}</i>
              <code>{linha}</code>
            </div>
          ))}
        </div>
      </figure>

      <p className="step-fala">{passoAtual.fala}</p>

      {erro && <p className="step-error">{erro}</p>}

      <div className="guide-actions">
        {concluido ? (
          <div className="guide-done" role="status">
            <strong>Fim do roteiro</strong>
            <p>{fecho}. O refazer ficou vazio.</p>
          </div>
        ) : (
          <>
            <button type="button" className="next-button" onClick={avancar} autoFocus>
              Próxima etapa
              <ArrowIcon />
            </button>
            <p className="guide-hint">Espaço ou → também avança</p>
          </>
        )}
      </div>
    </aside>
  );
}
