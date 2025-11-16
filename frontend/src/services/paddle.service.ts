// Paddle.js service for frontend checkout
declare global {
  interface Window {
    Paddle: any;
  }
}

const getPaddleClientKey = (): string => {
  const env =
    import.meta.env.VITE_PADDLE_ENVIRONMENT ||
    import.meta.env.PADDLE_ENVIRONMENT ||
    "sandbox";

  // Try multiple possible env var names for flexibility
  if (env === "sandbox" || env === "test") {
    return (
      import.meta.env.VITE_PADDLE_SANDBOX_CLIENT_SIDE_API_KEY ||
      import.meta.env.VITE_PADDLE_CLIENT_SIDE_API_KEY ||
      import.meta.env.PADDLE_SANDBOX_CLIENT_SIDE_API_KEY ||
      import.meta.env.PADDLE_CLIENT_SIDE_API_KEY ||
      ""
    );
  }

  return (
    import.meta.env.VITE_PADDLE_CLIENT_SIDE_API_KEY ||
    import.meta.env.PADDLE_CLIENT_SIDE_API_KEY ||
    ""
  );
};

const getPriceId = (plan: "pro" | "business" | "enterprise"): string => {
  const env = import.meta.env.VITE_PADDLE_ENVIRONMENT || "sandbox";

  if (env === "sandbox") {
    const sandboxPriceIds: Record<"pro" | "business" | "enterprise", string> = {
      pro: import.meta.env.VITE_PADDLE_SANDBOX_PRICE_ID_PRO || "",
      business: import.meta.env.VITE_PADDLE_SANDBOX_PRICE_ID_BUSINESS || "",
      enterprise: import.meta.env.VITE_PADDLE_SANDBOX_PRICE_ID_ENTERPRISE || "",
    };
    return sandboxPriceIds[plan];
  }

  const priceIds: Record<"pro" | "business" | "enterprise", string> = {
    pro: import.meta.env.VITE_PADDLE_PRICE_ID_PRO || "",
    business: import.meta.env.VITE_PADDLE_PRICE_ID_BUSINESS || "",
    enterprise: import.meta.env.VITE_PADDLE_PRICE_ID_ENTERPRISE || "",
  };
  return priceIds[plan];
};

