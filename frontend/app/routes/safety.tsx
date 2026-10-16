import { Link } from "react-router";

import { Bullets, PublicPage, PublicSection, textLink } from "~/components/public";
import { publicPageMeta } from "~/lib/meta";

export const meta = () => publicPageMeta("/safety");

export default function SafetyRoute() {
  return (
    <PublicPage
      path="/safety"
      lede="ConnectAbroad is built around introductions you agree to. Here is what other members can see, what you control, and what to do if something feels wrong."
    >
      <PublicSection title="Who can see your profile">
        <p>
          Profiles are visible only to signed-in members, not to the public web. Your profile shows what you choose to
          add, and optional fields you leave empty stay off it.
        </p>
        <Bullets
          items={[
            "Your email address, your messages and any reports you make are never shown on your profile.",
            "ConnectAbroad doesn't ask for your passport, visa documents, exact address or phone number.",
            "You can hide your profile from search, or pause new requests, in your privacy settings.",
          ]}
        />
      </PublicSection>

      <PublicSection title="Respectful introductions">
        <p>
          Every conversation starts with a request. Say what you share and ask one clear question. The other person
          decides whether to accept, and nobody can message you before you accept.
        </p>
        <p>
          Declining is always fine. If someone declines or doesn't answer, please don't try to reach them another way.
        </p>
      </PublicSection>

      <PublicSection title="Blocking">
        <p>Block a member from their profile or your conversation with them. Blocking:</p>
        <Bullets
          items={[
            "stops new requests and new messages between you",
            "removes you from each other's search results",
            "isn't announced to them; your profile simply becomes unavailable to them",
          ]}
        />
        <p>
          Earlier messages aren't silently deleted. They are kept according to a retention policy that has not been
          published yet. You can review the members you've blocked, and unblock them, in your privacy settings.
        </p>
      </PublicSection>

      <PublicSection title="Reporting a concern">
        <p>
          Report a member from their profile, or report a specific message from a conversation. Choose a reason and add
          details if you want to.
        </p>
        <Bullets
          items={[
            "You see a confirmation only once your report has been received. If sending fails, we say so and keep what you wrote.",
            "The moderation team reviews reports. We can't promise a response time yet.",
            "Moderators see only what they need for the report: the reason, your details and the content or context it concerns.",
            "Reporting doesn't block someone. If you also want to stop contact, block them too; each action confirms its own result.",
          ]}
        />
      </PublicSection>

      <PublicSection title="The limits of peer advice">
        <p>
          Members share what happened to them. Rules, costs and processes change and differ from person to person, so
          treat what you hear as one person's experience.
        </p>
        <p>
          For visas, immigration, legal, financial or medical questions, check official government and university
          sources or ask a qualified professional.
        </p>
      </PublicSection>

      <PublicSection title="In an emergency">
        <p>
          If you or someone else is in danger, contact local emergency services right away. ConnectAbroad can't send
          help or monitor conversations as they happen.
        </p>
        <p>When you're safe, you can report the member so moderators can review the account.</p>
      </PublicSection>

      <PublicSection title="More about how we work">
        <p>
          Read the draft{" "}
          <Link to="/community-guidelines" className={textLink}>
            community guidelines
          </Link>{" "}
          and the{" "}
          <Link to="/privacy" className={textLink}>
            privacy policy page
          </Link>
          . Both are still waiting for approval, and each page says what is missing.
        </p>
      </PublicSection>
    </PublicPage>
  );
}
