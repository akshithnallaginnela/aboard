import { Bullets, PublicPage, PublicSection } from "~/components/public";
import { publicPageMeta } from "~/lib/meta";

export const meta = () => publicPageMeta("/about");

export default function AboutRoute() {
  return (
    <PublicPage
      path="/about"
      lede="Moving abroad is easier when you can ask someone who started where you started and has already made the move."
    >
      <PublicSection title="What we're trying to do">
        <p>
          ConnectAbroad helps people preparing to move abroad find someone with shared roots, such as the same college,
          hometown or community, who has made a similar move. One relevant conversation can answer questions that are
          hard to search for.
        </p>
      </PublicSection>

      <PublicSection title="Why one community first">
        <p>
          A network is only useful when the right person is in it. Starting with one founding community makes it more
          likely that the people you find really do share your starting point.
        </p>
        <p>
          We're inviting people personally and learning from each introduction before opening to more communities.
        </p>
      </PublicSection>

      <PublicSection title="What ConnectAbroad won't do">
        <Bullets
          items={[
            "Give visa, immigration, legal or financial advice",
            "Promise replies, admissions, visas, jobs or housing",
            "Show your email address, messages or reports on your profile",
            "Turn introductions into a feed of posts",
          ]}
        />
      </PublicSection>

      <PublicSection title="Team and contact">
        <p>
          Details about the people building ConnectAbroad, and how to contact them, will appear here once they are
          approved for publication.
        </p>
      </PublicSection>
    </PublicPage>
  );
}
