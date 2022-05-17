require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
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
    const item = { id: '1', name: 'Carolina Herrera' };
    const result = await itemCollection.insertOne(item);
    console.log(result);
  } finally {
    //await client.close();
  }
}

//run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Running on port 5000');
});
