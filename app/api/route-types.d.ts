// app/api/route-types.d.ts
import { NextRequest } from 'next/server';

export type RouteHandlerContext<T = Record<string, string>> = {
  params: T;
};

export type DynamicRouteHandler<T = Record<string, string>> = (
  request: NextRequest,
  context: RouteHandlerContext<T>
) => Promise<Response> | Response;