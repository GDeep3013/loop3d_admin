const express = require('express');
const multer = require("multer");
const router = express.Router();
const UserController = require('../app/controllers/UserController.js');
const ProjectController = require('../app/controllers/ProjectController.js');
const RoleController = require('../app/controllers/RoleController.js');

const upload = multer({
  limits: { fieldSize: 1115 * 1024 * 1024 },
});

//user controller Routes
router.post('/register', UserController.registerUser);
//user controller Routes
router.post('/login', UserController.loginUser);
router.get('/fetch-user', UserController.fetchUsers);
router.delete('/delete-user/:id', UserController.deleteUsers);
router.get('/show-user/:id', UserController.showUser);
// router.post('/update-user/:id', UserController.updateUser);
router.post('/update-user/:id', upload.array("files", 5),UserController.updateUser);

//Role Routes
router.post('/create_role', RoleController.createRole);
router.get('/get-role', RoleController.fetchRole);


//Project controller Routes

// router.post('/project-store', ProjectController.projectStore);
router.post("/project-store", upload.array("files", 5), ProjectController.projectStore);
router.get('/fetch-project', ProjectController.fetchProject);
router.get('/show-project/:id', ProjectController.showProject);
router.delete('/delete-project/:id', ProjectController.deleteProject);
router.post("/update-project/:id", upload.array("files", 5), ProjectController.updateProject);
router.post('/forget_password', UserController.forgetPassword);
router.post('/reset-password', UserController.resetPassword);


//createCategory Routes



module.exports = router;
