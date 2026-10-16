import { Link } from "react-router";

import { PublicContainer } from "~/components/layout";
import { SharedContext } from "~/components/member";
import { Bullets, JoinCta, sectionTitle, textLink } from "~/components/public";
import { buttonVariants } from "~/components/ui/button";
import { publicPageMeta } from "~/lib/meta";
import { getPublicPage } from "~/lib/site";

export const meta = () => publicPageMeta("/");

const steps = [
  {
    title: "Tell us your journey",
    body: "Where you're from, where you're going or already living, and what you can help with. Your profile is visible to signed-in members only.",
  },
  {
    title: "Find someone with a shared starting point",
    body: "Look for people from the same college, hometown or community. Each result says what you share, so you can see why you might connect.",
  },
  {
    title: "Send a short introduction",
    body: "Say what you share and ask one question. They choose whether to accept, and messaging opens only after they accept.",
  },
];

/** Typographic hero composition: a clearly labeled example, never a real member. */
function ExampleIntroduction() {
  return (
    <figure className="flex flex-col gap-6 rounded-panel border border-divider bg-surface p-6 sm:p-8">
      <figcaption className="text-sm font-semibold text-muted-ink before:mb-6 before:block before:h-1 before:w-12 before:bg-accent">
        An example introduction — not a real member
      </figcaption>
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <p className="flex flex-col">
            <span className="text-muted-ink">From</span>
            <span className="font-semibold">Preparing to move</span>
          </p>
          <p className="flex flex-col text-right">
            <span className="text-muted-ink">To</span>
            <span className="font-semibold">Already living there</span>
          </p>
        </div>
        <span aria-hidden="true" className="flex items-center">
          <span className="size-2 rounded-full bg-primary" />
          <span className="h-px flex-1 bg-control-border" />
          <span className="size-2 rounded-full bg-accent" />
        </span>
      </div>
      <SharedContext items={["You both listed the same college"]} />
      <blockquote className="text-lg leading-relaxed">
        <p>“We studied at the same college. I'd like to learn about settling into university life.”</p>
      </blockquote>
      <p className="border-t border-divider pt-4 text-sm text-muted-ink">
        They choose whether to accept. Messaging opens only after they do.
      </p>
    </figure>
  );
}

