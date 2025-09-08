import {
  type RouteConfig,
  route,
  index,
  layout,
  prefix,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route( "/dashboard", "routes/dashboard.tsx"),
  route( "/schedule", "routes/schedule.tsx"),
] satisfies RouteConfig;