export const initializePaddle = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.Paddle) {
      reject(
        new Error(
          "Paddle.js not loaded. Make sure the Paddle.js script is included in index.html"
        )
      );
      return;
    }

    const clientKey = getPaddleClientKey();
    if (!clientKey) {
      const env =
        import.meta.env.VITE_PADDLE_ENVIRONMENT ||
        import.meta.env.PADDLE_ENVIRONMENT ||
        "sandbox";
      const envVarName =
        env === "sandbox"
          ? "VITE_PADDLE_SANDBOX_CLIENT_SIDE_API_KEY or VITE_PADDLE_CLIENT_SIDE_API_KEY"
          : "VITE_PADDLE_CLIENT_SIDE_API_KEY";

      // Debug: log available env vars (without values)
      const availableEnvVars = Object.keys(import.meta.env)
        .filter((key) => key.includes("PADDLE"))
        .map((key) => key);

      reject(
        new Error(
          `Paddle client-side API key not configured.\n` +
            `Please create a .env file in the frontend/ directory with:\n` +
            `${envVarName}=your_client_side_token_here\n\n` +
            `IMPORTANT: The token should start with "test_" (sandbox) or "live_" (production).\n` +
            `Get it from: Paddle Dashboard > Developer Tools > Authentication > Client-side tokens\n\n` +
            `Current environment: ${env}\n` +
            `Available Paddle env vars: ${
              availableEnvVars.length > 0 ? availableEnvVars.join(", ") : "none"
            }`
        )
      );
      return;
    }

    // Debug: Log token format (first few chars only for security)
    console.log("Paddle client key format check:", {
      startsWithTest: clientKey.startsWith("test_"),
      startsWithLive: clientKey.startsWith("live_"),
      length: clientKey.length,
      preview: clientKey.substring(0, 10) + "...",
    });

    const env =
      import.meta.env.VITE_PADDLE_ENVIRONMENT ||
      import.meta.env.PADDLE_ENVIRONMENT ||
      "sandbox";

    try {
      // Verify token format (should start with test_ or live_)
      if (!clientKey.startsWith("test_") && !clientKey.startsWith("live_")) {
        console.warn(
          'Paddle client-side token should start with "test_" (sandbox) or "live_" (production). Your token format might be incorrect.'
        );
      }

      // Check which Paddle version is loaded
      const hasInitialize = typeof window.Paddle.Initialize === "function";
      const hasSetup = typeof window.Paddle.Setup === "function";
      const hasEnvironment = typeof window.Paddle.Environment !== "undefined";

      console.log("Paddle API available:", {
        hasInitialize,
        hasSetup,
        hasEnvironment,
      });

      // Set environment if sandbox (only for Billing)
      if (
        hasEnvironment &&
        (env === "sandbox" || env === "test" || clientKey.startsWith("test_"))
      ) {
        try {
          window.Paddle.Environment.set("sandbox");
        } catch (e) {
          console.warn("Could not set Paddle environment:", e);
        }
      }

      // Initialize Paddle Billing (preferred method)
      if (hasInitialize) {
        // Paddle Billing - use Initialize()
        window.Paddle.Initialize({
          token: clientKey,
          eventCallback: (data: any) => {
            // Log important events for debugging
            if (
              data.name === "checkout.loaded" ||
              data.name === "checkout.completed" ||
              data.name === "checkout.error"
            ) {
              console.log("Paddle event:", data);
            }
          },
        });
        console.log("Paddle Billing initialized with Initialize()");
      } else if (hasSetup) {
        // Paddle Classic - Setup() requires vendor ID, not token
        // This shouldn't happen if using Billing, but handle it gracefully
        throw new Error(
          "Paddle Classic detected. You need to use Paddle Billing. " +
            "Make sure you have a client-side token (starts with test_ or live_) " +
            "and that the Paddle.js script supports Paddle.Initialize(). " +
            "If using Classic, you need a vendor ID instead of a token."
        );
      } else {
        throw new Error(
          "Paddle.js is loaded but neither Initialize() nor Setup() methods are available"
        );
      }

      console.log("Paddle initialized successfully");
      resolve();
    } catch (error) {
      reject(
        new Error(
          `Failed to initialize Paddle: ${
            error instanceof Error ? error.message : String(error)
          }`
        )
      );
    }
  });
};

export const openCheckout = (
  plan: "pro" | "business" | "enterprise",
  options?: {
    email?: string;
    customerId?: string;
    successCallback?: (data: any) => void;
    closeCallback?: () => void;
  }
): void => {
  if (typeof window === "undefined" || !window.Paddle) {
    throw new Error("Paddle.js not initialized");
  }

  const priceId = getPriceId(plan);
  if (!priceId) {
    throw new Error(`Price ID not configured for plan: ${plan}`);
  }

  const checkoutOptions: any = {
    items: [
      {
        priceId: priceId,
        quantity: 1,
      },
    ],
  };

  // Add customer information if provided
  // Paddle Billing: Either use customer.id OR customer.email, but not both
  if (options?.customerId) {
    // If we have a Paddle customer ID, use that (preferred)
    checkoutOptions.customer = {
      id: options.customerId,
    };
  } else if (options?.email) {
    // Otherwise, use email (Paddle will create/find customer by email)
    checkoutOptions.customer = {
      email: options.email,
    };
  }

  // Add callbacks
  if (options?.successCallback) {
    checkoutOptions.successCallback = options.successCallback;
  }
  if (options?.closeCallback) {
    checkoutOptions.closeCallback = options.closeCallback;
  }

  window.Paddle.Checkout.open(checkoutOptions);
};

export const isPaddleLoaded = (): boolean => {
  return typeof window !== "undefined" && typeof window.Paddle !== "undefined";
};
