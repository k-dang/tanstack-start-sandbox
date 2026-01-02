import { SignIn } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sign-in/$")({
  component: Page,
});

function Page() {
  return (
    <div className="flex items-center justify-center p-12">
      <SignIn routing="hash" forceRedirectUrl={window.location.href} />
    </div>
  );
}
