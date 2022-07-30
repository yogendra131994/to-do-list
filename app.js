//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require('mongoose');
const _=require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://yogendrapawar:Kepma%40Guitar@cluster0.ybk4v.mongodb.net/todolistDB",{useNewUrlParser:true });
const itemsSchema=new mongoose.Schema({
  name:String
});
const item = mongoose.model("item",itemsSchema);

const item1=new item({
  name:"Welcome to the app"
});
const item2=new item({
  name:"Press + to add item "
});
const item3=new item({
  name:"Press backspace to delete item"
});

var defaultItems=[item1, item2,item3];
const customSchema=mongoose.Schema({
  name:String,
  items:[itemsSchema]
});

const customitem=mongoose.model("customitem",customSchema);



app.get("/", function(req, res) {
  item.find({},function(err,results){

    if(results==0)
    {item.insertMany(defaultItems,function(err){
      if (err){
        console.log(err);
      }else{
        console.log("Successfully uploaded default data");
      }
    });
  res.redirect("/");}else{
    res.render("list", {listTitle: "Today", newListItems: results});
  }

  });
});

app.get("/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName);
  customitem.findOne({name:customListName},function(err,found){
    if(!found){
      const cusitem=new customitem({
        name:customListName,
        items:defaultItems
      });
      cusitem.save();
      res.redirect("/");
    }
    else{
      res.render("list",{listTitle:found.name, newListItems:found.items});
    }
  });

});


app.post("/done",function(req,res){
  var checked=req.body.checkedItem;
  const listName=req.body.listName;

if(listName==="Today"){
  item.findByIdAndRemove(checked,function(err){
    if (err){
        console.log("Error");
    }else{console.log("Success checked");
    res.redirect("/");
  }

  });
}else{
  customitem.findOneAndUpdate({name:listName},{$pull:{items:{ _id:checked}}},function(err,found){
    if(!err){
      res.redirect("/"+listName);
    }
  });
}


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const customlist=req.body.list;

  const newItem=new item({
    name:itemName
  });
  if(customlist==="Today")
  {
    newItem.save();
    console.log("it is "+customlist);
    res.redirect("/");

  }else{
    customitem.findOne({name:customlist},function(err,found){
      found.items.push(newItem);
      found.save();
      res.redirect("/"+customlist);
    });
  }



});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

let port=process.env.PORT;
if(port===null||port===""){
  port=3000;
}
app.listen(port);


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
