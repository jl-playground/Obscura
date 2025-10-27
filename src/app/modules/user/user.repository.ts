export const userRepo = {
  findAll: () => [{ id: 1, name: "Example User" }],
  insert: (data: any) => ({ id: Date.now(), ...data }),
};
