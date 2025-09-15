'use client'
import { useAuth } from "@/hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { isUnauthenticated } = useAuth()
  const router = useRouter()
  useEffect(() => {
    isUnauthenticated ? router.replace("/login") : router.replace('/dashboard')
  }, [])
  return (
    <></>
  );
}
