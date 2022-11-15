const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
require("dotenv").config();
const jwt = require('jsonwebtoken');

// middle wares
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("swipe for food server is running...");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.a31ucvz.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// jwt
function verifyJWT(req,res,next){
  const author = req.headers.authorization;
  if(!author){
    return res.status(403).send({message : 'unauthorize access'})
  };
  const token = author.split(' ')[1];
  jwt.verify(token, process.env.TOKEN, function(err,decoded){
    if(err){
      return res.status(401).send({message : 'unauthorize access'})
    }
    req.decoded = decoded;
    next();
  })
};

async function run() {
  try {
    const serviceCollection = client
      .db("swipeForFood")
      .collection("foodServices");

    const reviewCollection = client.db("swipeForFood").collection("foodReview");

    // jwt token
    app.post('/jwt', (req,res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.TOKEN,{expiresIn : '10h'});
      res.send({token});
    });

    app.get("/servicehome", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const result = await cursor.limit(3).toArray();
      res.send(result);
    });

    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await serviceCollection.findOne(query);
      res.send(result);
    });

    app.post('/services', async (req,res) => {
      const query = req.body;
      const result = await serviceCollection.insertOne(query);
      res.send(result);
      console.log(result)
    })

    // review api
    app.get("/review/:id", async (req, res) => {
      const id = req.params.id;
      const query = { reviewId: id };
      const cursor = reviewCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/rev/:id", async (req, res) => {
      const id = req.params.id;
      // const query = { reviewId: id };
      const query = {_id : ObjectId(id)};
      const cursor = await reviewCollection.findOne(query);
      res.send(cursor);
    });

    app.post("/review", async (req, res) => {
      const query = req.body;
      const result = await reviewCollection.insertOne(query);
      res.send(result);
      console.log(result);
    });

    app.delete('/review/:id', async (req,res) => {
      const id = req.params.id;
      const query = {_id : ObjectId(id)};
      const result = await reviewCollection.deleteOne(query);
      res.send(result);
    });

    app.get('/review/:id', async (req,res) => {
      const id = req.params.id;
      console.log(id);
      const query = {_id: ObjectId(id)};
      const result = await reviewCollection.findOne(query);
      res.send(result);
      console.log(result);
    });

    app.patch('/review/:id', async (req,res) => {
      const id = req.params.id;
      const filtered = {_id: ObjectId(id)};
      const updateReview = req.body;
      const updateDoc = {
          $set: {
            name : updateReview.name,
            message : updateReview.message,
          }
      }
      // console.log(updateDoc)
      const result = await reviewCollection.updateOne(filtered,updateDoc);
      res.send(result);
      console.log(result)
    });


    app.get("/review",verifyJWT, async (req, res) => {
      const decoded = req.decoded
      if(decoded.email !== req.query.email){
        return res.status(403).send({message : 'unauthorize review access'})
      }
      // console.log(req.headers.authorization)

      let query = {};
      if (req.query.email) {
        query = {
          email: req.query.email,
        };
      };
      const cursor = reviewCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // app.get('/review/:id')

    app.get("/review", async (req, res) => {
      // const id = req.params.id;
      // const query = {_id: ObjectId(id)};
      let query = {};
      if (req.query.reviewId) {
        query = {
          reviewId: req.query.reviewId,
        };
      }
      // console.log(query);
      const cursor = reviewCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
  } finally {
  }
}
run().catch((error) => console.log(error));

app.listen(port, () => {
  console.log(`swipe for food server is running port ${port}`);
});
