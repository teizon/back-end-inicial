import express from 'express'
import ExemploRouter from './ExemploRouter';
import Auth from "./Auth";
import user from "@/app/schemas/user";

const router = express();
router.disable("x-powered-by")

router.use('/exemplo', ExemploRouter)
router.use("/auth", Auth)

export default router;
