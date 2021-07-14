module.exports = {
  schema: ["./src/apollo/schema.json"],
  generates: {
    "./src/@types/gqlTypes.d.ts": {
      plugins: ["typescript"],
      // config: {},
    },
  },
};
