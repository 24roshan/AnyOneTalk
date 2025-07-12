import bcrypt from "bcryptjs";

export const hashPassword = (plainPassword) => {
  return bcrypt.hashSync(plainPassword, 10);
};

export const comparePassword = (plainPassword, hashedPassword) => {
  return bcrypt.compareSync(plainPassword, hashedPassword);
};
