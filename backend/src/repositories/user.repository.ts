import prisma from "../lib/prisma";
import { Prisma } from "@prisma/client";

export const userRepository = {
  async create(data: Prisma.UserCreateInput) {
    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        passwordHash: data.passwordHash,
        phoneNumber: data.phoneNumber,
        gender: data.gender,
        address: data.address,
        avatar: data.avatar,
        role: data.role,
      },
    });
    return user;
  },

  async update(id: string, data: Prisma.UserUpdateInput) {
    const updatedUser = await prisma.user.update({
      where: { id },
      data,
    });
    return updatedUser;
  },

  async delete(id: string) {
    const deletedUser = await prisma.user.delete({
      where: {
        id,
      },
    });
    return deletedUser;
  },

  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    return user;
  },

  async findByEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    return user;
  },

  async findByUsername(username: string) {
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });
    return user;
  },

  async findAll(isActive?: boolean) {
    const users = await prisma.user.findMany({
      where: {
        ...(isActive !== undefined && { isActive }),
      },
    });
    return users;
  },

  async findByRole(role: "ADMIN" | "HAIRDRESSER" | "CUSTOMER", isActive?: boolean) {
    const users = await prisma.user.findMany({
      where: {
        role,
        ...(isActive !== undefined && { isActive }),
      },
    });
    return users;
  },
};