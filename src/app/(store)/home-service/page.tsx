import { redirect } from "next/navigation";

/**
 * The service was renamed "Broadway at Home" after the page was built. The
 * old path stays and forwards, because it is already in the footer, the
 * homepage band and anywhere the shop has pasted it.
 */
export default function HomeServicePage() {
  redirect("/broadway-at-home");
}
