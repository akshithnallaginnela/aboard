import { PolicyPage } from "~/components/public";
import { publicPageMeta } from "~/lib/meta";

export const meta = () => publicPageMeta("/terms");

export default function TermsRoute() {
  return (
    <PolicyPage
      path="/terms"
      sections={[
        "Who can use ConnectAbroad",
        "Your account",
        "Community conduct",
        "Content you share",
        "Safety, reporting and blocking",
        "Peer experience is not professional advice",
        "Suspension and account closure",
        "Limits of liability",
        "Changes to these terms",
        "How to contact us",
      ]}
    />
  );
}
