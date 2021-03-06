const express = require('express')
var User = require('../model/User');
const bcrypt = require('bcrypt');
const router = express.Router();
var formidable = require('formidable');


function login(req, res){

    User.find({username:req.body.username})
    .exec()
    .then(user => {
        if(user.length > 0 && bcrypt.compareSync(req.body.password, user[0].password )){
                //crear token para login
                        user[0].token =  Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                        user[0].save((err,save) => {
                            if(err){
                                throw "Error en Login"
                            }else{
                                user[0].set({password:null});
                                //formart respuesta al cliente
                                res.status(200).json({
                                    user: user[0]
                                })
                            }
                        });
        }else{
            throw "Contrasena incorrecta"
        }
    }

    ).catch(err => {
        res.status(404).json({
            error : 'error: '+ err
        });
    })
}


//encontrar usuario

//buscar usuario por username

function getUserByUsername(req, res){
    User.find({username: req.params.username})
    .exec()
    .then((user)=>{
        if(user.length > 0){
            res.json(user);
        }else{
            res.json({
                error: 'Usuario no encontrado'
            })
        }
    })
}

function signUp(req, res){
    
    //hash contraseña
    var hash = (req.body.password) ? bcrypt.hashSync(req.body.password, 10): null;

    // crear modelo del usuario
    var newUser = new User ({
        username: req.body.username,
        password: hash,
        genero: req.body.genero,
        email: req.body.email,
        profile_pic: 'default.png'
    });
    console.log(JSON.stringify(newUser, null, 2))
    //Intentar guardar en la base de datos si hay error enviar error sino crear respuesta
    newUser.save(function(err, newUser){
        
        if(err) {
            res.status(404).json({
                err: 'Usuario no registrado '+err
            })
        }else{
         
           res.status(200).json({
               message: 'Usuario registrado'
           })
            
        }

    })

    
    //subir foto de perfil 
    router.post('/', function(req, res) {


        var form = new formidable.IncomingForm();
        form.parse(req);
        let reqPath= path.join(__dirname, '../');
        let newfilename;
       
        form.on('fileBegin', function(name, file){
            file.path = reqPath+ 'public/uploads/'+ req.user.username + file.name;
            newfilename = req.user.username + file.name;
        });
       
        form.on('file', function(name, file) {
            User.findOneAndUpdate({
                username: req.user.username
            },
            {
                'profile_pic': newfilename
            },
            function(err, result){
                if(err) {
                    console.log(err);
                }
            });
        });

        req.flash('success_msg', 'Tu foto ha publicado');
        res.redirect('/');
    });  
}

module.exports = {
    login : login,
    signUp: signUp,
    getUserByUsername: getUserByUsername
} 
