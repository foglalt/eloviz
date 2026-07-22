import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <><a className="skip-link" href="#tartalom">Ugrás a tartalomhoz</a><SiteHeader /><main className="site-main" id="tartalom">{children}</main><SiteFooter /></>;
}
