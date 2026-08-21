import Link from "next/link";
import { getLegalIdentity } from "../legal";

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
          <Link href="/docs">Docs</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/status">Status</Link>
          <a href="mailto:support@aex.dev">Support</a>
          <a href="https://github.com/aexhq/aex">GitHub</a>
          <a href="https://discord.gg/Qk2YnHMHVb">Discord</a>
        </nav>
      </div>
    </footer>
  );
}
