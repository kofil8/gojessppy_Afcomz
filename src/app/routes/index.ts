import express from "express";
import { UserRouters } from "../modules/User/user.router";
import { AuthRouters } from "../modules/Auth/auth.router";
import { NotificationsRouters } from "../modules/notifications/notification.routes";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRouters,
  },
  {
    path: "/users",
    route: UserRouters,
  },

  {
    path: "/notifications",
    route: NotificationsRouters,
  },
];

moduleRoutes
  .filter((route) => route.route)
  .forEach((route) => router.use(route.path, route.route));

export default router;
