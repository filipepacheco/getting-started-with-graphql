import { makeSchema } from 'nexus'
import { join } from 'path'
import * as types from "./graphql";

// Your GraphQL schema will consist of many types that you will pass as an array to the types object.
export const schema = makeSchema({
    types,
    outputs: {
        // GraphQL schema file of type .graphql.
        // This is the GraphQL Schema Definition Language (SDL) for defining the structure of your API.
        schema: join(process.cwd(), "schema.graphql"),
        // TypeScript type definitions for all types in your GraphQL schema
        typegen: join(process.cwd(), "nexus-typegen.ts"),
    },
    contextType: {
        module: join(process.cwd(), "./src/context.ts"),
        export: "Context",
    },
})
