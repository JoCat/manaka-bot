import { defineConfig } from "tsup"

export default defineConfig({
    entry: ["src/index.ts"],
    target: "node18",
    bundle: true,
    clean: true,
})
