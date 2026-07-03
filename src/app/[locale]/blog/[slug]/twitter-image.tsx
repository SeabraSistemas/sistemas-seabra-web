// Reaproveita o mesmo card do opengraph-image para o twitter:image do post
// (senão o Twitter/X herda a imagem estática do layout).
export { default, alt, size, contentType, generateStaticParams } from './opengraph-image';
