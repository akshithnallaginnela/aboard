import { Link } from "react-router";

import { PublicContainer } from "~/components/layout";
import { buttonVariants } from "~/components/ui/button";
import { privateMeta } from "~/lib/meta";

export const meta = () => privateMeta("Page not found");

export default function NotFoundRoute() {
  return (
    <PublicContainer className="py-12 lg:py-24">
      <div className="flex max-w-2xl flex-col items-start gap-4">
        <span aria-hidden="true" className="h-1 w-16 bg-accent" />
        <h1 tabIndex={-1} className="font-serif text-[1.875rem] font-medium leading-[1.15] sm:text-[2.25rem] lg:text-[2.5rem]">
          We couldn't find that page.
        </h1>
        <p className="text-lg text-muted-ink">
          The address may be mistyped, or the page may have moved. These pages can help you find your way.
        </p>
        <nav aria-label="Helpful links" className="mt-2 flex flex-wrap gap-3">
          <Link to="/" className={buttonVariants()}>
            Go to the home page
          </Link>
          <Link to="/how-it-works" className={buttonVariants({ variant: "secondary" })}>
            How it works
          </Link>
          <Link to="/login" className={buttonVariants({ variant: "secondary" })}>
            Log in
          </Link>
        </nav>
      </div>
    </PublicContainer>
  );
}
