const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;
//middleware
//https://disney-dolls-server.vercel.app
const corsConfig = {
    origin: '*',
    Credential: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
}
app.use(cors());
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
    await client.connect();
    const productsCollection = client.db('DisneyDollsDB').collection('products');
    app.get('/products', async (req, res) => {
      const limit = parseInt(req.query.limit) || 20;
      const cursor = productsCollection.find();
      const result = await cursor.limit(limit).toArray();
      res.send(result);
  })
  app.get('/products/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) }
    const options = {
        projection: { toy_img: 1, toy_name: 1, displayName: 1, email:1, price:1, ratings:1, quantity:1, description: 1, products_id:1 },
    };
    const result = await productsCollection.findOne(query, options);
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
 