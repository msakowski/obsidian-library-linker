function padNumber(number: number, length = 3): string {
  return number.toString().padStart(length, '0');
}

export function padBook(number: number): string {
  return padNumber(number, 2);
}

export function padChapter(number: number): string {
  return padNumber(number, 3);
}

export function padVerse(number: number): string {
  return padNumber(number, 3);
}
