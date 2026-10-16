import { Bullets, PublicPage, PublicSection } from "~/components/public";
import { publicPageMeta } from "~/lib/meta";

export const meta = () => publicPageMeta("/community-guidelines");

export default function CommunityGuidelinesRoute() {
  return (
    <PublicPage
      path="/community-guidelines"
      lede="Draft guidelines for introductions and conversations on ConnectAbroad. They may change before they are approved."
    >
      <PublicSection title="Introduce yourself respectfully and specifically">
        <Bullets
          items={[
            "Say what you share and ask one clear question.",
            "Accept a decline or no answer, and don't send repeated requests.",
            "Keep conversations kind, even when you disagree.",
          ]}
        />
      </PublicSection>

      <PublicSection title="No spam, scams or impersonation">
        <Bullets
          items={[
            "Don't advertise services, ask for money or recruit people into paid schemes.",
            "Don't pretend to be someone else or to represent an organisation you don't.",
            "Don't send the same message to many people.",
          ]}
        />
      </PublicSection>

      <PublicSection title="Keep personal information private">
        <Bullets
          items={[
            "Don't ask for or share passport numbers, visa documents, bank details, exact addresses or phone numbers.",
            "Don't share someone else's details or messages without their permission.",
            "Move to another app only when you're comfortable, and never because you feel pressured.",
          ]}
        />
      </PublicSection>

      <PublicSection title="Peer experience is not professional advice">
        <p>
          Share what happened to you and say when it might be out of date. For visas, immigration, legal, financial or
          medical questions, point people to official sources or a qualified professional.
        </p>
      </PublicSection>

      <PublicSection title="Report and block">
        <p>
          If someone breaks these guidelines, report them from their profile or report a specific message from your
          conversation. To stop contact, block them as well; blocking stops new requests and messages and removes you
          from each other's search. Reporting and blocking are separate, and each confirms its own result.
        </p>
      </PublicSection>
    </PublicPage>
  );
}
