export const ROUTES = {
  login: "/login",
  signup: "/signup",
  dashboard: "/dashboard",
  books: "/books",
  newBook: "/books/new",
  editBook: (id: string) => `/books/${id}/edit`,
} as const;

export const PUBLIC_ROUTES: string[] = [ROUTES.login, ROUTES.signup];
