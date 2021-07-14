module.exports = {
  schema: ["./src/apollo/schema.json"],
  documents: ["src/apollo/documents/*.{graphql,js,ts,jsx,tsx}"],
  include: ["src/apollo/documents/*.{graphql,js,ts,jsx,tsx}"],
  extensions: {
    endpoints: {
      default: {
        url: "https://owaf.io/graphiql",
        headers: {
          Authorization: `Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9`,
        },
      },
    },
  },
};
