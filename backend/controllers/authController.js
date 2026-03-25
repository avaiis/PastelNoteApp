const User = require('../models/userModel');
const bcrypt = require('bcrypt');

// Register
exports.register = async (req, res) =>{
    try{
        const {username, email, password} = req.body;

        // Hash password sebelum disimpan
        const hashedPassword = await bcrypt.hash(password, 10);

        User.register({username, email, password: hashedPassword}, (err, result) => {
            if(err) return res.status(500).json({error: err.message});
            res.status(201).json({message: "Registration successfull! Please Login"});
        });
    }catch(err){
        res.status(500).json({error: err.message});
    }
};

// Login
exports.login = async (req, res) => {
    const {username, password} = req.body;

    User.findByUsername(username, async (err, result) => {
        if(err) return res.status(500).json({error: err.message});
        if(result.length === 0) return res.status(401).json({message: "User not found"});

        const user = result[0];

        try{
            // Compare input pass dengan hashed pass di database
            const isMatch = await bcrypt.compare(password, user.password);
            
            if(!isMatch) return res.status(401).json({message: "Incorrect password"});

            // Remove password dari object before sending to frontend
            delete user.password;
            res.json({message: "Login successfull", user});
        }catch(err){
            res.status(500).json({error: "Internal server error during authentication"});
        }
    });
};