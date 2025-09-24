"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/app/loading";

export default function DashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : null;

    if (user?.id) {
      router.replace("/dashboard/app");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return <Loading />;
}
