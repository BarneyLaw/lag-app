export const VIEW_PATHS = Object.freeze({
  home: "/",
  quiz: "/quiz",
  summary: "/results"
});

export function pathForView(view) {
  return VIEW_PATHS[view] ?? VIEW_PATHS.home;
}

export function viewForPath(pathname) {
  const normalized = pathname === "/" ? pathname : pathname.replace(/\/+$/, "");
  return Object.entries(VIEW_PATHS).find(([, path]) => path === normalized)?.[0] ?? "home";
}
