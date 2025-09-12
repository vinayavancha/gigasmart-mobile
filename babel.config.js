// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      ["module-resolver", { root: ["./"], alias: { "@": "./src" } }],
      "nativewind/babel",
      "react-native-reanimated/plugin", // ← MUST be last
    ],
  };
};
