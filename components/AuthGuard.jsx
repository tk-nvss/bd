"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");

    // Check for both token AND email
    if (!token || !email) {
      router.replace("/login");
    } else {
      setAllowed(true);
    }
  }, []);

  // Avoid flicker while checking
  if (!allowed) return null;

  return children;
}
