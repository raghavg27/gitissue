// Links that leave GitIssue open in a new tab and pass no referrer, opener or ranking credit.
export function ExternalLink({ children, ...props }: Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "target" | "rel">) {
  return (
    <a {...props} target="_blank" rel="noopener noreferrer nofollow ugc">
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
