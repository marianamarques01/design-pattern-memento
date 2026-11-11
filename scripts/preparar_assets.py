#!/usr/bin/env python3
"""Recorta o frame frontal do idle, recolore e gera miniaturas.

Layout confirmado nos assets originais (todos com 128x256 px):
- 2 colunas x 4 linhas de frames de 64x64;
- linhas = up, left, down, right;
- frame frontal = linha "down" (índice 2), primeira coluna.
"""
from pathlib import Path
from PIL import Image
import json

RAIZ = Path(__file__).resolve().parent.parent
ORIGINAIS = RAIZ / "public/assets/lpc/originais"
FRENTE = RAIZ / "public/assets/lpc/frente"
MINIATURAS = RAIZ / "public/assets/lpc/miniaturas"
FRAME = (0, 128, 64, 192)

CORES = json.loads((RAIZ / "scripts/paletas_ulpc.json").read_text())
BRANCO = ["#281820", "#4D4A5D", "#958080", "#C4B59F", "#E5E6C7", "#FFFFFF"]
LARANJA = ["#260D14", "#6A1108", "#A42600", "#BF4000", "#E55600", "#FF8A00"]


def carregar(nome):
    imagem = Image.open(ORIGINAIS / nome).convert("RGBA")
    if imagem.size != (128, 256):
        raise ValueError(f"{nome}: esperava 128x256, veio {imagem.size}")
    return imagem.crop(FRAME)


def recolorir(imagem, origem, destino, tolerancia=1):
    pares = []
    for de, para in zip(origem, destino):
        de_rgb = tuple(int(de[i : i + 2], 16) for i in (1, 3, 5))
        para_rgb = tuple(int(para[i : i + 2], 16) for i in (1, 3, 5))
        pares.append((de_rgb, para_rgb))

    resultado = imagem.copy()
    pixels = resultado.load()
    for y in range(resultado.height):
        for x in range(resultado.width):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            for de, para in pares:
                if (
                    abs(r - de[0]) <= tolerancia
                    and abs(g - de[1]) <= tolerancia
                    and abs(b - de[2]) <= tolerancia
                ):
                    pixels[x, y] = (*para, a)
                    break
    return resultado


def remover_ilhas(imagem, minimo=6):
    """Remove componentes de alfa muito pequenos (ruído de recorte)."""
    resultado = imagem.copy()
    pixels = resultado.load()
    largura, altura = resultado.size
    vistos = set()
    for y in range(altura):
        for x in range(largura):
            if pixels[x, y][3] == 0 or (x, y) in vistos:
                continue
            fila = [(x, y)]
            vistos.add((x, y))
            componente = []
            while fila:
                cx, cy = fila.pop()
                componente.append((cx, cy))
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = cx + dx, cy + dy
                    if 0 <= nx < largura and 0 <= ny < altura and (nx, ny) not in vistos and pixels[nx, ny][3] > 0:
                        vistos.add((nx, ny))
                        fila.append((nx, ny))
            if len(componente) < minimo:
                for px, py in componente:
                    pixels[px, py] = (0, 0, 0, 0)
    return resultado


def salvar(imagem, pasta, nome):
    pasta.mkdir(parents=True, exist_ok=True)
    imagem.save(pasta / nome)


def salvar_com_miniatura(imagem, nome):
    salvar(imagem, FRENTE, f"{nome}.png")
    caixa = imagem.getbbox()
    if caixa:
        recorte = imagem.crop(caixa)
        margem = 5
        miniatura = Image.new(
            "RGBA",
            (recorte.width + margem * 2, recorte.height + margem * 2),
            (0, 0, 0, 0),
        )
        miniatura.alpha_composite(recorte, (margem, margem))
        salvar(miniatura, MINIATURAS, f"min-{nome}.png")


def main():
    FRENTE.mkdir(parents=True, exist_ok=True)
    MINIATURAS.mkdir(parents=True, exist_ok=True)

    corpos = {
        "masculino": carregar("corpo-masculino-idle.png"),
        "feminino": carregar("corpo-feminino-idle.png"),
    }
    cabecas = {
        "masculino": carregar("cabeca-humana-masculina-idle.png"),
        "feminino": carregar("cabeca-humana-feminina-idle.png"),
    }
    rostos = {
        "masculino": carregar("rosto-neutro-idle.png"),
        "feminino": carregar("rosto-feminino-neutro-idle.png"),
    }
    camisas = {
        "masculino": carregar("camisa-tshirt-idle.png"),
        "feminino": carregar("camisa-tshirt-feminina-idle.png"),
    }
    calcas = {
        "masculino": carregar("calca-pants-idle.png"),
        "feminino": carregar("calca-pants-thin-idle.png"),
    }

    salvar(corpos["masculino"], FRENTE, "corpo-masculino.png")
    salvar(corpos["feminino"], FRENTE, "corpo-feminino.png")
    salvar(cabecas["masculino"], FRENTE, "cabeca-masculina.png")
    salvar(cabecas["feminino"], FRENTE, "cabeca-feminina.png")
    salvar(rostos["masculino"], FRENTE, "rosto-neutro.png")
    salvar(rostos["feminino"], FRENTE, "rosto-feminino.png")

    # Cabelos (as mesmas imagens servem aos dois corpos).
    cabelos = {
        "cabelo-curto-castanho": (carregar("cabelo-curto-flat-top-idle.png"), CORES["hair"]["chestnut"]),
        "cabelo-longo-preto": (remover_ilhas(carregar("cabelo-longo-straight-idle.png")), CORES["hair"]["black"]),
        "cabelo-coque-loiro": (carregar("cabelo-coque-bangs-bun-idle.png"), CORES["hair"]["blonde"]),
        "cabelo-rabo-ruivo": (carregar("cabelo-rabo-cavalo-idle.png"), CORES["hair"]["redhead"]),
    }
    for nome, (imagem, destino) in cabelos.items():
        salvar_com_miniatura(recolorir(imagem, LARANJA, destino), nome)

    # Camisas por gênero.
    for genero, base in camisas.items():
        sufixo = "feminina" if genero == "feminino" else "masculina"
        for cor, paleta in (("azul", "blue"), ("roxa", "purple"), ("verde", "green")):
            salvar_com_miniatura(
                recolorir(base, BRANCO, CORES["cloth"][paleta]),
                f"camisa-{cor}-{sufixo}",
            )
        salvar_com_miniatura(base.copy(), f"camisa-creme-{sufixo}")

    # Calças por gênero.
    for genero, base in calcas.items():
        sufixo = "feminina" if genero == "feminino" else "masculina"
        for cor, paleta in (("cinza", "gray"), ("marrom", "brown"), ("verde", "green"), ("preta", "black")):
            salvar_com_miniatura(
                recolorir(base, BRANCO, CORES["cloth"][paleta]),
                f"calca-{cor}-{sufixo}",
            )

    # Acessórios.
    salvar_com_miniatura(carregar("oculos-glasses-idle.png"), "oculos")
    salvar_com_miniatura(
        recolorir(carregar("faixa-headband-idle.png"), BRANCO, CORES["cloth"]["green"]),
        "faixa-verde",
    )
    salvar_com_miniatura(carregar("brinco-simples-idle.png"), "brinco")


if __name__ == "__main__":
    main()
