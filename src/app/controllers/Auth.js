import { Router } from 'express';
import bcrypt from "bcryptjs";
import crypto from "crypto";
import authConfig from "@/config/auth";
import jwt from "jsonwebtoken";
import Mailer from "@/modules/Mailer";
import User from "@/app/schemas/user";
import AuthMiddleware from "@/app/middlewares/Auth";
import Multer  from '@/app/middlewares/Multer';
import { error } from 'console';
import path from 'path';

const router = new Router();

const generateToken = params => {
    return jwt.sign(params, authConfig.secret, {
            expiresIn: 86400 //expira em um dia
        }
    );     
}



router.post("/register",
    (req, res) => {
        const { name, email, password, isAdmin } = req.body;

        User.findOne({ email })
            .then(userData => {
                if (userData) {
                    return res.status(400).send({ error: "User already exists" });
                } else {
                    const newUser = new User({ name, email, password, isAdmin});

                    newUser.save()
                        .then(user => {
                            // user.password = undefined; // Opcional: se você quiser ocultar a senha no retorno
                            return res.send(user);
                        })
                        .catch(error => {
                            console.error("Erro ao salvar o usuário", error);
                            return res.status(400).send({ error: "Registration failed" });
                        });
                }
            })
            .catch(error => {
                console.error("Erro ao consultar o usuário no banco de dados", error);
                res.status(500).send({ error: "Registration failed" });
            });
    });

router.post("/post/addImage/:userId", Multer.single('profileImage'), (req, res, next) => {
  const { file } = req;
    if (file) {
      User.findByIdAndUpdate(
        req.params.userId,
        { profileImage: file.path },
        { new: true }
    ).then(user => {
      if (!user) {
        throw new Error("usuario não encontrado");
      }else{
        return res.send({ user });
      }
    })
    .catch(error => {
      console.error("Erro ao associar a imagem ao usuario", error);
      res.status(500).send({ error: "Ocorreu um erro, tente novamente" });
    });
  } else {
    res.status(400).send({ error: "Nenhuma imagem enviada" });
  }
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
  
  
router.get("/user/:userId/profile-image", (req, res) => {
    const { userId } = req.params;
  
    User.findById(userId)
      .then(user => {
        if (!user || !user.profileImage) {
          return res.status(404).send({ error: "User or image not found" });
        }
  
        res.send(user.profileImage+path);
      })
      .catch(error => {
        console.error("Error retrieving user image", error);
        res.status(500).send({ error: "Failed to retrieve user image" });
      });
  });
export default router;