export default function HomeRoute() {
  const page = getPublicPage("/");
  return (
    <>
      <PublicContainer className="grid items-center gap-12 py-12 lg:grid-cols-12 lg:gap-16 lg:py-24">
        <div className="flex min-w-0 flex-col items-start gap-6 lg:col-span-7">
          <h1
            tabIndex={-1}
            className="max-w-[18ch] font-serif text-[clamp(2.375rem,4.2vw_+_1rem,4rem)] font-medium leading-[1.08]"
          >
            {page.heading}
          </h1>
          <p className="max-w-[44ch] text-lg text-muted-ink sm:text-xl">
            Find people preparing for a similar move and people already living there, through the communities and
            experiences you share.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/signup" className={buttonVariants()}>
              Join the founding community
            </Link>
            <a href="#how-it-works" className={buttonVariants({ variant: "secondary" })}>
              See how it works
            </a>
          </div>
          <p className="max-w-[52ch] text-muted-ink">
            <span className="font-semibold text-ink">Early access:</span> we're starting with one founding community and
            inviting people personally.
          </p>
        </div>
        <div className="w-full min-w-0 max-w-xl lg:col-span-5 lg:max-w-none">
          <ExampleIntroduction />
        </div>
      </PublicContainer>

      <section id="how-it-works" className="border-t border-divider">
        <PublicContainer className="py-12 lg:py-24">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h2 className={sectionTitle}>Three steps to a useful introduction</h2>
            <Link to="/how-it-works" className={textLink}>
              Read the full explanation
            </Link>
          </div>
          <ol className="mt-8 border-t border-ink lg:mt-12">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="grid gap-3 border-b border-divider py-8 md:grid-cols-12 md:gap-8 lg:py-12"
              >
                <h3 className="flex items-baseline gap-4 font-serif text-2xl font-medium leading-[1.2] md:col-span-5">
                  <span aria-hidden="true" className="text-[2.5rem] leading-none text-primary">
                    {index + 1}
                  </span>
                  <span className="sr-only">Step {index + 1}: </span>
                  <span className="min-w-0">{step.title}</span>
                </h3>
                <p className="max-w-[60ch] sm:text-lg md:col-span-7">{step.body}</p>
              </li>
            ))}
          </ol>
        </PublicContainer>
      </section>

      <section className="border-y border-divider bg-surface">
        <PublicContainer className="py-12 lg:py-16">
          <h2 className={sectionTitle}>Two sides of the same move</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-2 md:gap-0 md:divide-x md:divide-divider lg:mt-12">
            <div className="flex flex-col gap-4 md:pr-12">
              <h3 className="font-serif text-xl font-medium leading-[1.2] sm:text-2xl">If you're preparing to move</h3>
              <p className="sm:text-lg">
                Find people who started where you're starting and have already made the move. Ask the practical
                questions that are hard to search for.
              </p>
              <Bullets
                items={[
                  "Introduce yourself with what you share",
                  "Ask about settling in, studying or everyday life",
                  "Talk once they accept your request",
                ]}
              />
            </div>
            <div className="flex flex-col gap-4 border-t border-divider pt-8 md:border-t-0 md:pt-0 md:pl-12">
              <h3 className="font-serif text-xl font-medium leading-[1.2] sm:text-2xl">If you're already living there</h3>
              <p className="sm:text-lg">
                Share what you learned with someone starting the same journey. You decide which introductions to
                accept.
              </p>
              <Bullets
                items={[
                  "Answer when you can, at your own pace",
                  "Say which topics you can share experience with",
                  "Pause new requests any time in your settings",
                ]}
              />
            </div>
          </div>
        </PublicContainer>
      </section>

      <section>
        <PublicContainer className="py-12 lg:py-24">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
            <div className="flex flex-col gap-4 lg:col-span-5">
              <h2 className={sectionTitle}>Clear boundaries from the first message</h2>
              <p className="text-muted-ink sm:text-lg">
                You choose what to share. Members are introduced before they talk, and safety tools are always within
                reach.
              </p>
              <Link to="/safety" className={textLink}>
                Read about safety and privacy
              </Link>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:col-span-7">
              <div className="flex flex-col gap-3">
                <h3 className="text-lg font-semibold">Signed-in members can see</h3>
                <Bullets
                  items={[
                    "Your name and journey",
                    "Where you're from and where you're going or living",
                    "Background you choose to add, like college or hometown",
                    "Topics you can help with",
                  ]}
                />
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="text-lg font-semibold">Members never see</h3>
                <Bullets
                  items={[
                    "Your email address",
                    "Your messages with other people",
                    "Reports you make",
                    "Your exact address or phone number — we don't ask for them",
                  ]}
                />
              </div>
              <dl className="grid gap-4 border-t border-divider pt-6 sm:col-span-2">
                <div>
                  <dt className="font-semibold">Accept before message</dt>
                  <dd className="text-muted-ink">Nobody can message you until you accept their request.</dd>
                </div>
                <div>
                  <dt className="font-semibold">Block and report</dt>
                  <dd className="text-muted-ink">
                    Block someone to stop new contact, or report a concern to the moderation team.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold">Peer experience, not professional advice</dt>
                  <dd className="text-muted-ink">
                    Members share what happened to them. Check official sources for visas, legal or financial
                    questions.
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </PublicContainer>
      </section>

      <section className="border-t border-divider">
        <PublicContainer className="py-8 lg:py-16">
          <div className="max-w-3xl border-l-4 border-accent pl-6 sm:pl-8">
            <h2 className={sectionTitle}>Starting with one founding community</h2>
            <div className="prose-editorial mt-4 sm:text-lg">
              <p>
                A network is only useful when the right person is in it. So instead of opening to everyone at once,
                ConnectAbroad is starting with one founding community and inviting people personally.
              </p>
              <p>
                That means the community is small for now, and you may find only a few people at first. We'd rather
                grow carefully and learn from every introduction than make promises about size.
              </p>
            </div>
          </div>
        </PublicContainer>
      </section>

      <PublicContainer className="py-12 lg:py-24">
        <JoinCta title="Start with one useful introduction.">
          <p>Create a profile, tell us about your journey and find someone who shares your starting point.</p>
        </JoinCta>
      </PublicContainer>
    </>
  );
}
