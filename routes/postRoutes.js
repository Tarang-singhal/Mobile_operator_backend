const express = require("express");
const postController = require("./../controllers/postController");
const router = express.Router();

router.post(
  "/", postController.uploadPhoto , postController.resizePhoto , postController.createPost
);
module.exports = router;