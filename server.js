import express from "express";
import bodyParser from "body-parser";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Setup LowDB
const adapter = new JSONFile("db.json");
const db = new Low(adapter, { users: [] });

// Initialize DB
await db.read();
db.data ||= { users: [] };
await db.write();

// CREATE user with ID in URL
app.post("/users/:id", async (req, res) => {
  await db.read();
  const userId = req.params.id;

  // Check if ID already exists
  const existing = db.data.users.find(u => u.id === userId);
  if (existing) {
    return res.status(400).json({ error: "ID already exists" });
  }

  // Create new user
  const newUser = { id: userId, name: req.body.name, email: req.body.email };
  db.data.users.push(newUser);
  await db.write();
  res.status(201).json(newUser);
});

// READ all users
app.get("/users", async (req, res) => {
  await db.read();
  res.json(db.data.users);
});

// READ single user by ID
app.get("/users/:id", async (req, res) => {
  await db.read();
  const user = db.data.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).send("User not found");
  res.json(user);
});

// UPDATE user by ID
app.put("/users/:id", async (req, res) => {
  await db.read();
  const user = db.data.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).send("User not found");

  user.name = req.body.name ?? user.name;
  user.email = req.body.email ?? user.email;
  await db.write();
  res.json(user);
});

// DELETE user by ID
app.delete("/users/:id", async (req, res) => {
  await db.read();
  const prevLength = db.data.users.length;
  db.data.users = db.data.users.filter(u => u.id !== req.params.id);
  await db.write();

  if (db.data.users.length === prevLength) {
    return res.status(404).send("User not found");
  }
  res.sendStatus(204);
});

// Root
app.get("/", (req, res) => {
  res.send("✅ CRUD API is running! Use /users endpoints.");
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ API running on port ${PORT}`);
});
