const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")
const bcrypt = require("bcryptjs")
const passport = require("passport")

router.get("/registro", (req, res) => {
    res.render("usuarios/registro")
})

router.post("/registro", (req, res) => {
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "O campo nome é obrigatório"})
    }

    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({texto: "O campo email é obrigatório"})
    }

    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        erros.push({texto: "O campo senha é obrigatório"})
    }

    if(req.body.senha.length < 6 || req.body.senha.length > 8){
        erros.push({texto: "Senha deve conter de 6 a 8 digitos"})
    }

    if(req.body.senha != req.body.senha2){
        erros.push({texto: "Senhas não conferem"})
    }

    if(erros.length > 0){
        res.render("usuarios/registro", {erros: erros})
    }else{
        Usuario.findOne({email: req.body.email}).then((usuario) => {
            if(usuario){
                req.flash("error_msg", "Já existe uma conta co este e-mail em nosso sistema")
                res.redirect("/usuarios/registro")
            }else{
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })

                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if(erro){
                            req.flash("error_msg", "Ocorreu um erro ao fazer hash da senha")
                            res.redirect("/usuarios/registro")
                        }

                        novoUsuario.senha = hash

                        novoUsuario.save().then(()=> {
                            req.flash("success_msg", "Conta criada co sucesso")
                            res.redirect("/")
                        }).catch((err) => {
                            req.flash("error_msg", "Houve um erro ao criar conta")
                            res.redirect("/usuarios/registro")
                        })
                    })
                })
            }

        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })
    }
})

router.get("/login", (req, res) =>{
    res.render("usuarios/login")
})

router.post("/login", (req, res, next)=>{
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureFlash: true
    })(req, res, next)
})

router.get("/logout", (req, res) =>{
    req.logout()
    req.flash("success_msg", "Você acabou de sair da sessão")
    res.redirect("/")
})
module.exports = router