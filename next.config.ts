import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @react-pdf/renderer ships its own bundled deps (fontkit, etc.) that must not
  // be re-bundled by the compiler — keep it external so the PDF route works in
  // the Node runtime.
  serverExternalPackages: ["@react-pdf/renderer"],
};

export default nextConfig;
