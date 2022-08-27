import { defineConfig } from "tsup"

export default defineConfig({
    entry: ["src/index.ts"],
    target: "node16",
    sourcemap: "inline",
    bundle: true,
    clean: true,
})
