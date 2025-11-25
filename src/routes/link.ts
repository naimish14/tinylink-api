import {
  createLink,
  listLinks,
  getLinkStats,
  deleteLink,
  redirectByCode,
} from "../controller/link";
import type { RouteDef } from "../utils/registerRoutes";

const LinkRoutes: RouteDef[] = [
  { path: "/api/links",      method: "post",   action: createLink },
  { path: "/api/links",      method: "get",    action: listLinks },
  { path: "/api/links/:code",method: "get",    action: getLinkStats },
  { path: "/api/links/:code",method: "delete", action: deleteLink },

  { path: "/:code",          method: "get",    action: redirectByCode },
];

export default LinkRoutes;
