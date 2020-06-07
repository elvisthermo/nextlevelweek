import Knex from "knex";
const configuration = require('../../knexfile');
export const connection = Knex(configuration.development);