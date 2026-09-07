interface AnimeSynopsisProps {
  text: string;
}

export default function AnimeSynopsis({ text }: AnimeSynopsisProps) {
  return (
    <section className="space-y-3" aria-labelledby="synopsis-heading">
      <h2
        id="synopsis-heading"
        className="font-display text-2xl font-semibold tracking-tight text-ink"
      >
        Synopsis
      </h2>
      <p className="max-w-3xl whitespace-pre-line text-base leading-relaxed text-ink-muted">
        {text}
      </p>
    </section>
  );
}
