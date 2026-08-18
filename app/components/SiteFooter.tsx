export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <a className="wordmark footer-wordmark" href="/" aria-label="aex home">
          aex<span>.</span>
        </a>
        <p>Agent sessions, kept alive.</p>
        <div>
          <a href="https://github.com/aexhq" rel="noreferrer" target="_blank">
            GitHub <span aria-hidden="true">↗</span>
          </a>
          <a href="https://api-dev.aex.dev/v1/rates" rel="noreferrer" target="_blank">
            Rate card <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
