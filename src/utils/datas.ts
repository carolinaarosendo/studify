const pad = (n: number) => String(n).padStart(2, '0');

// 'YYYY-MM-DD' no fuso do aparelho (toISOString() usa UTC e pode trocar o dia)
export function chaveDoDia(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function formatarData(d: Date): string {
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function formatarHora(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatarDataHora(d: Date): string {
  return `${formatarData(d)} às ${formatarHora(d)}`;
}

// passando de 'YYYY-MM-DD' para -> 'DD/MM/YYYY'
export function formatarChave(chave: string): string {
  const [ano, mes, dia] = chave.split('-');
  return `${dia}/${mes}/${ano}`;
}