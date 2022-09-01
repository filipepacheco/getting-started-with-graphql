import {arg, enumType, extendType, inputObjectType, intArg, list, nonNull, objectType, stringArg} from "nexus";
import { Prisma } from "@prisma/client";

// Declaration of an Object called Link
export const Link = objectType({
    name: "Link",
    definition(t) {
        // Link properties
        t.nonNull.int("id");
        t.nonNull.string("description");
        t.nonNull.string("url");
    },
});

// Declaration of an Object called Feed
export const Feed = objectType({
    name: "Feed",
    definition(t) {
        // Feed properties, including one referencing to Link
        t.nonNull.list.nonNull.field("links", { type: Link });
        t.nonNull.int("count");
        t.id("id");
    },
});

// This is a query, basically saying that you can use this query to
// Return a Feed, given these arguments
// It uses the extendType which is literally an extension in OOP.
export const LinkQuery = extendType({
    type: "Query",
    definition(t) {
        t.nonNull.field("feed", {
            type: "Feed",
            // Args means the inputs that user can give to perform the query
            args: {
                filter: stringArg(),
                skip: intArg(),
                take: intArg(),
                orderBy: arg({ type: list(nonNull(LinkOrderByInput)) }),
            },
            // Resolve is the handler that gather the response
            async resolve(parent, args, context) {
                // Get the args and build a where clause to be used in Prisma
                const where = args.filter
                    ? {
                        OR: [
                            { description: { contains: args.filter } },
                            { url: { contains: args.filter } },
                        ],
                    }
                    : {};

                // Uses the ORM to connect with SQLite and perform the query
                const links = await context.prisma.link.findMany({
                    where,
                    skip: args?.skip as number | undefined,
                    take: args?.take as number | undefined,
                    orderBy: args?.orderBy as
                        | Prisma.Enumerable<Prisma.LinkOrderByWithRelationInput>
                        | undefined,
                });

                // Count how many results
                const count = await context.prisma.link.count({ where });
                // Mount an id based on args received
                const id = `main-feed:${JSON.stringify(args)}`;

                // Object that will be returned to the user calling the API
                return {
                    links,
                    count,
                    id,
                };
            },
        });
    },
});

// Same as above, but a Mutation is used to manipulate data and not only get it.
export const LinkMutation = extendType({
    type: "Mutation",
    definition(t) {
        // post(description: String!, url: String!): Link!
        t.nonNull.field("post", {
            type: "Link",
            // Args needed to create a new Link
            args: {
                description: nonNull(stringArg()),
                url: nonNull(stringArg()),
            },
            // Resolve is the handler that perform the task
            resolve(parent, args, context) {
                // Use ORM to create a new record on SQLite
                return context.prisma.link.create({
                    data: {
                        description: args.description,
                        url: args.url,
                    },
                });
            },
        });
    },
});

// A type to map the order possibilities
export const LinkOrderByInput = inputObjectType({
    name: "LinkOrderByInput",
    definition(t) {
        t.field("description", { type: Sort });
        t.field("url", { type: Sort });
    },
});

// A type to map the order possibilities
export const Sort = enumType({
    name: "Sort",
    members: ["asc", "desc"],
});
