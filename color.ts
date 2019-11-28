import { Color } from './types';
var { hsl } = require('d3-color');

function makeColor({
  name,
  h,
  s,
  l
}: {
  name: string;
  h: number;
  s: number;
  l: number;
}): Color {
  return {
    name,
    h,
    s,
    l,
    string: formatColorToString(h, s, l)
  };
}

function colorToD3Color(color: Color) {
  return hsl(color.h, color.s, color.l);
}

function modify(color: Color, d3Method: string) {
  var modified = colorToD3Color(color)[d3Method](1);
  color.h = modified.h;
  color.s = modified.s;
  color.l = modified.l;
  color.string = formatColorToString(color.h, color.s, color.l);
  return color;
}

function lighten(color: Color) {
  return modify(color, 'brighter');
}

function darken(color: Color) {
  return modify(color, 'darker');
}

function formatColorToString(h: number, s: number, l: number): string {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

module.exports = {
  colorToD3Color,
  lighten,
  darken,
  formatColorToString,
  makeColor
};
