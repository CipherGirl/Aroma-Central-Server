require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');

const { port, dbUserName, dbUserPassword } = process.env;

const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${dbUserName}:${dbUserPassword}@cluster0.jrcuo.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const itemCollection = client.db('warehouse').collection('items');

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
      console.log(id);
      const query = { _id: ObjectId(id) };
      const items = await itemCollection.findOne(query);
      res.send(items);
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

    app.delete('/items/:id', async (req, res) => {
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
