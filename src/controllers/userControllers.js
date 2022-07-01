import dotenv from "dotenv";
import joi from "joi";
import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";

dotenv.config();

const cliente = new MongoClient(process.env.MONGO_URL);
let db;
cliente.connect().then(() => {
  db = cliente.db(process.env.MONGO_NAME);
});

export async function createUser(req, res) {
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
      .find({ email: req.body.email })
      .toArray();
    if (emailExiste.length !== 0) {
      return res.status(422).send("E-mail já cadastrado!");
    }
  } catch (error) {
    res.send(error);
  }
  const senhaSegura = bcrypt.hashSync(req.body.senha, 10);
  await db.collection("users").insertOne({
    nome: req.body.nome,
    email: req.body.email,
    senha: senhaSegura,
    saldo: 0,
  });
  res.sendStatus(201);
}

export async function loginUser(req, res) {
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
}

export async function transacaoUser(req, res) {
  const transacaoSchema = joi.object({
    desc: joi.string().required(),
    valor: joi.number().required(),
  });

  const { error } = transacaoSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const erros = error.details.map((detail) => detail.message);
    return res.status(422).send(erros);
  }

  const { section } = res.locals;

  let data = new Date();

  await db.collection("transacoes").insertOne({
    userId: section.userId,
    desc: req.body.desc,
    valor: Number(req.body.valor),
    data: data.toLocaleString(),
  });

  let usuario = await db.collection("users").findOne({ _id: section.userId });
  const saldo = Number(usuario.saldo) + Number(req.body.valor);

  await db
    .collection("users")
    .updateOne({ _id: section.userId }, { $set: { saldo: saldo } });

  res.sendStatus(200);
}

export async function transacoesUser(req, res) {
  const { section } = res.locals;

  const transacoes = await db
    .collection("transacoes")
    .find({ userId: section.userId })
    .toArray();
  const usuario = await db.collection("users").findOne({ _id: section.userId });

  res.send({
    usuario,
    transacoes: transacoes,
  });
}
