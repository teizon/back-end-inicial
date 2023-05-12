import { Router } from 'express';
import bcrypt from "bcryptjs";
import crypto from "crypto";
import authConfig from "@/config/auth";
import jwt from "jsonwebtoken";
import Mailer from "@/modules/Mailer";
import User from "@/app/schemas/user";
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

    User.findOne({ email })
        .then( userData => { 
            if (userData){
                return res.status(400).send({error: "user already exists"})
            }else{
                User.create({ email, name, password } )
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

    User.findOne({ email })
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
    const {email} =req.body;

    User.findOne({ email })
        .then( user => { 
            if (user){ 
                const token = crypto.randomBytes(20).toString("hex");
                const expiration = new Date();
                expiration.setHours(new Date().getHours() + 3);

                User.findByIdAndUpdate(user.id, {
                    $set: {
                        passwordResetToken: token,
                        passwordResetTokenExpiration: expiration
                    }
                }).then(() => { 
                    Mailer.sendMail({ 
                        to: email,
                        from: "webmaster@testexpress.com",
                        template: "auth/forgot_password",
                        context: {token}
                    }, error => {
                        if(error){
                            console.error("erro ao enviar o email", error);
                            return res.status(400)({error: "fail sending recover password mail"});
                        }else{
                            return res.send();
                        }
                    })
                }).catch(error => {
                    console.error("erro ao salvar o token de recuperacao de senha", error);
                    return res.status(500).send({error: "internal server error"});
                })
            }else{ 
                return res.status(404).send({error: "user not found"});
            }
        }).catch( error => {
            console.error("erro no forgot password", error);
            return res.status(500).send({ error: "internal server error" })
        })            
});

router.post("/reset-password", (req, res) => {
    const { email, token, newPassword } = req.body;

    User.findOne({ email })
      .select("passwordResetToken passwordResetTokenExpiration")
      .then((user) => {
        if (user) {
          if (
            token != user.passwordResetToken ||
            Date.now() > user.passwordResetTokenExpiration
          ) {
            return res.status(400).send({ error: "Invalid token" });
          } else {
            user.passwordResetToken = undefined;
            user.passwordResetTokenExpiration = undefined;
            user.password = newPassword;
  
            user
              .save()
              .then(() => {
                return res.send({ message: "Senha trocada com sucesso" });
              })
              .catch((error) => {
                console.error("Erro ao salvar nova senha do usuário", error);
                return res.status(500).send({ error: "Internal server error" });
              });
          }
        } else {
          return res.status(404).send({ error: "User not found" });
        }
      })
      .catch((error) => {
        console.error("Erro no forgot password", error);
        return res.status(500).send({ error: "Internal server error" });
      });
});
  
  

export default router;