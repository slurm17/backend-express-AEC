import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { 
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { 
      globals: { ...globals.node, ...globals.es2021 } // Node + ES2021
    },
    rules: {
      "no-unused-vars": "warn",        // variables no usadas
      "no-console": "off",              // permitir console.log
      "eqeqeq": "error",                // forzar === y !==
      "curly": "error",                 // siempre usar llaves en if/else
      "quotes": ["error", "double", { "avoidEscape": true }] // comillas dobles obligatorias
    },
  },
]);
