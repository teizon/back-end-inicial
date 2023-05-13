import { Router } from 'express';
import ProjectSchema from '@/app/schemas/Exemplo';
import Slugify from '@/utils/Slugify';
import AuthMiddleware from "@/app/middlewares/Auth";
import Multer  from '@/app/middlewares/Multer';

const router = new Router();

router.get("/get", (req, res) => {  // get para todos projetos
  ProjectSchema.find()          // sem parametros
    .then(data => {
      const projects = data.map(project => {
        return {
          title: project.title,
          category: project.category,
          slug: project.slug,
          featuredImage: project.featuredImage
        }
      });
      res.send(projects)
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

router.get('/get/:projectSlug', (req, res) => { // get para projeto especifico
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

router.put("/put/:projectId", AuthMiddleware, (req, res) => {
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

router.post(
  "/featured-image/:projectId",
  [AuthMiddleware, Multer.single("featured-image")],
  (req, res) => {
    const { file } = req;
    if (file) {
      ProjectSchema.findByIdAndUpdate(
        req.params.projectId,
        { featuredImage: file.path },
        { new: true }
      )
        .then(project => {
          if (!project) {
            throw new Error("Projeto não encontrado");
          }else{
            return res.send({ project });
          }
        })
        .catch(error => {
          console.error("Erro ao associar a imagem ao projeto", error);
          res.status(500).send({ error: "Ocorreu um erro, tente novamente" });
        });
    } else {
      res.status(400).send({ error: "Nenhuma imagem enviada" });
    }
  }
);

router.post(
  "/featured-images/:projectId",
  [AuthMiddleware, Multer.array("featured-images")],
  (req, res) => {
    const { files } = req;
    if (files && files.length > 0) {
      const projectImages = [];

      files.forEach(file => {
        projectImages.push(file.path);
      });

      ProjectSchema.findById(req.params.projectId)
        .then(project => {
          if (!project) {
            throw new Error("Projeto não encontrado");
          }
          project.featuredImages = projectImages;
          return project.save();
        })
        .then(project => {
          return res.send({ project });
        })
        .catch(error => {
          console.error("Erro ao associar as imagens ao projeto", error);
          res.status(500).send({ error: "Ocorreu um erro, tente novamente" });
        });
    } else {
      res.status(400).send({ error: "Nenhuma imagem enviada" });
    }
  }
);


export default router;
