const Users = require('../models/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const authCtrl = {
    register: async (req, res) => {
        try {
            const { fullname, username, email, password, gender } = req.body
            let newUserName = username.toLowerCase().replace(/ /g, '')

            const user_name = await Users.findOne({username: newUserName})
            if(user_name) return res.status(400).json({msg: "This user name already exists."})

            const user_email = await Users.findOne({email})
            if(user_email) return res.status(400).json({msg: "This email already exists."})

            if(password.length < 6)
            return res.status(400).json({msg: "Password must be at least 6 characters."})

            const passwordHash = await bcrypt.hash(password, 12)

            const newUser = new Users({
                fullname, username: newUserName, email, password: passwordHash, gender
            })


            const access_token = createAccessToken({id: newUser._id})
            const refresh_token = createRefreshToken({id: newUser._id})

            res.cookie('refreshtoken', refresh_token, {
                httpOnly: true,
                path: '/api/refresh_token',
                maxAge: 30*24*60*60*1000, // 30days
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                secure: process.env.NODE_ENV === 'production' ? true : false
            })

            await newUser.save()

            res.json({
                msg: 'Register Success!',
                access_token,
                user: {
                    ...newUser._doc,
                    password: ''
                }
            })
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    login: async (req, res) => {
        try {
            const { email, password } = req.body

            const user = await Users.findOne({email})
            .populate("followers following", "avatar username fullname followers following")

            if(!user) return res.status(400).json({msg: "This email does not exist."})

            const isMatch = await bcrypt.compare(password, user.password)
            if(!isMatch) return res.status(400).json({msg: "Password is incorrect."})

            const access_token = createAccessToken({id: user._id})
            const refresh_token = createRefreshToken({id: user._id})

            res.cookie('refreshtoken', refresh_token, {
                httpOnly: true,
                path: '/api/refresh_token',
                maxAge: 30*24*60*60*1000, // 30days
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                secure: process.env.NODE_ENV === 'production' ? true : false
            })

            res.json({
                msg: 'Login Success!',
                access_token,
                user: {
                    ...user._doc,
                    password: ''
                }
            })
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    logout: async (req, res) => {
        try {
            res.clearCookie('refreshtoken', {
                path: '/api/refresh_token',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                secure: process.env.NODE_ENV === 'production' ? true : false
            })
            return res.json({msg: "Logged out!"})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    generateAccessToken: async (req, res) => {
        try {
            const rf_token = req.cookies.refreshtoken
            if(!rf_token) return res.status(400).json({msg: "Please login now."})

            jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, async(err, result) => {
                if(err) return res.status(400).json({msg: "Please login now."})

                const user = await Users.findById(result.id).select("-password")
                .populate('followers following', 'avatar username fullname followers following')

                if(!user) return res.status(400).json({msg: "This does not exist."})

                const access_token = createAccessToken({id: result.id})

                res.json({
                    access_token,
                    user
                })
            })
            
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    forgotPassword: async (req, res) => {
        try {
            const { email } = req.body
            const user = await Users.findOne({email})
            if(!user) return res.status(400).json({msg: "This email does not exist."})

            const reset_token = jwt.sign({id: user._id}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15m'})
            const url = `${process.env.CLIENT_URL}/reset_password/${reset_token}`

            const nodemailer = require('nodemailer')
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                }
            })

            const mailOptions = {
                from: `Instagram Support <${process.env.EMAIL_USER}>`,
                to: email,
                subject: "Reset your Instagram Password",
                html: `
                    <div style="max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; font-family: sans-serif; color: #333333; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                        <div style="background-color: #2b8a3e; padding: 24px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 0.5px;">Instagram</h1>
                        </div>
                        <div style="padding: 32px 24px;">
                            <h2 style="color: #2b8a3e; margin-top: 0; font-size: 20px;">Password Reset Request</h2>
                            <p style="font-size: 16px; line-height: 1.5; color: #555555; margin-bottom: 24px;">
                                Hello ${user.fullname || user.username},<br/><br/>
                                We received a request to reset your password for your Instagram account. Click the button below to set a new password. This link is valid for 15 minutes.
                            </p>
                            <div style="text-align: center; margin: 32px 0;">
                                <a href="${url}" target="_blank" style="background-color: #2b8a3e; color: #ffffff; padding: 14px 28px; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 5px; display: inline-block; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Reset Password</a>
                            </div>
                            <p style="font-size: 14px; color: #777777; line-height: 1.5;">
                                If you did not request a password reset, please ignore this email or contact support if you have concerns. Your password will remain unchanged.
                            </p>
                            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;"/>
                            <p style="font-size: 12px; color: #999999; line-height: 1.5; text-align: center;">
                                © 2026 Instagram Inc. All rights reserved.
                            </p>
                        </div>
                    </div>
                `
            }

            await transporter.sendMail(mailOptions)
            res.json({msg: "Password reset link sent to your email!"})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    resetPassword: async (req, res) => {
        try {
            const { password } = req.body
            const token = req.header("Authorization")
            if(!token) return res.status(400).json({msg: "Invalid Authentication."})

            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
            if(!decoded) return res.status(400).json({msg: "Invalid Authentication."})

            if(password.length < 6)
            return res.status(400).json({msg: "Password must be at least 6 characters."})

            const passwordHash = await bcrypt.hash(password, 12)

            await Users.findOneAndUpdate({_id: decoded.id}, {
                password: passwordHash
            })

            res.json({msg: "Password successfully changed!"})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    }
}


const createAccessToken = (payload) => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1d'})
}

const createRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '30d'})
}

module.exports = authCtrl