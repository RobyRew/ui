export interface RefractionOptions {
  /** Elements to refract. Default every .rw-glass. */
  selector?: string;
  /** feDisplacementMap scale. Default 56. */
  scale?: number;
  /** Bezel depth in px. Default 32. */
  bezel?: number;
  /** Corner radius; defaults to each element's own border-radius. */
  radius?: number;
  root?: Document | Element;
}
/** Chromium only; elsewhere returns a no-op. Returns a function that stops the resize tracking. */
export declare function enableRefraction(opts?: RefractionOptions): () => void;
export default enableRefraction;
