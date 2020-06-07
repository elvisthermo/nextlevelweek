import express from "express";
const routes = express.Router();
import { celebrate, Joi } from "celebrate";
import multer from "multer";
import config from "./config/multer";
import PointsController from "./controllers/PointsController";
import ItemsController from "./controllers/ItemsController";

const points = new PointsController();
const items = new ItemsController();
const upload = multer(config);

/** Routes to handle items requests */
routes.get('/items', items.listAll);
/** Routes to handle points requests */
routes.post('/points', 
  upload.single('image'), 
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      whatsapp: Joi.number().required(),
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
      city: Joi.string().required(),
      uf: Joi.string().max(2).required(),
      items: Joi.string().required()
    })
  }, {
    abortEarly: false
  }),
  points.create
);
routes.get('/points/:id', points.show);
routes.get('/points', points.index);

export default routes;