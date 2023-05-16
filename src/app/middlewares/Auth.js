import jwt from 'jsonwebtoken';
import authConfig from '@/config/auth';
import UsuarioSchema from '@/app/schemas/user';

export default (opcoes) => (req, res, next) => {
    const authHeader = req.headers.authorization;
  
    if (authHeader) {
      const tokenData = authHeader.split(' ');
      if (tokenData.length !== 2) {
        return res.status(401).send({ error: 'No valid token 1 provided' });
      }
  
      const [scheme, token] = tokenData;
      if (scheme.indexOf('Bearer') < 0) {
        return res.status(401).send({ error: 'No valid token 2 provided' });
      }
  
      jwt.verify(token, authConfig.secret, (err, decoded) => {
        if (err) {
          return res.status(401).send({ error: 'No valid token 3 provided' });
        } else {
          req.uid = decoded.uid;
          UsuarioSchema.findById(req.uid)
          .then(user => {
            if(user){
              if (opcoes.isAdmin) {
                if (user.isAdmin) { 
                  return next();
                } else {
                  return res.status(403).send({ erro: 'Não autorizado a fazer essa ação' });
                }
              } else {
                if(!user.isAdmin || user.isAdmin)
                  return next();
  
                return res.status(403).send({ erro: 'Não autorizado a fazer essa ação' });
              }
            }else {
              return res.status(404).send({ erro: 'Usuario não encontrado'})
            }
          }).catch((erro) =>{
            console.error('Erro não foi possivel encontrar o usuario',erro)
            return res.status(404).send({ erro: 'Usuario não encontrado'})
          })
        }
      });
    } 
  };
  
