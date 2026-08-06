// FAQ da página /vendas/produtos (microchips + leitores RFID).
// Conteúdo por locale — renderizado de forma visível E usado no FAQPage JSON-LD
// (o schema precisa refletir o texto visível na página).

export interface FaqItem {
  q: string;
  a: string;
}

export interface Faq {
  title: string;
  items: FaqItem[];
}

export const produtosFaq: Record<'pt' | 'es' | 'en', Faq> = {
  pt: {
    title: 'Perguntas frequentes',
    items: [
      {
        q: 'Qual a diferença entre microchip e brinco eletrônico?',
        a: 'O microchip é aplicado sob a pele (implante): é permanente, não cai e não pode ser violado. O brinco eletrônico fica na orelha, é visível de longe, mas pode cair ou ser trocado. Os dois usam RFID.',
      },
      {
        q: 'O microchip é certificado?',
        a: 'Sim. É certificado ICAR, no padrão ISO 11784/11785 (FDX-B), frequência 134,2 kHz — reconhecido internacionalmente.',
      },
      {
        q: 'Preciso de um leitor para usar o microchip?',
        a: 'Sim. O leitor faz a leitura do chip sem digitar. Temos leitor com tela própria, leitor com Bluetooth (envia para o celular/app) e leitor bastão de longo alcance.',
      },
      {
        q: 'Qual é a quantidade mínima de compra?',
        a: 'O pedido mínimo do microchip é de 10 unidades, e o preço por unidade cai conforme a quantidade.',
      },
      {
        q: 'Serve para caprinos, ovinos e bovinos?',
        a: 'Sim. Microchips e leitores servem para identificação eletrônica e rastreabilidade de caprinos, ovinos e bovinos.',
      },
    ],
  },
  es: {
    title: 'Preguntas frecuentes',
    items: [
      {
        q: '¿Cuál es la diferencia entre microchip y crotal (arete) electrónico?',
        a: 'El microchip se aplica bajo la piel (implante): es permanente, no se cae y no se puede manipular. El crotal electrónico va en la oreja, se ve de lejos, pero puede caerse o cambiarse. Ambos usan RFID.',
      },
      {
        q: '¿El microchip está certificado?',
        a: 'Sí. Está certificado ICAR, en el estándar ISO 11784/11785 (FDX-B), frecuencia 134,2 kHz — reconocido internacionalmente.',
      },
      {
        q: '¿Necesito un lector para usar el microchip?',
        a: 'Sí. El lector lee el chip sin teclear. Tenemos lector con pantalla propia, lector con Bluetooth (envía al teléfono/app) y lector tipo bastón de largo alcance.',
      },
      {
        q: '¿Cuál es la cantidad mínima de compra?',
        a: 'El pedido mínimo del microchip es de 10 unidades, y el precio por unidad baja según la cantidad.',
      },
      {
        q: '¿Sirve para caprinos, ovinos y bovinos?',
        a: 'Sí. Los microchips y lectores sirven para identificación electrónica y trazabilidad de caprinos, ovinos y bovinos.',
      },
    ],
  },
  en: {
    title: 'Frequently asked questions',
    items: [
      {
        q: 'What is the difference between a microchip and an electronic ear tag?',
        a: 'The microchip is implanted under the skin: it is permanent, cannot fall off and cannot be tampered with. The electronic ear tag sits on the ear and is visible from a distance, but it can fall off or be swapped. Both use RFID.',
      },
      {
        q: 'Is the microchip certified?',
        a: 'Yes. It is ICAR-certified, ISO 11784/11785 (FDX-B) standard, 134.2 kHz frequency — internationally recognized.',
      },
      {
        q: 'Do I need a reader to use the microchip?',
        a: 'Yes. The reader reads the chip with no typing. We offer a reader with its own screen, a Bluetooth reader (sends to phone/app) and a long-range stick reader.',
      },
      {
        q: 'What is the minimum order quantity?',
        a: 'The minimum microchip order is 10 units, and the per-unit price drops with quantity.',
      },
      {
        q: 'Does it work for goats, sheep and cattle?',
        a: 'Yes. Microchips and readers work for electronic ID and traceability of goats, sheep and cattle.',
      },
    ],
  },
};
