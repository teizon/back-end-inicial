import { Router } from 'express';
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import user from "@/app/schemas/user";
import { error } from 'console';

const router = new Router();

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

});

router.post("/forgot-password", (req, res) => {

});

router.post("/reset-password", (req, res) => {

});

export default router;