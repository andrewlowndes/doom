export interface BlockMap {
  header: {
    x: number;
    y: number;
    columns: number;
    rows: number;
  },
  blocks: Array<Array<number>>;
}
