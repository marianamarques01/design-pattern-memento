import { useEffect } from "react";
import { CREDITOS, FONTES } from "../dados/creditos";

function Fechar() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

export function ModalCreditos({ aberto, aoFechar }) {
  useEffect(() => {
    if (!aberto) return undefined;
    const aoTeclar = (evento) => {
      if (evento.key === "Escape") aoFechar();
    };
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [aberto, aoFechar]);

  if (!aberto) return null;

  return (
    <div className="creditos-fundo" role="presentation" onMouseDown={(e) => {
      if (e.target === e.currentTarget) aoFechar();
    }}>
      <div className="creditos" role="dialog" aria-modal="true" aria-labelledby="creditos-titulo">
        <header className="creditos-topo">
          <div>
            <p className="kicker">UNIVERSAL LPC · LICENÇAS</p>
            <h2 id="creditos-titulo">Créditos e atribuições</h2>
          </div>
          <button type="button" className="fechar" onClick={aoFechar} aria-label="Fechar créditos">
            <Fechar />
          </button>
        </header>

        <div className="creditos-corpo">
          <p className="creditos-intro">
            Os sprites foram baixados do Universal LPC e recortados localmente. As licenças
            variam por peça: esta aplicação usa <strong>CC0</strong> e{" "}
            <strong>OGA-BY 3.0 / 3.0+</strong>, conforme indicado em cada linha. A escolha de
            uma licença disponível não altera a autoria original.
          </p>

          <div className="creditos-lista">
            {CREDITOS.map((credito) => (
              <article className="credito" key={credito.nome}>
                <div className="credito-cabecalho">
                  <h3>{credito.nome}</h3>
                  <span className="licenca-pill">{credito.licenca}</span>
                </div>
                <dl>
                  <div>
                    <dt>Autoria</dt>
                    <dd>{credito.autores.join(", ")}</dd>
                  </div>
                  <div>
                    <dt>Arquivo-fonte</dt>
                    <dd>
                      <code>spritesheets/{credito.arquivoFonte}</code>
                    </dd>
                  </div>
                  <div>
                    <dt>Licenças do arquivo original</dt>
                    <dd>{credito.licencasOriginais}</dd>
                  </div>
                  <div>
                    <dt>Modificação</dt>
                    <dd>
                      Recorte do frame frontal do idle (64×64) e recolorização com as paletas
                      ULPC. O arquivo original completo está em{" "}
                      <code>public/assets/lpc/originais/</code>.
                    </dd>
                  </div>
                  <div>
                    <dt>Fontes</dt>
                    <dd className="credito-links">
                      {credito.urls.map((url) => (
                        <a key={url} href={url} target="_blank" rel="noreferrer">
                          {new URL(url).hostname}
                        </a>
                      ))}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>

          <section className="creditos-fontes">
            <h3>Fontes tipográficas</h3>
            <p>
              Archivo e IBM Plex Mono são distribuídas sob SIL Open Font License 1.1.
              Os pacotes locais preservam seus avisos de licença.
            </p>
            <ul>
              {FONTES.map((fonte) => (
                <li key={fonte.nome}>
                  <strong>{fonte.nome}</strong> · {fonte.autores} · {fonte.licenca} ·{" "}
                  <a href={fonte.url} target="_blank" rel="noreferrer">
                    fonte
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section className="creditos-fontes">
            <h3>Textos de licença</h3>
            <p>
              <a href="/licencas/OGA-BY-3.0.txt" target="_blank" rel="noreferrer">
                OGA-BY 3.0 (texto completo)
              </a>{" "}
              ·{" "}
              <a href="/licencas/CC0-1.0.txt" target="_blank" rel="noreferrer">
                CC0 1.0 (texto completo)
              </a>{" "}
              ·{" "}
              <a href="/licencas/OFL-Archivo.txt" target="_blank" rel="noreferrer">
                OFL Archivo
              </a>{" "}
              ·{" "}
              <a href="/licencas/OFL-IBM-Plex-Mono.txt" target="_blank" rel="noreferrer">
                OFL IBM Plex Mono
              </a>
              . Projeto e código: MIT. O código do Universal LPC não foi incorporado.
            </p>
          </section>

          <p className="creditos-rodape">
            Universal LPC Character Generator:{" "}
            <a
              href="https://liberatedpixelcup.github.io/Universal-LPC-Spritesheet-Character-Generator/"
              target="_blank"
              rel="noreferrer"
            >
              liberatedpixelcup.github.io
            </a>
            . Consulte também o CREDITS.csv oficial.
          </p>
        </div>
      </div>
    </div>
  );
}
