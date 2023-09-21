const express = require('express');
const authController = require('../controller/authController');
const Router = express.Router();
const auth = require('../middleware/auth');
const blogController = require('../controller/blogController');
const commentController = require('../controller/commentController');
//testing
Router.get('/test',(req,res)=>res.json({msg:"Working Sir!"}));
// #authantication
//login
Router.post('/login',authController.login);
//register
Router.post('/register',authController.register);

//logout
Router.post('/logout',auth,authController.logout);

//refresh
Router.get('/refresh',authController.refresh);
 // #blog

 // create blog
 Router.post('/blog',auth,blogController.create);

 // get all
 Router.get('/blog/all',auth,blogController.getAll);
 // get blog by id
 Router.get('/blog/:id',auth,blogController.getById);

 //update blog
 Router.put('/blog',auth,blogController.update);
  // delete blog
  Router.delete('/blog/:id',auth, blogController.delete);
  
  // #comment

  // create comment
  Router.post('/comment',auth,commentController.create);

// read comments 
Router.get('/comment/:id',auth,commentController.getbyId);


module.exports = Router