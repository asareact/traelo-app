import { redirect } from "next/navigation";

/** /admin → the board (the only landing the admin needs for now). */
export default function AdminIndex() {
  redirect("/admin/kanban");
}
