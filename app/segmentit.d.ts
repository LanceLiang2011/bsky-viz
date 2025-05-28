declare module "segmentit" {
  export class Segment {
    constructor();
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function useDefault(segment: Segment): any;
}
