const express = require('express')
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Categoria")
const Categoria = mongoose.model("categorias")
require("../models/Postagens")
const Postagens = mongoose.model("postagens")
const {eAdmin} = require("../helpers/eAdmin")

router.get('/', (req, res) => {
    res.render("admin/index")
})

router.get("/categorias", eAdmin, (req, res) => {
    Categoria.find().sort({date: "desc"}).then((categorias) => {
        res.render("admin/categorias", {categorias: categorias})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar categorias" + err)
    })
    
})

router.get("/categorias/add", eAdmin,(req, res) => {
    res.render("admin/addcategorias")
})

router.post("/categorias/nova", eAdmin, (req, res) => {
    var erros = []

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: "Nome não pode ser vazio" })
    }
    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ texto: "Slug não pode ser vazio" })
    }

    if (erros.length > 0) {
        res.render("admin/addcategorias", { erros: erros })
    } else {
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
        new Categoria(novaCategoria).save().then(() => {
            req.flash("success_msg", "Categoria cadastrada com sucesso")
            res.redirect("/admin/categorias")
        }).catch((err) => {
            req.flash("error_msg", "Erro ao salvar categoria" + err)
        })
    }
})

router.get("/categorias/edit/:id", eAdmin, (req, res) => {
    Categoria.findOne({_id: req.params.id}).then((categoria) => {
        res.render("admin/editcategorias", {categoria: categoria})
    }).catch((err) => {
        req.push("error_msg", "Essa categoria não existe " + err)
    })
})

router.post("/categorias/edit", eAdmin, (req, res) => {
    Categoria.findOne({_id: req.body.id}).then((categoria) =>{
        var erros = []

        if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
            erros.push({ texto: "Nome não pode ser vazio" })
        }
        if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
            erros.push({ texto: "Slug não pode ser vazio" })
        }
        
        if(erros.length > 0){
            res.render("admin/editcategorias", {erros: erros})
        }else{
            categoria.nome = req.body.nome
            categoria.slug = req.body.slug

            categoria.save().then(() => {
                req.flash("success_msg", "Categoria editada com sucesso!")
                res.redirect("/admin/categorias")
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro ao editar categoria " + err)
                res.redirect("/admin/categorias/edit")
            })
        }
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao editar a categoria " + err)
        res.redirect("/admin/categorias")
    })
})

router.post("/categorias/deletar", eAdmin, (req, res) => {
    Categoria.deleteOne({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso!")
        res.redirect("/admin/categorias")
    }).catch((err) => {
        req.flash("error_msg", "Erro ao deletar categoria " + err)
        res.redirect("/admin/categorias")
    })
})

// Aqui começa rotas de postagens

router.get("/postagens", eAdmin, (req, res) => {
    Postagens.find().populate("categoria").sort({data: "desc"}).then((postagens) => {
        res.render("admin/postagens", {postagens: postagens})
    }).catch((err) => {
        req.flash("error_msg", "Falha ao carregar postagens")
        res.redirect("/")
    })
})

router.get("/postagens/add", eAdmin, (req, res) => {
    Categoria.find().then((categorias) => {
        res.render("admin/addpostagens", {categorias: categorias})
    }).catch((err) => {
        req.flash("error_msg", "Falha ao carregar formulário")
        res.redirect("/admin/postagens")
    })
})

router.post("/postagens/nova", eAdmin, (req, res) => {
    var erros = []

    if(req.body.categoria == 0){
        erros.push({texto: "O campo categoria é obrigatório"})
    }

    if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null){
        erros.push({texto: "O campo titulo é obrigatório"})
    }

    if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null){
        erros.push({texto: "O campo descrição é obrigatório"})
    }

    if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null){
        erros.push({texto: "O campo conteudo é obrigatório"})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "O campo titulo é obrigatório"})
    }

    if(erros.length > 0){
        res.render("/admin/addpostagens", {erros: erros})
    }else{
        const NovaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            slug: req.body.slug,
            categoria: req.body.categoria
        }
        new Postagens(NovaPostagem).save().then(()=> {
            req.flash("success_msg", "Postagem cadastrada com sucesso")
            res.redirect("/admin/postagens")
        }).catch((err) => {
            req.flash("error_msg", "Falha ao cadatrar postagem " + err)
            res.redirect("/admin/postagens/add")
        })
    }
})

router.get("/postagens/edit/:id", eAdmin,(req, res) => {

    Postagens.findOne({_id: req.params.id}).then((postagens) => {
        Categoria.find().then((categorias) => {
            res.render("admin/editpostagens", {categorias: categorias, postagens: postagens})
        }).catch((err) => {
            req.flash("error_msg", "Falha ao listar categorias")
            res.redirect("/admin/postagens")
        })
    }).catch((err) => {
        req.flash("error_msg", "Falha ao carregar formulário de edição")
        res.redirect("/admin/postagens")
    })
})

router.post("/postagens/edit", eAdmin,(req, res) => {
    Postagens.findOne({_id: req.body.id}).then((postagens) => {
        var erros = []

        if(req.body.categoria == 0){
            erros.push({texto: "O campo categoria é obrigatório"})
        }
    
        if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null){
            erros.push({texto: "O campo titulo é obrigatório"})
        }
    
        if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null){
            erros.push({texto: "O campo descrição é obrigatório"})
        }
    
        if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null){
            erros.push({texto: "O campo conteudo é obrigatório"})
        }
    
        if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
            erros.push({texto: "O campo titulo é obrigatório"})
        }
    
        if(erros.length > 0){
            res.render("/admin/addpostagens", {erros: erros})
        }else{
            postagens.titulo = req.body.titulo
            postagens.descricao = req.body.descricao
            postagens.conteudo = req.body.conteudo
            postagens.slug = req.body.slug
            postagens.categoria = req.body.categoria

            postagens.save().then(() => {
                req.flash("success_msg", "Postagem editada com sucesso")
                res.redirect("/admin/postagens")
            }).catch((err) => {
                req.flash("error_msg", "Falha ao editar postagem")
                res.redirect("/admin/postagens/edit")
            })
        }
    }).catch((err) => {
        req.flash("error_msg", "Falha ao salvar edição " + err)
        res.redirect("/admin/postagens")
    })
})

router.get("/postagens/deletar/:id", eAdmin, (req, res) => {
  Postagens.deleteOne({_id: req.params.id}).then(() => {
    req.flash("success_msg", "Postagem deletada com sucesso")
    res.redirect("/admin/postagens")
  }).catch((err) => {
    req.flash("error_msg", "Falha ao deletar postagem")
    res.redirect("/admin/postagens")
  })
})
module.exports = router