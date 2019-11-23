export type Pt = [number, number];

export interface Node {
  id: string;
  links: Array<string>;
  bones: Array<any>;
  pt: Pt;
}
