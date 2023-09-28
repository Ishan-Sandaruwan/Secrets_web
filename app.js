require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

mongoose
.connect("mongodb://127.0.0.1:27017/authentication1", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log("Connected to MongoDB");
})
.catch((err) => {
    console.error("Error connecting to MongoDB:", err);
});

const userShema = new mongoose.Schema({
    email : {
        type: String,
        unique: true , // `email` must be unique
        required: true,
    },
    password : {
        type :String ,
        required: true,
    }
});

userShema.plugin(encrypt,{secret : process.env.SECRET , encryptedFields : ["password"]});

const User = mongoose.model("User", userShema);


const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set('view engine','ejs');

app.get("/",(req,res)=>{
    res.render("home");
});

app.get("/login",(req,res)=>{
    res.render("login");
});

app.get("/register",(req,res)=>{
    res.render("register");
});

app.post("/register",(req,res)=>{
    const newUser = new User({
        email : req.body.username,
        password : req.body.password
    });
    newUser.save().then((rs)=>{
        if(rs){
            res.render("secrets");
        }else{
            console.log("not inserted data soething went wrong ");
        }
    }).catch((err)=>{
        console.log(" db error : "+err);
    })
});

app.post("/login",async (req,res)=>{
    const username=req.body.username;
    const password=req.body.password;
    const user = await User.findOne({ email: username }).exec();
    if(user){
        if(password === user.password){
            res.render("secrets");
        }else{
            res.redirect("/login");
        }
    }else{
        res.redirect("/login");
    }
    // User.findOne({ email: username })
    // .then(user => {
    //     if (user) {
    //         if(password === user.password){
    //             res.render("secrets");
    //         }else{
    //             res.redirect("/login");
    //         }
    //     } else {
    //         console.log("User not found.");
    //         res.redirect("/login");
    //     }
    // })
    // .catch(err => {
    //     console.error(err);
    //     res.redirect("/login");
    // });

    
});

app.listen(3000,()=>{
    console.log("app lising on port 3000 ");
})