import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const cliente = new MongoClient(process.env.MONGO_URL);
let db;
cliente.connect().then(() => {
  db = cliente.db(process.env.MONGO_NAME);
});

async function validateToken(req, res, next) {
  let { token } = req.headers;
  if (!token) {
    return res.sendStatus(422);
  }
  token = token?.replace("Bearer ", "");
  const section = await db.collection("sections").findOne({ token: token });
  if (!section) {
    return res.sendStatus(404);
  }

  res.locals.section = section;
  next();
}

export default validateToken;
