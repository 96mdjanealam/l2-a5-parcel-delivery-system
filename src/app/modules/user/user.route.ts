import { Router } from "express";
import { userController } from "./user.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { createUserZodSchema, updatedUserZodSchema } from "./user.validation";

const router = Router();

router.get("/all-user", checkAuth("Admin"), userController.allGetUser);
router.get("/get-me", checkAuth("Admin", "Sender", "Receiver"), userController.getMeUser);
router.post("/register", validateRequest(createUserZodSchema), userController.createUser);
router.get("/:id", checkAuth("Admin"), userController.getSingleUser);
router.patch("/:id", checkAuth("Admin", "Sender", "Receiver"), validateRequest(updatedUserZodSchema), userController.userUpdate);

export const userRoutes = router;