import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { ApiError } from "../errors/ApiError";

class PhoneController {
  async create(req: Request, res: Response) {
    const { id: userId } = req.user;
    const { type, countryCode, areaCode, number } = req.body;

    if (!type || !countryCode || !areaCode || !number) {
      throw new ApiError("error.phone.requiredFields", 400);
    }

    const findPhone = await prisma.phone.findUnique({
      where: {
        countryCode_areaCode_number: {
          countryCode,
          areaCode,
          number,
        },
      },
    });

    if (findPhone) {
      throw new ApiError("error.phone.alreadyExists", 409);
    }

    const newPhone = await prisma.phone.create({
      data: {
        userId,
        ...req.body,
      },
    });

    return res.status(201).json(newPhone);
  }

  async list(req: Request, res: Response) {
    const { id: userId } = req.user;
    const phones = await prisma.phone.findMany({
      where: { userId },
    });
    return res.status(200).json(phones);
  }

  async update(req: Request, res: Response) {
    const { id: userId } = req.user;
    const { phoneId } = req.params;

    const updatedPhone = await prisma.phone.update({
      where: { id: phoneId, userId },
      data: req.body,
    });

    return res.status(200).json(updatedPhone);
  }

  async delete(req: Request, res: Response) {
    const { id: userId } = req.user;
    const { phoneId } = req.params;

    await prisma.phone.delete({
      where: { id: phoneId, userId },
    });

    return res.status(204).send();
  }
}

export default new PhoneController();
