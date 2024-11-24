const express =  require('express');
const mongoose = require('mongoose');
const cors = require('cors')
const multer = require('multer')
const path = require('path')
const usermodel = require('./usermodel')
const countermodel = require('./countermodel')
const empmodel = require('./empmodel')
const fs = require('fs')

const app = express();
app.use(express.json())
app.use(cors());

mongoose.connect("mongodb://localhost:27017/task")
.then(()=>console.log("connect to DB"))
.catch((err)=>console.log(err))

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname,'profileimf');
        if(!fs.existsSync(dir)){
            fs.mkdirSync(dir,{recursive: true});
        }
        cb(null,dir)
    },
    filename:( req, file, cb)=>{
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({
    storage: storage
})

app.post('/register', async (req,res)=>{
try{
    
    let seqId;
    const counterdoc =await countermodel.findOneAndUpdate(
        {id:"autoinc"},
        {"$inc":{"seq":1}},
        {new:true, upsert:true}    
    );
    if(counterdoc){
        seqId = counterdoc.seq;
    }else{
        const newCounter = new countermodel({ id: "autoinc", seq: 1 });
        const savedCounter = await newCounter.save();
        seqId = savedCounter.seq;
    }
    const{username,password}=req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    const exituser = await usermodel.findOne({username:username})
        if(exituser){
            res.status(400).json({error:'username already exist'});
            res.json("fail")
        }
        else{
           const newuser =await usermodel.create({
                sno:seqId,
                username:username,
                password:password
            })
            console.log(newuser);
            res.json("go")
        }}
    catch(err){
        console.error(err);
        res.status(500).json({err: 'server error'})
    }

})

app.post('/login',(req,res)=>{
    const {username,password} = req.body;
    usermodel.findOne({username:username})
    .then(user =>{
        if(user){
            if(user.password===password){
                res.json("login");
            }
            else{
                res.json(0)
            }
}})
})

app.use('/profileimf', express.static(path.join(__dirname,'profileimf')));

app.get('/fetchdata',(req,res)=>{
    empmodel.find()
    .then(details=>{
        res.json(details)
    })
    .catch(err=>res.json(err))
})

const generaterandom = async()=>{
    let isunique = false;
    let randomId;
    while(!isunique){
        randomId = Math.floor(100000 + Math.random() * 900000);
        const emp = await empmodel.findOne({id:randomId});
        if(!emp){
            isunique = true;
        }
    }
    return randomId;
};

app.post('/addemployee',upload.single('img'), async(req,res)=>{
    try{
    const{name,email,mobile,desig,gender,course} = req.body;
    const id = await generaterandom();
    const newemp = new empmodel({
        id : id,
        profileimg : req.file.filename,
        name,
        email,
        mobile,
        desig,
        gender,
        course
    });

    await newemp.save();
    res.json(newemp)
    console.log(newemp);
    
}catch(err){
    console.error(err);
    res.status(500).json({error:"Server error"});
}
})

app.put('/updateemp/:id', upload.single('profileimg'),async(req,res)=>{
  const { id } = req.params;
  const { name, email, mobile, desig, gender, course } = req.body;
    
    try {
        const updateData = {
          name,
          email,
          mobile,
          desig,
          gender,
          course: Array.isArray(course) ? course : course.split(',')
        };
    
        if (req.file) {
          updateData.profileimg = req.file.filename;
        }
    
        const updatedEmployee = await empmodel.findOneAndUpdate(
          { id: id },
          updateData,
          { new: true } 
        );
    
    if (!updatedEmployee) {
      return res.json({ message: 'Employee not found' });
    }

    res.json({message:'employee not found'});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
})

app.delete('/deleteemp/:id', async(req,res)=>{
    const { id } = req.params;
    try{
        const employee = await empmodel.findOne({ id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (employee.profileimg) {
      const imagePath = path.join(__dirname, 'profileimf', employee.profileimg);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
        await empmodel.deleteOne({ id });
        res.json({ message: 'Employee deleted successfully' });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
      }
})

const port = 3000;
app.listen(port,()=>{
    console.log("server is running in "+port+" port");
})