import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import ChatPageClient from "./components/ChatPageClient";

export default async function Home() {
  const session = await getServerSession();
  if (!session) {
    redirect("/auth/signin");
  }

  return <ChatPageClient />;
}
