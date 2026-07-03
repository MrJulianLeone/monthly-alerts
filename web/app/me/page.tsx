import { redirect } from "next/navigation";

/** The old dashboard now lives under Settings. */
export default function MePage() {
  redirect("/settings");
}
