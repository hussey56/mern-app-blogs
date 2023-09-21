const Joi = require('joi');
const fs = require('fs');
const Blog = require('../model/blog');
const Comment = require('../model/comment');
const {BACKEND_SERVER_PATH} = require('../config/index');
const BlogDTO = require('../dto/blog');
const BlogDetailsDTO = require('../dto/blog_details');
const MongoDbPattern = /^[0-9a-fA-F]{24}$/
const blogController = {

    async create(req,res,next){
        //1. validate request  body
        //2.handle photo storage and naming
    //======>clientside ->base 64 encoded string ->decode ->store ->save photos path db
        //3.add to db
        //4.retrun response

        const createBlogSchema =  Joi.object({
            title:Joi.string().required(),
            author:Joi.string().regex(MongoDbPattern).required(),
            content:Joi.string().required(),
            photo:Joi.string().required()
        })
        const {error} = createBlogSchema.validate(req.body);
        if(error){
            return next(error);
        }

        const {title,author,content,photo} =req.body

        //photo decoding
        //*read as buffer
        const buffer = Buffer.from(photo.replace('/data:image\/(png|jpg|jpeg);base64,/',''),'base64');

        //*allot a name
const imagePath = `${Date.now()}-${author}.png`;
        //*save locally
try {
    fs.writeFileSync(`storage/${imagePath}`,buffer)
} catch (error) {
  return next(error);  
}
//saving blog to database 
let newBlog;
 try {
  newBlog  = new Blog({
    title,
    author,
    content,
    photoPath:`${BACKEND_SERVER_PATH}/storage/${imagePath}`
 });
 await newBlog.save();
 } catch (error) {
    return next(error);  
 }
 const blogDto = new BlogDTO(newBlog);
return res.status(201).json({blog:blogDto})
    },
    async getAll(req,res,next){
        try {
            const blogs = await Blog.find({});
            const blogDto = [];
            for(let i=0; i < blogs.length ; i++){
                const dto = new BlogDTO(blogs[i]);
                blogDto.push(dto);
            }
            return res.status(200).json({blogs:blogDto})
        } catch (error) {
           return next(error); 
        }
    },
    async getById(req,res,next){
        const getbyIdSchema = Joi.object({
            id:Joi.string().regex(MongoDbPattern).required()
        });
        const {error} = getbyIdSchema.validate(req.params);
        if(error){
            return next(error);
        }
        let blog;
        const {id} = req.params;
        try {
            blog = await Blog.findOne({_id:id}).populate('author')
        } catch (error) {
            return next(error);
        }
        const blogdto = new BlogDetailsDTO(blog);
        return res.status(200).json({blog:blogdto});
    },
    async update(req,res,next){
        const UpdateBlogSchema = Joi.object({
            title:Joi.string().required(),
            content:Joi.string().required(),
            author:Joi.string().regex(MongoDbPattern).required(),
            blogId:Joi.string().regex(MongoDbPattern).required(),
            photo:Joi.string()
        });
        const {error} = UpdateBlogSchema.validate(req.body);
        if(error){
            return next(error);
        }
        const {title,content,author,blogId,photo} = req.body
        let blog;
try {
    blog = await Blog.findOne({_id:blogId})
} catch (error) {
    return next(error);
}

if(photo){
    let previousPhoto = blog.photoPath;
    previousPhoto = previousPhoto.split('/').at('-1');

    fs.unlinkSync(`storage/${previousPhoto}`);
      //photo decoding
        //*read as buffer
        const buffer = Buffer.from(photo.replace('/data:image\/(png|jpg|jpeg);base64,/',''),'base64');

        //*allot a name
const imagePath = `${Date.now()}-${author}.png`;
        //*save locally
try {
    fs.writeFileSync(`storage/${imagePath}`,buffer)
} catch (error) {
  return next(error);  
}
await Blog.updateOne({_id:blogId},
    {title,content,photoPath:`${BACKEND_SERVER_PATH}/storage/${imagePath}`}
    );
}else{
    await Blog.updateOne({_id:blogId},
        {title,content}
        );
}
return res.status(200).json({message:"Blog Updated"})

    },
    async delete(req,res,next){
        const deleteBlogSchema  =Joi.object({
            id:Joi.string().regex(MongoDbPattern).required()
        });
        const {error} = deleteBlogSchema.validate(req.params);
        if(error){
            return next(error);
        }
        let blog;
        const {id} =  req.params
        try {
            blog = await Blog.findOne({_id:id})
        } catch (error) {
            return next(error);
        }
        if(blog){
            let previousPhoto = blog.photoPath;
            previousPhoto = previousPhoto.split('/').at('-1');
        
            fs.unlinkSync(`storage/${previousPhoto}`);
            try {
                await Blog.deleteOne({_id:id});
                await Comment.deleteMany({_id:id});
            } catch (error) {
                return next(error);  
            }
            return res.status(200).json({message:'blog Deleted'});
        }else{
            return res.status(201).json({message:'blog does not exist'});

        }
       
    }
}
module.exports =  blogController