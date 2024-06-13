const express=require('express');
const app=express();
const cors=require('cors');

app.use(cors());
const port=3001;
app.listen(port,()=>{
    console.log(`server running on port ${port}`)
})