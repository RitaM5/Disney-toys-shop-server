const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;
//middleware
const corsConfig = {
  origin: '*',
  Credential: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
}
app.use(cors(corsConfig));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.n3rdf37.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // client.connect();
    const productsCollection = client.db('DisneyDollsDB').collection('products');
    app.get('/products', async (req, res) => {
      const limit = parseInt(req.query.limit) || 20;
      const cursor = productsCollection.find();
      const result = await cursor.limit(limit).toArray();
      res.send(result);
    });
    const searchToys = { toy_name: 1, category: 1 };
    const searchOptions = { name: "toy_nameCategory" };
    const result = await productsCollection.createIndex(searchToys, searchOptions);
    app.get('/toysSearch/:text', async (req, res) => {
      const searchText = req.params.text;
      const result = await productsCollection.find({
        $or: [
          { toy_name: { $regex: searchText, $options: "i" } },
          { category: { $regex: searchText, $options: "i" } },
        ],
      }).toArray();
      res.send(result)
    });
    //for category
    app.get('/products/:text', async (req, res) => {
      if (req.params.text == "disney"
        || req.params.text == "frozen"
        || req.params.text == "animation") {
        const result = await productsCollection.find(
          { category: req.params.text }
        ).toArray();
        res.send(result);
      }
    });
    //for details btn
    app.get('/product/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const options = {
        projection: { toy_img: 1, toy_name: 1, displayName: 1, category: 1, email: 1, price: 1, ratings: 1, quantity: 1, description: 1, products_id: 1 },
      };
      const result = await productsCollection.findOne(query);
      res.send(result);

    });
    //for my toys data
    app.get('/sellerToys', async (req, res) => {
      console.log(req.query.email);
      let query = {};
      try {
        if (req.query?.email) {
          query = { email: req.query.email }
          const sort = req.query?.sort == 'true' ? 1 : -1;
          const result = await productsCollection.find(query).sort({ price: sort }).toArray();
          res.send(result);
        }
        else {
          res.status(404).send({ error: true, message: "Email not found" })
        }
      }
      catch {
        res.status(401).send({ error: true, message: "Unauthorized" })
      }

    })
    //for add toys
    app.post('/products', async (req, res) => {
      const addToys = req.body;
      console.log(addToys);
      const result = await productsCollection.insertOne(addToys);
      res.send(result);
    });
  //for delete 
  app.delete('/product/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) }
    const result = await productsCollection.deleteOne(query);
    res.send(result);
})

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('disney dolls is running')
})

app.listen(port, () => {
  console.log(`Disney Dolls Server is running on port ${port}`)
})
