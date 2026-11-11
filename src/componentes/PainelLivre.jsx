import { useState } from "react";
import {
  CATEGORIAS,
  GENEROS,
  PECAS,
  obterMiniaturaPeca,
  obterNomePeca,
} from "../dados/pecas";

function NenhumIcone() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="none-icon">
      <circle cx="12" cy="12" r="7.5" />
      <path d="m7 17 10-10" />
    </svg>
  );
}

export function PainelLivre({
  aparencia,
  trocar,
  trocarGenero,
}) {
  const [categoriaAtiva, setCategoriaAtiva] = useState("cabelo");
  const categoria = CATEGORIAS.find((item) => item.id === categoriaAtiva);
  const opcoes = PECAS[categoriaAtiva];
  return (
    <section className="customizer" aria-labelledby="titulo-personalizacao">
      <div className="body-picker">
        <span>Corpo</span>
        <div className="body-options" role="group" aria-label="Escolher corpo">
          {GENEROS.map((genero) => (
            <button
              key={genero.id}
              type="button"
              className={aparencia.genero === genero.id ? "is-active" : ""}
              aria-pressed={aparencia.genero === genero.id}
              onClick={() => trocarGenero(genero.id)}
            >
              {genero.nome}
            </button>
          ))}
        </div>
      </div>

      <div className="customizer-tabs" role="tablist" aria-label="Categorias de peças">
        {CATEGORIAS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={categoriaAtiva === item.id}
            className={categoriaAtiva === item.id ? "is-active" : ""}
            onClick={() => setCategoriaAtiva(item.id)}
          >
            {item.rotulo}
          </button>
        ))}
      </div>

      <div className="piece-grid" role="tabpanel" aria-label={categoria.rotulo}>
        {opcoes.map((peca) => {
          const selecionada = aparencia[categoriaAtiva] === peca.id;
          const miniatura = obterMiniaturaPeca(peca, aparencia.genero);
          return (
            <button
              key={peca.id}
              type="button"
              className={`piece-option ${selecionada ? "is-selected" : ""}`}
              aria-pressed={selecionada}
              onClick={() => trocar(categoriaAtiva, peca.id)}
            >
              <span className="piece-image">
                {miniatura ? (
                  <img src={miniatura} alt="" draggable="false" />
                ) : (
                  <NenhumIcone />
                )}
              </span>
              <span className="piece-name">{peca.nome}</span>
            </button>
          );
        })}
      </div>

      <p className="selection-caption">
        Selecionado: <strong>{obterNomePeca(categoriaAtiva, aparencia[categoriaAtiva])}</strong>
      </p>

    </section>
  );
}
