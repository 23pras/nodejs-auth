const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registerUser = async(req,res)=>{
    try {
        const {username, email, password, role} = req.body;

        const checkExistingUser = await User.findOne({ $or : [{username}, {email }]});

        if(checkExistingUser){
            return res.status(400).json({
                success:false,
                message : 'User already exist'
            })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const newUser = new User({
            username,
            email,
            password:hashedPassword,
            role: role || 'user'
        });

        await newUser.save();

        if(newUser){
            res.status(201).json({
                success:true,
                message: 'User Registered Successfully !'
            })
        }
        else{
            res.status(400).json({
                success:false,
                message: 'Unable to register user, please try again ! '
            }) 
        }

    } catch (error) {  
        console.log(error);
        res.status(500).json({
            status:false,
            message: 'some error occured ! please try again '
        })
    }
};

const loginUser = async(req,res)=>{
    try {
        const {username, password} = req.body;
        const user = await User.findOne({username});

        if(!user){
            return res.status(400).json({
                success:false,
                message: "User does'nt exists"
            })
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if(!isPasswordMatch){
            return res.status(400).json({
                success:false,
                message: 'Invalid credentials !'
            });
        }

        const accessToken = jwt.sign({
           userId : user._id,
           username: user.username,
           role: user.role
        }, process.env.JWT_SECRET_KEY, {
            expiresIn : '30m'
        });

        res.status(200).json({
            success:true,
            message: 'login in successful !',
            accessToken
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            status:false,
            message: 'some error occured ! please try again '
        })
    }
};

const changePassword = async(req,res)=>{
    try {
        const userId = req.userInfo.userId;
        const {oldPassword, newPassword} = req.body;

        const user = await User.findById(userId);

        if(!user){
            return res.status(400).json({
                success:false,
                message: 'User not found !'
            })
        }

        const isPasswordMatched = await bcrypt.compare(oldPassword, user.password);

        if(!isPasswordMatched){
            return res.status(400).json({
                success:false,
                message: 'Password not matched !'
            })
        }
        
        const salt = await bcrypt.genSalt(10);
        const newhashedPassword = await bcrypt.hash(newPassword,salt);
        user.password = newhashedPassword;
        await user.save();

        res.status(200).json({
            success:true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            status:false,
            message: 'some error occured ! please try again '
        }) 
    }
}

module.exports = {registerUser,loginUser,changePassword}