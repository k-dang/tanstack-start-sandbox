import { ClerkProvider } from "@clerk/tanstack-react-start";
import { auth } from "@clerk/tanstack-react-start/server";
import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { createServerFn } from "@tanstack/react-start";
import { DefaultCatchBoundary } from "@/components/default-catch-boundry";
import { NotFound } from "@/components/not-found";
import { Toaster } from "@/components/ui/sonner";
import { getOrCreateUser, mergeGuestCartToUser } from "@/db";
import { useCartSession } from "@/lib/session";
import { Header } from "../components/header";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import appCss from "../styles.css?url";

interface MyRouterContext {
  queryClient: QueryClient;
}

const fetchClerkAuth = createServerFn({ method: "GET" }).handler(async () => {
  const { userId } = await auth();

  return {
    userId,
  };
});

const syncUserAndCart = createServerFn({ method: "GET" }).handler(async () => {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return;
  }

  // biome-ignore lint/correctness/useHookAtTopLevel: <TanStack Start docs do this as well>
  const session = await useCartSession();
  const guestCartId = session.data.cartId;

  // Create or get user record
  const user = await getOrCreateUser(clerkUserId);

  // If guest cart exists, merge it into user's cart
  if (guestCartId) {
    await mergeGuestCartToUser(guestCartId, user.id);
    // Clear guest cart from session
    await session.update({ cartId: undefined });
  }
});

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: async () => {
    const { userId } = await fetchClerkAuth();

    // Sync user and merge guest cart if authenticated
    if (userId) {
      await syncUserAndCart();
    }

    return {
      userId, // clerk user id exists in our context
    };
  },
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "TanStack Start Starter",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  errorComponent: (props) => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    );
  },
  component: RootComponent,
  notFoundComponent: () => <NotFound />,
});

function RootComponent() {
  return (
    <ClerkProvider>
      <RootDocument>
        <Outlet />
      </RootDocument>
    </ClerkProvider>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <Header />
        <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">{children}</div>
        <Toaster />
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
