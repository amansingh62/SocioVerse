import bcrypt from "bcrypt";

export const hashPassword = (password: string) => {
    return bcrypt.hash(password, 12);
};

export const comparePassword = (password: string, hashed: string) => {
    return bcrypt.compare(password, hashed);
};