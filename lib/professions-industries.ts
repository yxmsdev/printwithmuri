// Profession and Industry options for signup forms

export const professions = [
  'Designer',
  'Engineer',
  'Architect',
  'Artist',
  'Sculptor',
  'Product Designer',
  'Industrial Designer',
  'Game Developer',
  'Jewelry Designer',
  'Prototype Developer',
  'Hobbyist',
  'Student',
  'Educator',
  'Researcher',
  'Other',
] as const;

export const industries = [
  'Manufacturing',
  'Retail',
  'Healthcare',
  'Education',
  'Architecture',
  'Automotive',
  'Aerospace',
  'Consumer Goods',
  'Fashion',
  'Jewelry',
  'Toys & Games',
  'Medical Devices',
  'Construction',
  'Marketing/Advertising',
  'Entertainment',
  'Other',
] as const;

export type Profession = typeof professions[number];
export type Industry = typeof industries[number];
