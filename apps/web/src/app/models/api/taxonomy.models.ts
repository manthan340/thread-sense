export enum Category {
  TOPS = 'tops',
  BOTTOMS = 'bottoms',
  DRESSES = 'dresses',
  OUTERWEAR = 'outerwear',
  SHOES = 'shoes',
  ACCESSORIES = 'accessories',
  BAGS = 'bags',
  ACTIVEWEAR = 'activewear',
}

export enum Color {
  BLACK = 'black',
  WHITE = 'white',
  GRAY = 'gray',
  NAVY = 'navy',
  BLUE = 'blue',
  GREEN = 'green',
  RED = 'red',
  PINK = 'pink',
  YELLOW = 'yellow',
  ORANGE = 'orange',
  BROWN = 'brown',
  BEIGE = 'beige',
  PURPLE = 'purple',
  MULTICOLOR = 'multicolor',
}

export enum Season {
  SPRING = 'spring',
  SUMMER = 'summer',
  FALL = 'fall',
  WINTER = 'winter',
  ALL_SEASON = 'all_season',
}

export enum Occasion {
  CASUAL = 'casual',
  WORK = 'work',
  FORMAL = 'formal',
  PARTY = 'party',
  DATE = 'date',
  TRAVEL = 'travel',
  SPORT = 'sport',
}

export enum Style {
  MINIMAL = 'minimal',
  CLASSIC = 'classic',
  STREETWEAR = 'streetwear',
  BOHO = 'boho',
  PREPPY = 'preppy',
  ATHLEISURE = 'athleisure',
  VINTAGE = 'vintage',
}

export enum Material {
  COTTON = 'cotton',
  LINEN = 'linen',
  WOOL = 'wool',
  SILK = 'silk',
  DENIM = 'denim',
  LEATHER = 'leather',
  SYNTHETIC = 'synthetic',
  KNIT = 'knit',
}

export enum Pattern {
  SOLID = 'solid',
  STRIPED = 'striped',
  CHECKED = 'checked',
  FLORAL = 'floral',
  PRINTED = 'printed',
  GRAPHIC = 'graphic',
  OTHER = 'other',
}

export enum Formality {
  VERY_CASUAL = 'very_casual',
  CASUAL = 'casual',
  SMART_CASUAL = 'smart_casual',
  BUSINESS = 'business',
  FORMAL = 'formal',
}

export interface TaxonomiesResponseDto {
  category: string[];
  color: string[];
  season: string[];
  occasion: string[];
  style: string[];
  material: string[];
  pattern: string[];
  formality: string[];
}
