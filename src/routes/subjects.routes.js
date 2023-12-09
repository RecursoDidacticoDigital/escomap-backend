import {Router} from 'express';
import { prisma } from '../db.js';
import bcrypt from 'bcryptjs';
import generarJWT from '../../helpers/generar-jwt.js';
import {check} from 'express-validator';
import validarCampos from '../../middlewares/validar-campos.js';

import {
    emailExiste, 
    accountExiste, 
    accountNoExiste,
    validarTokenUsuario,
    validarJWT
} from '../../helpers/db-validators.js';

export const router = Router();

router.post('/subjects/add', [
    check('name', 'El nombre de la materia es obligatorio').not().isEmpty(),
    check('group', 'El grupo debe tener mínimo 4 caracteres y máximo 5').isLength({min: 4, max:5}),
    validarCampos
],async (req, res, next) => {
    
    const body = req.body;
    //console.log(body);
    const header = req.headers;
    //console.log(header);

    // TODO: Agregar validador, validar si la materia ya existe en el
    // TODO- mismo salón y en el mismo horario, o si otra materia ya
    // TODO- está en el mismo salón y mismo horario.
    const {name, group, classroomid, timeblockid} = body;

    const nameDB = await prisma.subjects.find({subject_name: body.name});
    const groupDB = await prisma.subjects.findFirst({subject_group: body.group});
    const classroomidDB = await prisma.subjects.findFirst({classroom_id: body.classroomid});
    const timeblockidDB = await prisma.subjects.findFirst({timeblock_id: body.timeblockid});

    // Verifica si en la base de datos ya hay está la materia y el grupo que llegó en el body
    if(nameDB && groupDB){
        // Verifica si en la base de datos ya hay una materia con el bloque horario.
        // timeblock_id hace referencia a un día y uno de los bloques horarios. 
        // (Hay 45 id's en timeblock_id, 9 bloques horario por 5 días hábiles)
        if(classroomidDB && timeblockidDB){
            return res.status(400).json({
                msg: `Ya existe una clase en ese día y bloque horario ${timeblockid}`
            })
        }
        return res.status(400).json({
            msg: `Esa materia ya existe en el grupo ${groupDB}`
        })
    }

    try {
        // Generar los datos de la nueva materia
        const materia = await prisma.subjects.create({
            data: {
                subject_name: name,
                subject_group: group,
                classroom_id: classroomid,
                timeblock_id: timeblockid
            },
        });

        // Revisar si falta de agregar algo más
        console.log(usuario);
        console.log(token);
        console.log("Successful signup");
        return res.json({
            usuario,
            token
        });
    } catch (error) {
        console.log(error.message);
        return res.send("Bad request");
    }
});

router.del('/subjects/delete', [
    check('account', 'El número de cuenta es obligatorio').not().isEmpty(),
    check('account').custom(accountNoExiste),
    check('password', 'La contraseña debe ser de más de 6 caracteres').isLength({min: 6}),
    validarCampos
], async (req, res) => {
    const {account, password} = req.body;

    try {
        
        // Indica los datos que se requerirán
        const usuario = await prisma.subjects.findFirst({where: {user_account: account},
        select:{
            user_id: true,
            user_name: true,
            user_account: true,
            user_email: true,
            user_password: true,
            user_role: true
        }});

        // Verificar si el número de cuenta existe
        if(!usuario){
            return res.status(400).json({
                msg: 'Número de cuenta o de empleado no es correcto'
            });
        }

        // Verificar la contraseña                  Puede que truene
        /*const user_password = bcrypt.(usuario.user_id);
        console.log(user_password);
        const validPassword = bcrypt.compareSync(password, user_password);*/
        if(!bcrypt.compareSync(password, usuario.user_password)) {
            return res.status(400).json({
                msg: 'Contraseña no es correcta'
            });
        }

        // Generar el JWT               Puede que truene
        const token = await generarJWT( usuario.user_id );
        console.log(usuario);
        console.log(token);
        console.log("Successful signup");
        return res.json({
            usuario,
            token
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            msg: 'Comuníquese con el administrador'
        });
    }
});

router.get('/', [
    validarJWT
], validarTokenUsuario);

export default router;
