import { PolicyPage } from "~/components/public";
import { publicPageMeta } from "~/lib/meta";

export const meta = () => publicPageMeta("/privacy");

export default function PrivacyRoute() {
  return (
    <PolicyPage
      path="/privacy"
      sections={[
        "Who is responsible for your information",
        "Information we collect",
        "How we use information",
        "Who can see your information",
        "How long information is kept",
        "Your choices and rights",
        "How information is protected",
        "Cookies and similar technologies",
        "Changes to this policy",
        "How to contact us",
      ]}
    />
  );
}
