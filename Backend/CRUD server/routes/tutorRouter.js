const Router=require("express").Router();
const {
    getBestTutors
}=require("../controllers/tutorController");

Router.get('/best',getBestTutors);

module.exports=Router;