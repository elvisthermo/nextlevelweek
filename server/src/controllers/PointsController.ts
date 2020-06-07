import { Request, Response } from "express";
import { connection } from "../database/connection";

export default class PointsController {
  async create(req: Request, res: Response) {
    const {
      name, email, whatsapp, latitude,
      longitude, city, uf, items
    } = req.body;
    const point = {
      image: req.file.filename, name, email, whatsapp,
      latitude, longitude, city, uf
    };
    const trx = await connection.transaction();
    const insertedIds = await trx('points').insert(point);
    const point_id = insertedIds[0];
    const pointItems = items
      .split(',')
      .map((item: string) => Number(item.trim()))
      .map((item_id: number) => ({
        item_id, point_id
      }));
    await trx('point_items').insert(pointItems);
    await trx.commit();
    return res.json({ id: point_id, ...point });
  }

  async show(req: Request, res: Response) {
    const { id } = req.params;
    const point = await connection('points').where('id', id).first();
    if(!point) return res.status(404).json({ message: 'Point not Found'})
    const serializedPoint = {
      ...point,
      image_url: `http://10.0.0.8:3000/uploads/${point.image}`
    };
    const items = await connection('items')
      .join('point_items', 'item.id', '=', 'point_items.item_id')
      .where('point_items.point_id', id)
      .select('items.title');
    return res.json({ serializedPoint, items });
  }

  async index(req: Request, res: Response) {
    const { city, uf, items } = req.query
    const parsetItems = String(items)
      .split(', ').map(item => Number(item.trim()));
    const points = await connection('points')
      .join('point_items', 'points.id', '=', 'point_items.point_id')
      .whereIn('point_items.item_id', parsetItems)
      .where('city', String(city))
      .where('uf', String(uf))
      .distinct()
      .select('points.*');
    const serializedPoints = points.map(point => {
      return {
        ...point,
        image_url: `http://10.0.0.8:3000/uploads/${point.image}`
      }
    })
    return res.json(serializedPoints);
  }
}