import { defineConfig } from "tsup"

export default defineConfig({
    entry: ["src"],
    target: "node16",
    splitting: false,
    sourcemap: true,
    bundle: false,
    clean: true,
})
