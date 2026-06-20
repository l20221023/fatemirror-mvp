declare module "lunar-javascript" {
export class Solar {
  static fromDate(date: Date): Solar;
  static fromYmd(year: number, month: number, day: number): Solar;
  getLunar(): Lunar;
}

export class Lunar {
  getYear(): number;
  getMonth(): number;
  getDay(): number;
}
}
