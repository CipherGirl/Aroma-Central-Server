require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const { dbUserName, dbUserPassword } = process.env;

const port = process.env.PORT || '5000';

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  res.header({ 'Access-Control-Allow-Origin': '*' });
  next();
});

const uri = `mongodb+srv://${dbUserName}:${dbUserPassword}@cluster0.jrcuo.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    client.connect();
    const itemCollection = client.db('warehouse').collection('items');

    //==========
    //JWT Login
    //==========

    app.post('/login', (req, res) => {
      const email = req.body;

      const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET);

      res.send({ token });
    });

    //=========
    //Items API
    //=========

    app.get('/items', async (req, res) => {
      const query = {};
      const cursor = itemCollection.find(query);
      const items = await cursor.toArray();
      res.send(items);
    });

    app.get('/items/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const items = await itemCollection.findOne(query);
      res.send(items);
    });

    //==========
    //User Items
    //===========
    app.get('/user/items', async (req, res) => {
      const tokenInfo = req.headers.authorization;

      const [email, accessToken] = tokenInfo.split(' ');

      const decoded = verifyToken(accessToken);

      if (email === decoded.email) {
        const userItems = await itemCollection
          .find({ userEmail: email })
          .toArray();
        res.status(200).send(userItems);
      } else {
        res.status(401).send({ success: 'UnAuthoraized Access' });
      }
    });

    //==========
    //Post Item
    //==========

    app.post('/addItem', async (req, res) => {
      const newItem = req.body;
      const result = await itemCollection.insertOne(newItem);
      res.send(result);
    });

    //=======
    // DELETE
    //=======

    app.delete('/delete/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await itemCollection.deleteOne(query);
      res.send(result);
    });

    //====
    //Put
    //===

    app.put('/update/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id, req.body);
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };

      const result = await itemCollection.updateOne(
        filter,
        {
          $set: { quantity: req.body.quantity },
        },
        options
      );
      res.status(200).send(result);
    });
  } finally {
    //await client.close();
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Aroma Central Server is Running!');
});

app.listen(port, () => {
  console.log('Listening to port', port);
});

function verifyToken(token) {
  let email;
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      email = 'Invalid email';
    }
    if (decoded) {
      console.log(decoded);
      email = decoded;
    }
  });
  return email;
}

module.exports = app;
