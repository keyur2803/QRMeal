/** Customer user profile returned after login. */
export type CustomerUser = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  role: string;
};
