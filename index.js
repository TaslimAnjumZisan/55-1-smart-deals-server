const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;
console.log(process.env);
//middleware

app.use(cors());
app.use(express.json())
//local DB
// const uri = "mongodb://127.0.0.1:27017"

//cloud db

const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@ac-ufsb0iy-shard-00-00.ce1gags.mongodb.net:27017,ac-ufsb0iy-shard-00-01.ce1gags.mongodb.net:27017,ac-ufsb0iy-shard-00-02.ce1gags.mongodb.net:27017/?ssl=true&replicaSet=atlas-msfyob-shard-0&authSource=admin&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


app.get('/', (req, res) => {
    res.send(' Smart server is running now')
})

async function run() {

    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        // Connect to the "smart_db" database and access its "productsCollection" and "bidsCollection" collection
        const db = client.db("smart_db");
        const productsCollection = db.collection("products");
        const bidsCollection = db.collection('bids')

        const usersCollection = db.collection('users');


        app.post('/users', async (req, res) => {
            const newUser = req.body;


            const email = req.body.email;
            const query = { email: email }
            const existingUser = await usersCollection.findOne(query);
            if (existingUser) {
                // res.send("user already exist. do not need to insert again");
                res.send({
                    message: "User already exists. Do not insert again."
                });
            } else {
                const result = await usersCollection.insertOne(newUser)
                res.send(result);
            }


        })

        //GET api for products

        app.get('/products', async (req, res) => {
            // const projectFields = {_id:0, title:1}
            // const cursor= productsCollection.find().sort({price_min:-1}).skip(2).limit(5);

            console.log(req.query);
            const email = req.query.email;
            const query = {}
            if (email) {
                query.email = email;
            }
            const cursor = productsCollection.find(query)
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/latest-products', async(req,res)=>{
            const cursor= productsCollection.find().sort({created_at:-1}).limit(6)
            const result = await cursor.toArray();
            res.send(result);
        })


        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await productsCollection.findOne(query);
            res.send(result);
        })

        

        //POST api for PRODUCT
        app.post('/products', async (req, res) => {
            const newProduct = req.body;
            const result = await productsCollection.insertOne(newProduct)
            res.send(result)
        })

        //PATCH api for PRODUCT
        app.patch('/products/:id', async (req, res) => {
            const id = req.params.id;
            const updatedProduct = req.body;
            const query = { _id: new ObjectId(id) }
            const update = {
                $set: {
                    name: updatedProduct.name,
                    price: updatedProduct.price,
                }
            }
            // const options={}
            const result = await productsCollection.updateOne(query, update)
            res.send(result)


        })

        //Delete api for PRODUCT
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await productsCollection.deleteOne(query);
            res.send(result)
        })

        //bids related apis

        app.get('/bids', async (req, res) => {
            const email = req.query.buyer_email;
            const query = {};
            if (email) {
                query.buyer_email = email
            }
            const cursor = bidsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/products/bids/:productId',async(req,res)=>{
            const productId  =req.params.productId;
            const query = {product:productId};
            const cursor = bidsCollection.find(query).sort({bid_price: -1});
            const result = await cursor.toArray();
            res.send(result);

        })

        app.get('/bids',async(req,res)=>{
            const query={};
            if(query.email){
                query.buyer_email=email;
            }


            const cursor =bidsCollection.find();
            const result= await cursor.toArray();
            res.send(result);
        })


        app.post('/bids', async (req, res) => {
            const newBid = req.body;
            const result = await bidsCollection.insertOne(newBid);
            res.send(result);
        })

        app.delete('/bids/:id', async(req,res)=>{
            const id = req.params.id;
            const query ={_id: new ObjectId(id)}
            const result = await bidsCollection.deleteOne(query);
            res.send(result);

        })



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {


    }
}

run().catch(console.dir);

app.listen(port, () => {
    console.log(`Smart server is running on port : ${port}`);
})


//Another way to connect 
// client.connect()
// .then( () =>{
//     app.listen(port, () =>{
//     console.log(`Smart server is running on port : ${port}`);
// })
// })
// .catch(console.dir)

