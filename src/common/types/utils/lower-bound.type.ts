/** type T if T implements B and B is a lower bound of T (B extends T) */
export type LowerBound<T extends B, B> = { [K in keyof B]: B[K] extends T[K] ? unknown : never };
