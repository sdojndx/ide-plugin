export type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};
export type Partial<T> = {
  [P in keyof T]?: T[P];
};
