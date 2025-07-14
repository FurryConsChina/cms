import { defineConfig, loadEnv } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginSvgr } from "@rsbuild/plugin-svgr";

const { publicVars } = loadEnv({ prefixes: ["NEXT_PUBLIC_"] });

export default defineConfig({
  plugins: [pluginReact(), pluginSvgr()],
  server: {
    port: 3001,
  },
  source: {
    define: publicVars,
  },
  html: {
    title: "FCC Dashboard",
  },
});
