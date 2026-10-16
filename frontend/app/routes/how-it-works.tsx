import { Link } from "react-router";

import { Bullets, JoinCta, PublicPage, PublicSection, textLink } from "~/components/public";
import { publicPageMeta } from "~/lib/meta";

export const meta = () => publicPageMeta("/how-it-works");

export default function HowItWorksRoute() {
  return (
    <PublicPage
      path="/how-it-works"
      lede="ConnectAbroad helps you find someone who shares your starting point and has made a similar move, then introduce yourself on clear terms."
    >
      <PublicSection title="Your profile">
        <p>
          Your profile tells other members about your journey: whether you're preparing to move or already living
          abroad, and where.
        </p>
        <h3 className="font-semibold">What you share</h3>
        <Bullets
          items={[
            "A display name and your journey",
            "The country and city you're moving to or living in",
            "Optional background, such as your hometown, college, community or languages",
            "Topics you can share experience with, what you're looking for and a short bio",
          ]}
        />
        <h3 className="font-semibold">Who sees it</h3>
        <p>
          Your profile is visible only to signed-in members. Optional fields stay off your profile if you leave them
          empty, and you can hide your profile from search in your privacy settings.
        </p>
        <h3 className="font-semibold">What is never shown</h3>
        <p>
          Your email address, your messages and any reports you make are never shown on your profile. ConnectAbroad
          doesn't ask for your passport, visa documents, exact address or phone number.
        </p>
      </PublicSection>

      <PublicSection title="Finding people">
        <p>
          Search for members and narrow the list by journey, country, the topics people can help with, or only people
          who share some of your background.
        </p>
        <p>
          Each result explains what you have in common, such as “You both listed the same college”. That explanation
          only uses details both of you chose to share. There are no match scores and no verification badges.
        </p>
      </PublicSection>

      <PublicSection title="Introductions and requests">
        <p>
          When you find someone relevant, ask to connect and add a short introduction: mention what you share and one
          question you'd like to ask.
        </p>
        <Bullets
          items={[
            "They choose whether to accept or decline.",
            "You can cancel a request you sent while it's waiting.",
            "You can't message someone before they accept.",
            "Members can pause new requests whenever they need to.",
          ]}
        />
      </PublicSection>

      <PublicSection title="Messaging">
        <p>
          Once a request is accepted, a private conversation opens between the two of you. Messages are never shown on
          profiles. If either of you blocks the other, new messages stop.
        </p>
      </PublicSection>

      <PublicSection title="Safety tools">
        <p>
          From a profile or a conversation you can block a member, which stops new contact and removes you from each
          other's search, or report a concern so the moderation team can review it. Blocking and reporting are separate
          actions, and each confirms its own result.
        </p>
        <p>
          <Link to="/safety" className={textLink}>
            How blocking and reporting work
          </Link>
        </p>
      </PublicSection>

      <PublicSection title="What ConnectAbroad is not">
        <Bullets
          items={[
            "Not visa, immigration, legal or financial advice. Members share personal experience; check official sources.",
            "Not a promise of replies. People answer when they can, and some may not.",
            "Not a service for admissions, jobs or housing.",
            "Not a social feed. There are no posts to keep up with, only people to meet.",
          ]}
        />
      </PublicSection>

      <div className="border-t border-divider pt-8 lg:pt-12">
        <JoinCta title="Find someone who has made your move.">
          <p>Join the founding community, set up your profile and send your first introduction when you're ready.</p>
        </JoinCta>
      </div>
    </PublicPage>
  );
}
