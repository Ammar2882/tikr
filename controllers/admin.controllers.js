
const {Admin }= require("../models/Admin")
const { Bet } = require("../models/Bet")
const { User } = require("../models/User.js")
const { JWT} = require("../utils/generateJWT")
const { encryptPassword, verifyPassword } = require("../utils/passwordFunctions")

exports.adminLogin = async (req,res,next) =>{
    try{
        const {email , password} = req.body
        const admin = await Admin.findOne({email})
        if(!admin){
             return res.json({
                success:false,
                status:401,
                message:"Wrong Email",
                data : null
             })
        }
        let passwordCheck = await verifyPassword(password , admin.password)
        if(!passwordCheck){
            return res.json({
                success:false,
                status:401,
                message:"Wrong Password",
                data : null
             })
        }
        let token = await JWT(admin)
        res.json({
            success:true,
            status:200,
            message:"Successfully Logged In",
            data:{
                token:token,
                user:admin,
                role:'admin',
            }
        })

    }
    catch(err){
        console.log(err , " exception occurred")
    }
}


//bets
exports.createBet = async(req,res,next)=>{
  try{
    const {gameTitle , gameType,role} = req.body
    if(role.toLowerCase() !== 'admin'){
        return res.json({
            success:false,
            status:401,
            message:"Forbidden",
            data : null
        })
    }
    const betCheck = await Bet.findOne({gameTitle,status:'ongoing'})
    console.log(betCheck , " :bet check")
    if(betCheck){
        return res.json({
            success:false,
            status:401,
            message:"Bet Already Exists",
            data : null
        })
    }
    let toBeSaved = new Bet({
        gameTitle:gameTitle,
        gameType:gameType
    })
    const savedBet = await toBeSaved.save(toBeSaved)
    if(savedBet){
        return res.json({
            success:true,
            status:200,
            message:"Bet created successfully",
            data :savedBet
        })
    }
  }
  catch(err){
    console.log(err)
  }
}
exports.getAllActiveBets = async(req,res,next)=>{
    try{
        const {role} = req.body
        if(role.toLowerCase() !== 'admin'){
            return res.json({
                success:false,
                status:401,
                message:"Forbidden",
                data : null
            })
          }
          const allActiveBets = await Bet.find({status:'ongoing'})
          return res.json({
            success:true,
            status:200,
            message:"All Active Bets",
            data : allActiveBets
        })
    }
    catch(err){
        console.log(err, ' :err')
    }
}
exports.getAllAnnouncedBets = async(req,res,next)=>{
    try{
        const {role} = req.body
        if(role.toLowerCase() !== 'admin'){
            return res.json({
                success:false,
                status:401,
                message:"Forbidden",
                data : null
            })
          }
          const getAllAnnouncedBets = await Bet.find({status:'announced'})
          return res.json({
            success:true,
            status:200,
            message:"All Announced Bets",
            data : getAllAnnouncedBets
        })
    }
    catch(err){
        console.log(err, ' :err')
    }
}
exports.getBetById = async (req,res,next)=>{
    try{
        const {role,betId} = req.body
        if(role.toLowerCase() !== 'admin'){
            return res.json({
                success:false,
                status:401,
                message:"Forbidden",
                data : null
            })
          }
          const singleBet = await Bet.findOne({_id:betId})
          return res.json({
            success:true,
            status:200,
            message:"Bet Details",
            data : singleBet
        })
    }
    catch(err){
        console.log(err, ' :err')
    }
}

exports.deleteBet = async(req,res,next)=>{
    try{
        const {betId ,role} = req.body
        if(role.toLowerCase() !== 'admin'){
            return res.json({
                success:false,
                status:401,
                message:"Forbidden",
                data : null
            })
          }
          const deletedBet = await Bet.deleteOne({_id:betId})
          return res.json({
            success:true,
            status:200,
            message:"Bet Deleted Successfully",
            data : null
        })
    }
    catch(err){
        console.log(err, ' :err')
    }
}



// users
exports.createUser = async(req,res,next)=>{
    try{
        const {userName , password,userType , phone,role} = req.body
      if(role.toLowerCase() !== 'admin'){
        return res.json({
            success:false,
            status:401,
            message:"Forbidden",
            data : null
        })
      }
      const userNameCheck = await User.findOne({userName:userName})
      if(userNameCheck){
          return res.json({
              success:false,
              status:401,
              message:"User Already Exists",
              data : null
          })
      }
      const hashedPassword = await  encryptPassword(password)
      let newUser = new User({
            userName,
            password : hashedPassword,
            userType : userType.toLowerCase(),
            phone
      })
      let saveduser = await newUser.save()
      console.log(saveduser,"saved user")
      if(!saveduser){
          return res.json({
              success:false,
              status:500,
              message:"Server Error",
              data : null
          })
      }
      return res.json({
          success:true,
          status:200,
          message:"user created successfully",
          data :newUser
      })
        
    }
    catch(err){
        console.log(err , " :err")
    }
    
}
exports.getAllActiveUsers = async(req,res,next)=>{
    try{
        const {role} = req.body
        if(role.toLowerCase() !== 'admin'){
            return res.json({
                success:false,
                status:401,
                message:"Forbidden",
                data : null
            })
          }
          const allActiveUsers = await User.find({active:true})
          return res.json({
            success:true,
            status:200,
            message:"All Active Users",
            data : allActiveUsers
        })
    }
    catch(err){
        console.log(err, ' :err')
    }
}
exports.getAllUsers = async(req,res,next)=>{
    try{
        const {role} = req.body
        if(role.toLowerCase() !== 'admin'){
            return res.json({
                success:false,
                status:401,
                message:"Forbidden",
                data : null
            })
          }
          const allUsers = await User.find({})
          return res.json({
            success:true,
            status:200,
            message:"All Users",
            data : allUsers
        })
    }
    catch(err){
        console.log(err, ' :err')
    }
}
exports.getUserById = async (req,res,next)=>{
    try{
        const {role,userId} = req.body
        if(role.toLowerCase() !== 'admin'){
            return res.json({
                success:false,
                status:401,
                message:"Forbidden",
                data : null
            })
          }
          const singleUser = await User.findOne({_id:userId})
          return res.json({
            success:true,
            status:200,
            message:"User Details",
            data : singleUser
        })
    }
    catch(err){
        console.log(err, ' :err')
    }
}

exports.addBalance = async (req,res,next)=>{
    try{
        const {userId,balance,role} = req.body
      if(role.toLowerCase() !== 'admin'){
        return res.json({
            success:false,
            status:401,
            message:"Forbidden",
            data : null
        })
      }
      const user = await User.findOne({_id:userId})
      if(!user){
        return res.json({
            success:false,
            status:401,
            message:"No user exists by this ID",
            data : null
        })
      }
      const addBalance = await User.findOneAndUpdate({_id:userId},{balance:(balance + user.balance)},{new:true})
    
  
      return res.json({
          success:true,
          status:200,
          message:"Balance Added",
          data :addBalance
      })
        
    }
    catch(err){
        console.log(err , " :err")
    }
}









