export const PETITION = 'Raju, please answer my question.';
export type Cell = { shown: string; secret: string; toggle: boolean };
export type Trick = { cells: Cell[]; capturing: boolean };
export const emptyTrick = (): Trick => ({ cells: [], capturing: false });
export const visible = (s: Trick) => s.cells.map(c => c.shown).join('');
export const answer = (s: Trick) => s.cells.map(c => c.secret).join('').trim();
export function insert(s: Trick, text: string): Trick {
  let cells = [...s.cells], capturing = s.capturing;
  for (const ch of text.split('')) {
    if (ch === '/') {
      capturing = !capturing;
      cells.push({ shown: PETITION[cells.length % PETITION.length], secret: '', toggle: true });
      if (!capturing && cells.length < PETITION.length) {
        while (cells.length < PETITION.length) cells.push({ shown: PETITION[cells.length], secret: '', toggle: false });
      }
    } else {
      cells.push({ shown: capturing ? PETITION[cells.length % PETITION.length] : ch, secret: capturing ? ch : '', toggle: false });
    }
  }
  return { cells, capturing };
}
export function edit(s: Trick, next: string): Trick {
  const old = visible(s);
  let start = 0;
  while (start < old.length && start < next.length && old[start] === next[start]) start++;
  let end = 0;
  while (end < old.length - start && end < next.length - start && old[old.length - 1 - end] === next[next.length - 1 - end]) end++;
  const before = s.cells.slice(0, start), after = end ? s.cells.slice(old.length - end) : [];
  const capturing = before.filter(c => c.toggle).length % 2 === 1;
  const inserted = insert({ cells: before, capturing }, next.slice(start, next.length - end));
  const cells = [...inserted.cells, ...after];
  return { cells, capturing: cells.filter(c => c.toggle).length % 2 === 1 };
}
