const jwt = require("jsonwebtoken");
const secret = "fitnessApp";


    module.exports.createAccessToken = (user) => {

        const data = {
            id : user._id,
            email : user.email,
            isAdmin : user.isAdmin
        };

        return jwt.sign(data, secret, {});
        
    };

    module.exports.verify = (req, res, next) => {
        console.log(req.headers.authorization);

        let token = req.headers.authorization;

        if(typeof token === "undefined"){
            return res.send({ auth: "Failed. No Token" });
        } else {
            token = token.slice(7, token.length);
            jwt.verify(token, secret, function(err, decodedToken){

                if(err){
                    return res.send({
                        auth: "Failed",
                        message: err.message
                    });

                } else {

                    req.user = decodedToken;
                    next();
                }
            })
        }
    };