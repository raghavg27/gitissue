// Readable long text for the privacy policy and terms.
export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4 leading-relaxed text-muted [&_a]:text-ink [&_a]:underline [&_a]:underline-offset-4 [&_h2]:pt-4 [&_h2]:text-xl [&_h2]:font-medium [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-ink [&_table]:w-full [&_td]:border-t [&_td]:border-line [&_td]:py-2 [&_td]:pr-3 [&_td]:align-top [&_th]:pb-2 [&_th]:pr-3 [&_th]:text-left [&_th]:text-ink">
      {children}
    </div>
  );
}
