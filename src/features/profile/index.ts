/**
 * Profile feature — client-safe surface. Server-only data access lives in
 * ./queries and is imported directly by pages (not re-exported here).
 */
export { updateProfile, type ProfileState } from "./actions";
export { ProfileForm } from "./components/profile-form";
export { isProfileComplete, completarPerfilHref } from "./domain";
