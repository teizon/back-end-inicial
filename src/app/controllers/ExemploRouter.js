import { Router } from 'express';
import ProjectSchema from '@/app/schemas/Exemplo';
import Slugify from '@/utils/Slugify';
import AuthMiddleware from "@/app/middlewares/Auth";

const router = new Router();

router.get("/", (req, res) => {  // get para todos projetos
  ProjectSchema.find()          // sem parametros
    .then(projects => {
      res.send(projects) ;
    })
    .catch(error => {
      console.error("erro ao salvar novo projeto no banco de dados", error);
        res
          .status(400)
          .send({
            error: 
                "Nao foi possivel obter os dados do projeto. Tente novamente",
          });
  });

});

router.get('/:projectSlug', (req, res) => { // get para projeto especifico
  ProjectSchema.findOne({slug: req.params.projectSlug})
  .then(project => {
    res.send(project) ;
  })
  .catch(error => {
    console.error("erro ao salvar novo projeto no banco de dados", error);
      res
        .status(400)
        .send({
          error: 
              "Nao foi possivel obter os dados do projeto. Tente novamente",
        });
  });
});

router.post("/post", AuthMiddleware, (req, res) => {
  const {title, slug, description, category} = req.body;
  console
  ProjectSchema.create({title, description, category})
      .then(project => {
          res.status(201).send(project)
      })
      .catch(error => {
          console.error("erro ao salvar novo projeto no banco de dados", error);
          res
          .status(400)
          .send({
              error: 
                  "Nao foi possivel salvar seu projeto. Verifique os dados e tente novamente"
              });
      });
});

router.put("/:projectId", AuthMiddleware, (req, res) => {
  const {title, description, category} = req.body;
  let slug = undefined;
  if(title){
    slug = Slugify(title);
  }

  ProjectSchema.findByIdAndUpdate(req.params.projectId, {title, slug, description, category}, {new: true})
      .then(ProjectSchema => {
          res.status(201).send(ProjectSchema)
      })
      .catch(error => {
          console.error("erro ao salvar novo projeto no banco de dados", error);
          res
          .status(400)
          .send({
              error: 
                  "Nao foi possivel salvar seu projeto. Verifique os dados e tente novamente"
              });
      });
});

router.delete("/delete/:projectId", AuthMiddleware, (req, res) => {
  ProjectSchema.findByIdAndRemove(req.params.projectId) 
  .then
    (() => {
      res.status(201).send({ message: 'Hello world!' });
  }).catch(error => {
    console.error("erro ao remover o projeto do banco de dados", error);
    req.status(400).send({message: "erro ao remover projeto, tente novamente"})
  })
});

export default router;
