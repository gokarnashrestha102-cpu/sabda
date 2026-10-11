export type WorldId =
  | 'love'
  | 'sad'
  | 'breakup'
  | 'life'
  | 'motivation'
  | 'loneliness'
  | 'friendship'
  | 'dreams';

export type LiteraryCategory =
  | 'shayari'
  | 'ghazal'
  | 'poem'
  | 'story'
  | 'song'
  | 'quote'
  | 'pickup'
  | 'letter';

export interface LiteraryItem {
  id: string;
  title: string;
  text: string;
  romanizedText?: string;
  englishMeaning?: string;
  author: string;
  world: WorldId;
  category: LiteraryCategory;
  subCategory: string;
  tags: string[];
  featured?: boolean;
}

export interface WorldDefinition {
  id: WorldId;
  nameNepali: string;
  nameEnglish: string;
  subtitle: string;
  signatureQuote: string;
  signatureAuthor: string;
  gradient: string;
  accentColor: string;
  ambientDescription: string;
  coreShape: 'heart' | 'moon' | 'crystal' | 'cosmos' | 'sun' | 'lone-orb' | 'dual-flame' | 'nebula';
  tags: string[];
}

export interface DailyFeelingOption {
  id: string;
  nepaliTitle: string;
  englishTitle: string;
  description: string;
  targetWorld: WorldId;
  recommendedQuoteId: string;
}

export interface UserCustomEntry {
  id: string;
  title: string;
  text: string;
  author: string;
  category: LiteraryCategory;
  world: WorldId;
  createdAt: number;
}
