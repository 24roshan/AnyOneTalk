import bcrypt from "bcrypt";

export const hashPassword = (plainText) => bcrypt.hashSync(plainText, 10);
export const comparePassword = (plainText, hash) =>
  bcrypt.compareSync(plainText, hash);
