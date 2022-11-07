const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 5000;
require("dotenv").config();

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

async function run() {
    try{
        const serviceCollection = client.db("swipeForFood").collection("foodServices");

        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const result = await cursor.limit(3).toArray();
            res.send(result);
        })

    }
    finally{

    }
}
run().catch(error => console.log(error));


app.listen(port, () => {
  console.log(`swipe for food server is running port ${port}`);
});
