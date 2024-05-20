import userModel from "../models/userModel.js";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import validator from 'validator'
import tokenModel from "../models/tokenModel.js"
import verifyemail from "./emailVerificationController.js";
import dotenv from 'dotenv';

dotenv.config();


// Login User
const loginUser = async (req,res) => {
    const {email, password} = req.body
    try {
        const user = await userModel.findOne({email})
        if (!user) {
            return res.json({success:false, message:"User doesn't exists"})
        }

        if (!user.verified) {
            return res.json({success: false, message: "User is not verified"})
        }

        const isMatch = await bcrypt.compare(password,user.password)

        if (!isMatch) {
            return res.json({success:false, message:"Invalid credentials"})
        }

        const token  = createToken(user._id)
        res.json({success:true, token, verified:user.verified})

    } catch (error) {
        console.log(error)
        res.json({success:false, message:"Error"})
    }
}

const createToken = (id) => {
    return jwt.sign({id},process.env.JWT_SECRET)
}

// Register User
const registerUser = async (req,res) => {
    const {name, password, email} = req.body
    try {
        // Checking is user already exists
        const exists = await userModel.findOne({email})
        if(exists){
            return res.json({success:false, message:"User alreday exists"})
        }

        // Validating email format and strong password
        if(!validator.isEmail(email)){
            return res.json({success:false, message:"Please enter a valid email"})
        }

        if (password.length<8) {
            return res.json({success:false, message:"Please enter a strong password"})
        }

        // Hashing user password
        const salt = await bcrypt.genSalt(10)
        const hassedPassword = await bcrypt.hash(password,salt)

        const newUser = new userModel({
            name:name,
            email:email,
            password:hassedPassword
        })

        const user = await newUser.save()
        const token = createToken(user._id)

        const verifyToken = new tokenModel ({
            userId: user._id,
            token
        })
        
        await verifyToken.save()

        const link = `${process.env.BACKEND_URL}/api/user/confirm/${verifyToken.token}`
        await verifyemail(newUser.email, link)
        res.json({success:true, message:"Email send check your mail", token:verifyToken.token})

    } catch (error) {
        console.log(error)
        res.json({success:false, message:"Error"})
    }
}

const verifyUser = async (req,res) =>{
    try {
        const token = await tokenModel.findOne({
            token:req.params.token,
        })
        if (!token) {
            return res.json({ success: false, message: "Invalid or expired token" });
        }

        await userModel.updateOne({ _id: token.userId }, { $set: { verified: true } });
        await tokenModel.findByIdAndDelete(token._id);
        res.send(
            `<div style="display: flex; justify-content: center; align-items: center; flex-direction: column; gap: 10px;">
                <h1>Your email is now verified</h1>
                <p>Now you can login</p>
                <p id="countdown">Redirecting in 5 seconds...</p>
                <script>
                    let countdown = 5;
                    const countdownElement = document.getElementById('countdown');
                    const interval = setInterval(() => {
                    countdown -= 1;
                    countdownElement.textContent = 'Redirecting in ' + countdown + ' seconds...';
                    if (countdown <= 0) {
                        clearInterval(interval);
                        window.location.href = 'http://localhost:3001';
                    }
                    }, 1000);
                </script>
            </div>`)
    } catch (error) {
        console.log(error)
        res.json({success:false, message:"Error"})
    }
}

export {loginUser, registerUser, verifyUser}