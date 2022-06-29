import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import joi from "joi";
import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import { response } from "express";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const cliente = new MongoClient(process.env.MONGO_URL);
let db;
cliente.connect().then(() => {
  db = cliente.db(process.env.MONGO_NAME);
});

app.post("/cadastro", async (req, res) => {
  const userSchema = joi.object({
    nome: joi.string().min(1).required(),
    email: joi.string().email().required(),
    senha: joi.string().min(6).required(),
  });
  const { error } = userSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const erros = error.details.map((detail) => detail.message);
    return res.status(422).send(erros);
  }
  try {
    const emailExiste = await db
      .collection("users")
      .find({ email: req.body.email });
    if (emailExiste) {
      return res.status(422).send("Email já cadastrado!");
    }
  } catch (error) {
    res.send(error);
  }
  const senhaSegura = bcrypt.hashSync(req.body.senha, 10);
  await db.collection("users").insertOne({
    nome: req.body.nome,
    email: req.body.email,
    senha: senhaSegura,
  });
  res.sendStatus(201);
});

app.post("/login", async (req, res) => {
  const userSchema = joi.object({
    email: joi.string().email().required(),
    senha: joi.string().required(),
  });
  const { error } = userSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const erros = error.details.map((detail) => detail.message);
    return res.status(422).send(erros);
  }
  try {
    const user = await db
      .collection("users")
      .findOne({ email: req.body.email });
    if (user && bcrypt.compareSync(req.body.senha, user.senha)) {
      const token = uuid();
      await db.collection("sections").insertOne({
        userId: user._id,
        token,
      });
      return res.status(200).send({ token });
    } else {
      return res.sendStatus(401);
    }
  } catch (error) {
    return res.send(error);
  }
});

app.listen(5000, () => {
  console.log("Server Running...");
});
