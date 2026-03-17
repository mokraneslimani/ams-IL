const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const annotationController = require("../controllers/annotationController");

router.use(auth);

router.get("/:roomId", annotationController.getAnnotationsByRoom);
router.post("/:roomId", annotationController.createAnnotation);
router.patch("/:roomId/:annotationId", annotationController.updateAnnotation);
router.delete("/:roomId/:annotationId", annotationController.deleteAnnotation);

module.exports = router;
