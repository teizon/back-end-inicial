import express from 'express';
import ExemploRouter from './ExemploRouter';
import Auth from "./Auth";
import Uploads from "./Uploads";

const router = express();
router.disable("x-powered-by");

router.use('/exemplo', ExemploRouter);
router.use("/auth", Auth);
router.use("/uploads", Uploads);

export default router;
