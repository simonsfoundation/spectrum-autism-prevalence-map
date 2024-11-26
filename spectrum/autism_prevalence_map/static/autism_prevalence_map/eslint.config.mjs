import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";


/** @type {import('eslint').Linter.Config[]} */
export default [
    {files: ["ts/*.{js,mjs,cjs,ts}"]},
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
];
