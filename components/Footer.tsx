import Image from "next/image";
import Link from "next/link";

function Footer() {
  return (
    <footer className="mt-8 border-t border-white/10 bg-surface">
      <div className="page-shell flex flex-wrap items-center justify-between gap-4 py-6">
      <p className="text-sm font-medium text-ink-muted">
        © {new Date().getFullYear()} Anime Vault
      </p>
      <Link
        href="/"
        className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <Image
          src="/logo.svg"
          alt="Anime Vault"
          width={47}
          height={44}
          className="object-contain"
        />
      </Link>
      <div className="flex items-center gap-5">
        <a
          href="https://www.tiktok.com"
          target="_blank"
          rel="noreferrer"
          aria-label="TikTok"
          className="opacity-60 transition hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Image src="/tiktok.svg" alt="" width={19} height={19} />
        </a>
        <a
          href="https://www.instagram.com"
          target="_blank"
          rel="noreferrer"
          aria-label="Instagram"
          className="opacity-60 transition hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Image src="/instagram.svg" alt="" width={19} height={19} />
        </a>
        <a
          href="https://twitter.com"
          target="_blank"
          rel="noreferrer"
          aria-label="Twitter"
          className="opacity-60 transition hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Image src="/twitter.svg" alt="" width={19} height={19} />
        </a>
      </div>
      </div>
    </footer>
  );
}

export default Footer;
