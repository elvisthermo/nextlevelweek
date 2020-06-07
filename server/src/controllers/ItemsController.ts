import { Request, Response } from "express";
import { connection } from "../database/connection";

export default class ItemsController {
  async listAll(req: Request, res: Response) {
    const items = await connection('items').select('*');
    const serializedItems = items.map(item => ({
      id: item.id, title: item.title,
      image_url: `http://10.0.0.108:3000/uploads/${item.image}`
    }));
    return res.json(serializedItems);
  }
}