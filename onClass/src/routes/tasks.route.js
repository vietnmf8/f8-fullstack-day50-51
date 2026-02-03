const express = require("express");
const router = express.Router();
const taskController = require("@/controllers/task.controller");

/* [GET] /api/tasks */
router.get("/", taskController.getAll);

/* [GET] /api/tasks/1 */
router.get("/:id", taskController.getOne);

/* [POST] /api/tasks */
router.post("/", taskController.create);

/* [DELETE] /api/tasks/123 */
router.delete("/", taskController.destroy);

module.exports = router;
