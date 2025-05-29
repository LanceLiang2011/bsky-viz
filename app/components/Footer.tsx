export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t">
      <div className="container mx-auto px-4 py-3">
        <p className="text-xs text-muted-foreground text-center">
          © {currentYear} Created by{" "}
          <a
            href="https://bsky.app/profile/lanceliang.bsky.social"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Lance
          </a>
        </p>
      </div>
    </footer>
  );
}
