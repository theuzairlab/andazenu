// Type definitions for color-namer
declare module 'color-namer' {
  interface ColorName {
    name: string;
    hex: string;
    distance: number;
  }

  interface NamerResult {
    basic: ColorName[];
    ntc: ColorName[];
    pantone: ColorName[];
    roygbiv: ColorName[];
    x11: ColorName[];
  }

  function namer(color: string): NamerResult;
  export = namer;
}
