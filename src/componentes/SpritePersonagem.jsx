import { montarCamadas, obterNomeGenero, obterNomePeca } from "../dados/pecas";

export function SpritePersonagem({ aparencia, className = "" }) {
  const camadas = montarCamadas(aparencia);
  const descricao = `Personagem ${obterNomeGenero(aparencia.genero).toLowerCase()}, cabelo ${obterNomePeca("cabelo", aparencia.cabelo)}, roupa ${obterNomePeca("camisa", aparencia.camisa)}, calça ${obterNomePeca("calca", aparencia.calca)} e acessório ${obterNomePeca("acessorio", aparencia.acessorio)}.`;

  return (
    <div className={`sprite-personagem ${className}`} role="img" aria-label={descricao}>
      {camadas.map((camada) => (
        <img
          key={`${camada.chave}-${camada.arquivo}`}
          src={camada.arquivo}
          alt=""
          draggable="false"
          style={{ zIndex: camada.z }}
        />
      ))}
    </div>
  );
}
