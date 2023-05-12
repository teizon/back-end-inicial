import express from 'express'
import ExemploRouter from './ExemploRouter';
import Auth from "./Auth";

const router = express();
router.disable("x-powered-by")

router.use('/exemplo', ExemploRouter)
router.use("/auth", Auth)

export default router;
