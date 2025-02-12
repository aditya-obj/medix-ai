"use client";
import { useEffect, useState } from "react";
import { auth } from "@/components/firebase.config";
import { useRouter } from "next/navigation";
import Statistic from "@/components/Statistic";

const Analysis = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        // Redirect to home page if not authenticated
        router.push("/");
      } else {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="default-padding">
      <Statistic />
    </div>
  );
};

export default Analysis;
