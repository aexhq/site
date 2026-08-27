import Link from "next/link";
import { getLegalIdentity } from "../legal";
import { brainRepoUrl, discordUrl } from "../site-copy";

export function SiteFooter() {
  const identity = getLegalIdentity();
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <p>
          Aex is a trading name of{" "}
          <a href={identity.companiesHouseUrl}>{identity.operator}</a>, company{" "}
          {identity.companyNumber}, registered in {identity.registrationJurisdiction}.
          {" "}Registered office: {identity.registeredOffice}, {identity.country}.
        </p>
        <nav aria-label="Footer navigation">
          <Link href="/brain">Brain</Link>
          <Link href="/brain/docs">Docs</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/status">Status</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <a href="mailto:support@aex.dev">Support</a>
          <a href={brainRepoUrl}>GitHub</a>
          <a href={discordUrl}>Discord</a>
        </nav>
      </div>
    </footer>
  );
}
