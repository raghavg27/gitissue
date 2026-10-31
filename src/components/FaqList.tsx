// Questions that open to show the answer.
export function FaqList({ items }: { items: readonly { q: string; a: string }[] }) {
  return (
    <div className="space-y-3 text-left">
      {items.map((item) => (
        <details key={item.q} className="glass group rounded-3xl px-5 py-4">
          <summary className="cursor-pointer font-medium">{item.q}</summary>
          <p className="mt-2 text-muted">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
