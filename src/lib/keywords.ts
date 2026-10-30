const STOPWORDS = new Set(
  `a about after again all also am an and any app are as at be because been before being but by can cannot
  could did do does doing done down during each even every few for from get gets getting got had has have
  having he her here hers him his how however i if in into is it its it's just like made make makes me more
  most my no nor not now of off on once only or other our out over own really same she should so some still
  such than that the their them then there these they this those though through to too under until up us
  very want was we were what when where which while who why will with would yes yet you your actually
  basically bug issue happens happened happening thing something see seems seeing tried try trying
  going goes went um uh okay ok`.split(/\s+/),
);

// Local, AI-free keyword pick for issue search and code-file ranking.
export function extractKeywords(text: string, max = 8): string[] {
  const out: string[] = [];
  for (const word of text.toLowerCase().match(/[a-z0-9][a-z0-9'_-]*/g) ?? []) {
    if (word.length < 3 || STOPWORDS.has(word) || out.includes(word)) continue;
    out.push(word);
    if (out.length === max) break;
  }
  return out;
}
