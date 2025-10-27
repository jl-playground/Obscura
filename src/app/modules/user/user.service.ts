import { userRepo } from "./user.repository";
export const userService = {
  list: () => userRepo.findAll(),
  create: (data: any) => userRepo.insert(data),
};
