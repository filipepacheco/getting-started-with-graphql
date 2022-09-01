import { ApolloServer } from "apollo-server";
import { context } from "./context";

import { schema } from "./schema";
export const server = new ApolloServer({
    schema,
    // Context here is the Prisma instance connected to the SQLite
    context,
});

const port = 3000;

server.listen({port}).then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});
