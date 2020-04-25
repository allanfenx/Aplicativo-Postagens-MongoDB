//Careegando modulos
  const express = require('express')
  const handlebars = require('express-handlebars')
  const bodyParser = require('body-parser')
  const app = express()
  const admin = require("./routers/admin")
  const path = require('path')
  const session = require("express-session")
  const flash = require("connect-flash")
  const mongoose = require("mongoose")
  require("./models/Postagens")
  const Postagens = mongoose.model("postagens")
  require("./models/Categoria")
  const Categoria = mongoose.model("categorias")
  require("./models/Usuario")
  const Usuario = mongoose.model("usuarios")
  const usuarios = require("./routers/usuarios")
  const passport = require("passport")
  require("./config/auth")(passport)
//Configurações
 //Mongoose
  mongoose.Promise = global.Promise;
  mongoose.connect("mongodb://localhost/blogapp", { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log("Conectado ao banco de dados mongo DB")
  }).catch((err) => {
    console.log("Erro ao conectar com banco" + err)
  })
 //Sessão
  app.use(session({
    secret: "allanfenxs",
    resave: true,
    saveUninitialized: true
  }))

  app.use(passport.initialize())
  app.use(passport.session())
  app.use(flash())
 //Middleware
  app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg = req.flash("error_msg")
    res.locals.error = req.flash("error")
    res.locals.user = req.user || null;
    next()
  })
 //Body Parser
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(bodyParser.json())
 //Handlebars
  app.engine('handlebars', handlebars({ defaultLayout: 'main' }))
  app.set('view engine', 'handlebars')

 //Public
  app.use(express.static(path.join(__dirname, "public")))
 //Rotas
  app.get("/", (req, res) => {
      Postagens.find().populate("categoria").sort({data: "desc"}).then((postagens) => {
        res.render("index", {postagens: postagens})
      })   
  })

  app.get("/postagens/:slug", (req, res) => {
      Postagens.findOne({slug: req.params.slug}).then((postagens) => {
          if(postagens){
              res.render("postagens/index", {postagens: postagens})
          }else{
              req.flash("error_msg", "Essa postagem não existe")
              res.redirect("/")
          }
      }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno")
        res.redirect("/")
      })
  })

  app.get("/categorias", (req, res) => {
    Categoria.find().then((categorias) => {
      res.render("categorias/index", {categorias: categorias})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno ao listar categoria")
        res.redirect("/")
    })   
  })

  app.get("/categorias/:slug", (req, res) => {
    Categoria.findOne({slug: req.params.slug}).then((categoria) => {
      if(categoria){
        Postagens.find({categoria: categoria._id}).then((postagens) => {
        res.render("categorias/postagens", {postagens: postagens, categoria: categoria})
        }).catch((err) => {
          req.flash("error_msg", "Houve um erro interno ao carregar pagina desta categoria")
          res.redirect("/")
        })
      }else{
        req.flash("error_msg", "Está categoria não existe")
        res.redirect("/")
      }
    }).catch((err) => {
      req.flash("error_msg", "Houve um erro ao listar posts")
      res.redirect("/")
    })
  })
        
  app.use('/admin', admin)
  app.use('/usuarios', usuarios)
 //Outros
  const Port = 3000
  app.listen(Port, () => {
    console.log("Servidor rodando na porta " + Port)
  })