import {arg, enumType, extendType, inputObjectType, intArg, list, nonNull, objectType, stringArg} from "nexus";
import { Prisma } from "@prisma/client";

export const Link = objectType({
    name: "Link",
    definition(t) {
        t.nonNull.int("id");
        t.nonNull.string("description");
        t.nonNull.string("url");
    },
});

export const LinkOrderByInput = inputObjectType({
    name: "LinkOrderByInput",
    definition(t) {
        t.field("description", { type: Sort });
        t.field("url", { type: Sort });
    },
});

export const Sort = enumType({
    name: "Sort",
    members: ["asc", "desc"],
});

export const Feed = objectType({
    name: "Feed",
    definition(t) {
        t.nonNull.list.nonNull.field("links", { type: Link });
        t.nonNull.int("count");
        t.id("id");
    },
});

export const LinkQuery = extendType({
    type: "Query",
    definition(t) {
        t.nonNull.field("feed", {
            type: "Feed",
            args: {
                filter: stringArg(),
                skip: intArg(),
                take: intArg(),
                orderBy: arg({ type: list(nonNull(LinkOrderByInput)) }),
            },
            async resolve(parent, args, context) {
                const where = args.filter
                    ? {
                        OR: [
                            { description: { contains: args.filter } },
                            { url: { contains: args.filter } },
                        ],
                    }
                    : {};

                const links = await context.prisma.link.findMany({
                    where,
                    skip: args?.skip as number | undefined,
                    take: args?.take as number | undefined,
                    orderBy: args?.orderBy as
                        | Prisma.Enumerable<Prisma.LinkOrderByWithRelationInput>
                        | undefined,
                });

                const count = await context.prisma.link.count({ where });
                const id = `main-feed:${JSON.stringify(args)}`;

                return {
                    links,
                    count,
                    id,
                };
            },
        });
    },
});

export const LinkMutation = extendType({
    type: "Mutation",
    definition(t) {
        // post(description: String!, url: String!): Link!
        t.nonNull.field("post", {
            type: "Link",
            args: {
                description: nonNull(stringArg()),
                url: nonNull(stringArg()),
            },
            resolve(parent, args, context) {
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
