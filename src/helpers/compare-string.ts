export function compare(str1: string, str2: string) {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  return s1.includes(s2);
}
