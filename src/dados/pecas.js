const base = import.meta.env.BASE_URL;
const frente = `${base}assets/lpc/frente/`;
const minis = `${base}assets/lpc/miniaturas/`;

export const GENEROS = [
  { id: "masculino", nome: "Masculino" },
  { id: "feminino", nome: "Feminino" },
];

const CORPOS = {
  masculino: { chave: "corpo", arquivo: `${frente}corpo-masculino.png`, z: 10 },
  feminino: { chave: "corpo", arquivo: `${frente}corpo-feminino.png`, z: 10 },
};

const CABECAS = {
  masculino: { chave: "cabeca", arquivo: `${frente}cabeca-masculina.png`, z: 100 },
  feminino: { chave: "cabeca", arquivo: `${frente}cabeca-feminina.png`, z: 100 },
};

const ROSTOS = {
  masculino: { chave: "rosto", arquivo: `${frente}rosto-neutro.png`, z: 101 },
  feminino: { chave: "rosto", arquivo: `${frente}rosto-feminino.png`, z: 101 },
};

export const CATEGORIAS = [
  { id: "cabelo", rotulo: "Cabelo", singular: "cabelo" },
  { id: "camisa", rotulo: "Roupa", singular: "roupa" },
  { id: "calca", rotulo: "Calça", singular: "calça" },
  { id: "acessorio", rotulo: "Acessório", singular: "acessório" },
];

export const CAMPOS_ESTADO = [
  { id: "genero", rotulo: "Corpo" },
  ...CATEGORIAS,
];

const camisa = (id, nome, cor, licenca = "OGA-BY 3.0") => ({
  id,
  nome,
  licenca,
  z: 35,
  arquivos: {
    masculino: `${frente}camisa-${cor}-masculina.png`,
    feminino: `${frente}camisa-${cor}-feminina.png`,
  },
  miniaturas: {
    masculino: `${minis}min-camisa-${cor}-masculina.png`,
    feminino: `${minis}min-camisa-${cor}-feminina.png`,
  },
});

const calca = (id, nome, cor, licenca = "OGA-BY 3.0") => ({
  id,
  nome,
  licenca,
  z: 20,
  arquivos: {
    masculino: `${frente}calca-${cor}-masculina.png`,
    feminino: `${frente}calca-${cor}-feminina.png`,
  },
  miniaturas: {
    masculino: `${minis}min-calca-${cor}-masculina.png`,
    feminino: `${minis}min-calca-${cor}-feminina.png`,
  },
});

export const PECAS = {
  cabelo: [
    {
      id: "curto-castanho",
      nome: "Curto",
      detalhe: "castanho",
      licenca: "CC0",
      z: 120,
      arquivo: `${frente}cabelo-curto-castanho.png`,
      miniatura: `${minis}min-cabelo-curto-castanho.png`,
    },
    {
      id: "longo-preto",
      nome: "Longo",
      detalhe: "preto",
      licenca: "CC0",
      z: 120,
      arquivo: `${frente}cabelo-longo-preto.png`,
      miniatura: `${minis}min-cabelo-longo-preto.png`,
    },
    {
      id: "coque-loiro",
      nome: "Coque",
      detalhe: "loiro",
      licenca: "CC0",
      z: 120,
      arquivo: `${frente}cabelo-coque-loiro.png`,
      miniatura: `${minis}min-cabelo-coque-loiro.png`,
    },
    {
      id: "rabo-ruivo",
      nome: "Rabo de cavalo",
      detalhe: "ruivo",
      licenca: "OGA-BY 3.0",
      z: 120,
      arquivo: `${frente}cabelo-rabo-ruivo.png`,
      miniatura: `${minis}min-cabelo-rabo-ruivo.png`,
    },
  ],
  camisa: [
    camisa("azul", "Azul", "azul"),
    camisa("roxa", "Roxa", "roxa"),
    camisa("creme", "Creme", "creme"),
    camisa("verde", "Verde", "verde"),
  ],
  calca: [
    calca("cinza", "Cinza", "cinza"),
    calca("marrom", "Marrom", "marrom"),
    calca("verde", "Verde", "verde"),
    calca("preta", "Preta", "preta"),
  ],
  acessorio: [
    { id: "nenhum", nome: "Nenhum", licenca: "—", z: null, arquivo: null, miniatura: null },
    {
      id: "oculos",
      nome: "Óculos",
      licenca: "OGA-BY 3.0",
      z: 115,
      arquivo: `${frente}oculos.png`,
      miniatura: `${minis}min-oculos.png`,
    },
    {
      id: "faixa-verde",
      nome: "Faixa",
      licenca: "OGA-BY 3.0+",
      z: 125,
      arquivo: `${frente}faixa-verde.png`,
      miniatura: `${minis}min-faixa-verde.png`,
    },
    {
      id: "brinco",
      nome: "Brinco",
      licenca: "CC0",
      z: 115,
      arquivo: `${frente}brinco.png`,
      miniatura: `${minis}min-brinco.png`,
    },
  ],
};

export function obterPeca(categoria, pecaId) {
  return PECAS[categoria]?.find((peca) => peca.id === pecaId) ?? null;
}

export function obterNomePeca(categoria, pecaId) {
  const peca = obterPeca(categoria, pecaId);
  if (!peca) return pecaId;
  return peca.detalhe ? `${peca.nome} ${peca.detalhe}` : peca.nome;
}

export function obterCategoria(categoria) {
  return CATEGORIAS.find((item) => item.id === categoria) ?? null;
}

export function obterNomeGenero(genero) {
  return GENEROS.find((item) => item.id === genero)?.nome ?? genero;
}

export function obterMiniaturaPeca(peca, genero) {
  return peca.miniaturas ? peca.miniaturas[genero] : peca.miniatura;
}

/** Monta a pilha visual na ordem de zPos do ULPC, respeitando o corpo escolhido. */
export function montarCamadas(aparencia) {
  const genero = aparencia.genero === "feminino" ? "feminino" : "masculino";
  const camadas = [{ ...CORPOS[genero] }];
  const roupa = obterPeca("camisa", aparencia.camisa);
  const calcado = obterPeca("calca", aparencia.calca);
  const cabelo = obterPeca("cabelo", aparencia.cabelo);
  const acessorio = obterPeca("acessorio", aparencia.acessorio);

  if (calcado) {
    camadas.push({ ...calcado, chave: "calca", arquivo: calcado.arquivos[genero] });
  }
  if (roupa) {
    camadas.push({ ...roupa, chave: "camisa", arquivo: roupa.arquivos[genero] });
  }
  camadas.push({ ...CABECAS[genero] }, { ...ROSTOS[genero] });
  if (cabelo) camadas.push({ ...cabelo, chave: "cabelo" });
  if (acessorio?.arquivo) camadas.push({ ...acessorio, chave: "acessorio" });

  return camadas.sort((a, b) => a.z - b.z);
}
