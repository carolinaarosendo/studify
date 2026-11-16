
const palavrasMinusculas = new Set([
  'de',
  'da',
  'do',
  'das',
  'dos',
  'e',
]);

export function formatarTexto(valor: string): string {
  return valor
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('pt-BR')
    .split(' ')
    .map((palavra, indice) => {
      if (indice > 0 && palavrasMinusculas.has(palavra)) {
        return palavra;
      }

      return palavra.charAt(0).toLocaleUpperCase('pt-BR') + palavra.slice(1);
    })
    .join(' ');
}

export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}
