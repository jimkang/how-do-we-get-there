export type Pt = [number, number];
// This accepts a single number, though?!

export interface Node {
  id: string;
  links: Array<string>;
  bones: Array<any>;
  pt: Pt;
  trainLineMap: Record<string, TrainLine>;
}

export interface Color {
  h: number;
  s: number;
  l: number;
  name: string;
  string: string;
}

export type NodeMap = Record<string, Node>;

export interface TrainLine {
  id: string;
  nodes: Array<Node>;
  color: Color;
  complete: boolean;
  obsolete: boolean;
}
