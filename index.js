const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

//[Routes]
const userRoutes = require("./routes/user");
const postRoutes = require("./routes/post");


//[Server Setup]
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));   

const corsOptions = {
    origin: [`http://localhost:8000`, 
        'http://localhost:3000', 
        'http://zuitt-bootcamp-prod-461-7670-delavictoria.s3-website.us-east-1.amazonaws.com', 
        'https://blog-app-frontend-ecru.vercel.app/',
        'https://movie-app-frontend-theta.vercel.app'    
    ],
    credentials: true, 
    optionsSuccessStatus:200 
};
app.use(cors(corsOptions));

//[Database Connection]
mongoose.connect('mongodb+srv://admin:admin123@wdc028-b461.c4soc.mongodb.net/blog-app-api?retryWrites=true&w=majority&appName=WDC028-B461');
mongoose.connection.once('open',()=>console.log("Now connected to MongoDB Atlas"));

//app.use('/b7/uploads', express.static('uploads'));
//[Backend Routes]
app.use("/users", userRoutes);
app.use("/posts", postRoutes);



if(require.main === module){
    app.listen( process.env.PORT || 4000, () => {
        console.log(`API is now online on port ${ process.env.PORT || 4000 }`)
    });
}

module.exports = { app, mongoose };