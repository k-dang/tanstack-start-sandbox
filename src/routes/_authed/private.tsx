import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/private")({
  component: RouteComponent,
  loader: async ({ context }) => {
    return { userId: context.userId };
  },
});

function RouteComponent() {
  const state = Route.useLoaderData();

  return (
    <div>
      <h1>Welcome! Your ID is {state.userId}!</h1>
      <div>Hello "/_authed/private"!</div>
    </div>
  );
}
