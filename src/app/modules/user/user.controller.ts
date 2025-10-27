import { userService } from "./user.service";
export const getUserController = () => ({
  list: async () => userService.list(),
  create: async ({ body }: any) => userService.create(body),
});
