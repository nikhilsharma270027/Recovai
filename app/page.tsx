"use client"
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Hero from "./components/Hero";
import { useAuth } from "../context/AuthContext";
import Cards from "./components/Cards";
import { Sidebar } from "./components/ui/sidebar";

export default function Home() {
  const { user, login } = useAuth();

  const router = useRouter();

  useEffect(() => {
    if (user) router.push("/");
  }, [user]);

  return (
    <>
      {/* <div className="flex h-screen justify-center items-center">
        {user ? (
          <a
            href="/dashboard"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg">
            Go to Dashboard
          </a>
        ) : (
          <button
            onClick={login}
            className="px-6 py-3 bg-green-500 text-white rounded-lg">
            Login with Google
          </button>
        )}
      </div> */}
      <Hero />
      <Sidebar children={undefined} />
    </>
  );
}
