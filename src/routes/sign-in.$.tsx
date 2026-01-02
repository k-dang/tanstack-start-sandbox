import { SignIn } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/sign-in/$")({
  validateSearch: z.object({
    redirect_url: z.string().optional(),
  }),
  component: Page,
});

function Page() {
  const { redirect_url } = Route.useSearch();

  return (
    <div className="flex items-center justify-center p-12">
      <SignIn routing="hash" forceRedirectUrl={redirect_url ?? "/"} />
    </div>
  );
}
