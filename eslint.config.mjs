// eslint-config-next 16 ships flat configs directly, so there is no need for
// FlatCompat here — going through the compat layer actually breaks on this
// version (circular structure while validating the legacy schema).
import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

export default [
  ...coreWebVitals,
  ...typescript,
  {
    ignores: [".next/**", "node_modules/**", "src/generated/**"],
  },
];
