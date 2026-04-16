import { SeoHead } from '@components/features/SeoHead';
import { homePage } from '@data/pages';
import { Compressor } from '@features/compressor';

export default function Home() {
  return (
    <>
      <SeoHead />

      <section className="mx-auto mt-24 max-w-3xl px-6 pb-10 text-center">
        <p className="text-accent-text font-mono text-xs tracking-[0.2em] uppercase md:text-sm">
          {homePage.tagline}
        </p>
        <h1 className="text-fg mt-3 text-3xl font-medium tracking-tight md:text-5xl">
          {homePage.headline}
        </h1>
        <p className="text-muted mx-auto mt-4 max-w-xl text-sm leading-relaxed md:text-base">
          {homePage.subline.split('\n').map((line, i) => (
            <span key={i}>
              {i > 0 && <br />}
              {line}
            </span>
          ))}
        </p>
        <div className="bg-accent mx-auto mt-8 h-px w-16" />
      </section>

      <Compressor />
    </>
  );
}
