import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { ApiError } from "../errors/ApiError";

class AddressController {
  async create(req: Request, res: Response) {
    const { id: userId } = req.user;
    const { type, street, number, neighborhood, city, state, zipcode } =
      req.body;

    if (
      !type ||
      !street ||
      !number ||
      !neighborhood ||
      !city ||
      !state ||
      !zipcode
    ) {
      throw new ApiError("error.address.requiredFields", 400);
    }

    const newAddress = await prisma.address.create({
      data: {
        userId,
        ...req.body,
      },
    });

    return res.status(201).json(newAddress);
  }

  async list(req: Request, res: Response) {
    const { id: userId } = req.user;
    const addresses = await prisma.address.findMany({
      where: { userId },
    });
    return res.status(200).json(addresses);
  }

  async update(req: Request, res: Response) {
    const { id: userId } = req.user;
    const { addressId } = req.params;

    const updatedAddress = await prisma.address.update({
      where: { id: addressId, userId },
      data: req.body,
    });

    return res.status(200).json(updatedAddress);
  }

  async delete(req: Request, res: Response) {
    const { id: userId } = req.user;
    const { addressId } = req.params;

    await prisma.address.delete({
      where: { id: addressId, userId },
    });

    return res.status(204).send();
  }
}

export default new AddressController();
