/**
 * Auth feature — public surface.
 * Import from "@/features/auth" instead of reaching into internal files.
 */
export { login, signup, logout, type AuthState } from "./actions";
export { AuthForm } from "./components/auth-form";
