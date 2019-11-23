export type Pt = [number, number];
// This accepts a single number, though?!

export interface Node {
  id: string;
  links: Array<string>;
  bones: Array<any>;
  pt: Pt;
}

export type NodeMap = Record<string, Node>;

export interface Trainline {
  id: string;
  nodes: Array<Node>;
  start: Pt;
  end: Pt;
  color: string;
}
