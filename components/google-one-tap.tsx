
// Add types for Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function GoogleOneTap() {
  useEffect(() => {
    // Ensure the Google script is loaded
    if (!window.google) return;
    window.google.accounts.id.initialize({
      client_id: "540625213988-imm0fmlgh1119ci22m15a22v9bhr1ie5.apps.googleusercontent.com",
      callback: async (response: any) => {
        // Send the credential to Supabase
        await supabase.auth.signInWithIdToken({
          provider: "google",
          token: response.credential,
        });
      },
    });
    window.google.accounts.id.prompt();
  }, []);

  return null;
}
