const NAME_KEY = 'scrum-poker:name';

export function getRememberedName(): string | null {
  return localStorage.getItem(NAME_KEY);
}

export function rememberName(name: string): void {
  localStorage.setItem(NAME_KEY, name);
}
