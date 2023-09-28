require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const md5 = require("md5");
const bcrypt = require('bcrypt');
const saltRounds = 10;

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
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        const newUser = new User({
            email : req.body.username,
            password : hash
        });
        newUser.save().then((rs)=>{
            if(rs){
                res.render("secrets");
            }else{
                console.log("not inserted data soething went wrong ");
            }
        }).catch((err)=>{
            console.log(" db error : "+err);
        });
    });
});

app.post("/login",async (req,res)=>{
    const username=req.body.username;
    const password=req.body.password;
    const user = await User.findOne({ email: username }).exec();
    if(user){
        bcrypt.compare(password, user.password, function(err, result) {
            if(result){
                res.render("secrets");
            }else{
                res.redirect("/login");
            }
        });
    }else{
        res.redirect("/login");
    }
});

app.listen(3000,()=>{
    console.log("app lising on port 3000 ");
})