import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import { ZodError } from "zod";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    // Handle Zod validation errors
    if (error.cause instanceof ZodError) {
      const zodError = error.cause as ZodError<any>;
      const firstError = zodError.issues[0];
      
      // Map Zod errors to user-friendly messages
      if (firstError) {
        const field = firstError.path.join('.');
        const message = firstError.message;
        
        // Custom messages for common validation errors
        if (message.includes('email') || message.includes('Invalid email')) {
          return {
            ...shape,
            message: "Please enter a valid email address",
          };
        }
        
        if (message.includes('at least') && field === 'password') {
          return {
            ...shape,
            message: "Password must be at least 8 characters long",
          };
        }
        
        if (message.includes('Required')) {
          return {
            ...shape,
            message: `${field.charAt(0).toUpperCase() + field.slice(1)} is required`,
          };
        }
        
        // Return the original Zod message if no custom mapping
        return {
          ...shape,
          message: `${field}: ${message}`,
        };
      }
    }
    
    return shape;
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);
