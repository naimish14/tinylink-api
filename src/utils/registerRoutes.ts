import { Express, RequestHandler } from "express";

export type HttpMethod =
  | "get" | "post" | "put" | "patch" | "delete" | "options" | "head" | "all";

export interface RouteDef {
  path: string;
  method: HttpMethod;
  action: RequestHandler;
}

export function registerRoutes(app: Express, routes: RouteDef[]) {
  // Bind methods to keep `this` correct and preserve types
  const methods: Record<HttpMethod, (path: string, ...h: RequestHandler[]) => Express> = {
    get: app.get.bind(app),
    post: app.post.bind(app),
    put: app.put.bind(app),
    patch: app.patch.bind(app),
    delete: app.delete.bind(app),
    options: app.options.bind(app),
    head: app.head.bind(app),
    all: app.all.bind(app),
  };

  for (const { method, path, action } of routes) {
    methods[method](path, action);
  }
}
