"""Motor do Laboratório de Modelos da Central de Melhoramento Seabra.

Implementa, com numpy e a biblioteca padrão, os modelos documentados nos quatro relatórios da série
(bovinos de corte, bovinos leiteiros, caprinos leiteiros e ovinos leiteiros, em reports/), para
testá-los antes de levá-los ao SeabraApp.

Módulos:
    parentesco      matriz A, F, A⁻¹ (Henderson + Quaas), A* com grupos de pais desconhecidos,
                    F de acasalamentos, Ne e ΔF
    blup            MME do modelo animal, direto-materno, multicaracterística e de touro; Gauss-Seidel;
                    PEV, confiabilidade, acurácia, acurácia BIF, DEP/PTA e Possible Change
    lactacao        TIM/Fleischmann (TMY e TMM), Wood, Wilmink, FCM, ECM e ECS
    confiabilidade  REL = DE/(DE + k), filhas-equivalentes, Daetwyler e conversões de escala
    indices         Smith-Hazel, índice econômico, probabilidade de superar, MPPA e índice da fêmea
    taxas           intervalos de Wald, Wilson e exato, tamanho amostral, CUSUM e o núcleo numérico
    ganho           intensidade de seleção, equação do criador, vias de seleção e DPR
    rebanho         pipeline de exemplo para um rebanho pequeno de cabras (CSV fictício)

As variâncias vêm sempre da literatura; o pacote ranqueia dentro do rebanho e não substitui uma
avaliação nacional. Ver README.md.
"""

__version__ = "0.1.0"

from . import blup, confiabilidade, ganho, indices, lactacao, parentesco, taxas  # noqa: F401

__all__ = ["blup", "confiabilidade", "ganho", "indices", "lactacao", "parentesco", "taxas"]
