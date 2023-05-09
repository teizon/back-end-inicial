import express from 'express'
import ExemploRouter from './ExemploRouter';

const router = express();
router.disable("x-powered-by")

router.use('/exemplo', ExemploRouter)

export default router;
