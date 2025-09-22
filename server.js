import express from "express";
import bodyParser from "body-parser";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Setup LowDB
const adapter = new JSONFile("db.json");
const db = new Low(adapter, { users: [] });

// Initialize DB
await db.read();
db.data ||= { users: [] };
await db.write();

// CREATE
app.post("/users", async (req, res) => {
  await db.read();
  const newUser = { id: Date.now(), ...req.body };
  db.data.users.push(newUser);
  await db.write();
  res.status(201).json(newUser);
});

// READ all
app.get("/users", async (req, res) => {
  await db.read();
  res.json(db.data.users);
});

// READ one
app.get("/users/:id", async (req, res) => {
  await db.read();
  const user = db.data.users.find(u => u.id == req.params.id);
  if (!user) return res.status(404).send("User not found");
  res.json(user);
});

// UPDATE
app.put("/users/:id", async (req, res) => {
  await db.read();
  const user = db.data.users.find(u => u.id == req.params.id);
  if (!user) return res.status(404).send("User not found");

  user.name = req.body.name ?? user.name;
  user.email = req.body.email ?? user.email;
  await db.write();
  res.json(user);
});

// DELETE
app.delete("/users/:id", async (req, res) => {
  await db.read();
  db.data.users = db.data.users.filter(u => u.id != req.params.id);
  await db.write();
  res.sendStatus(204);
});

// Root
app.get("/", (req, res) => {
  res.send("✅ CRUD API is running! Use /users endpoint.");
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ API running on http://localhost:${PORT}`);
});
