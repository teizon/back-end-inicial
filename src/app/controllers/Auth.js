import { Router } from 'express';
import bcrypt from "bcryptjs";
import crypto from "crypto";
import authConfig from "@/config/auth";
import jwt from "jsonwebtoken";
import user from "@/app/schemas/user";
import { error } from 'console';

const router = new Router();

const generateToken = params => {
    return jwt.sign(params, authConfig.secret, {
            expiresIn: 86400 //expira em um dia
        }
    );     
}

router.post("/register", (req, res) => {
    const { email, name, password } = req.body;

    user.findOne({ email })
        .then( userData => { 
            if (userData){
                return res.status(400).send({error: "user already exists"})
            }else{
                user.create({ email, name, password } )
                    .then(user => { 
                        //user.password = undefined;
                        return res.send(user);
                    }).catch( error => {
                        console.error("erro ao salvar o usuario", error);
                        return res.status(400).send({error: "registration failed"})
                    }) 
            }
    }).catch( error => {
        console.error("erro ao consultar o usuario no banco de dados", err);
        res.status(500).send({error: "registration failed"});
    })
});

router.post("/login", (req, res) => {
    const {email, password } = req.body;

    user.findOne({ email })
    .select("+password")
        .then( user => {
            if (user){ 
                bcrypt.compare(password, user.password)
                .then(result =>{
                    if (result){
                        const token = generateToken({uid: user.id})
                        return res.send({token: token, tokenExpiration: "1d"}); //1w, 1y, infinity                           
                    }else{
                        return res.status(400).send({error: "invalid password"});
                    }
                }).catch(error => {
                    console.error("erro ao vereficaar a senha", error);
                    return res.status(500).send({error: "internal server error"})
                })
            }else{ 
                return res.status(404).send({error: "user not found"});
            }
        })
        .catch( error => {
            console.log("erro ao loggar", error);
            return res.status(500).send({error: "internal server error"});
        })

});

router.post("/forgot-password", (req, res) => {

});

router.post("/reset-password", (req, res) => {

});

export default router;