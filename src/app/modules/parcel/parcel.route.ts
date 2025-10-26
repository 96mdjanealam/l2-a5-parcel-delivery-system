import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { 
    createParcelZodSchema, 
    updateParcelZodSchema, 
    deliveryConfirmationZodSchema,
    adminStatusUpdateZodSchema
} from "./parcel.validation";
import { parcelController } from "./parcel.controller";

const router = Router();

// Admin routes
router.get("/", checkAuth("ADMIN"), parcelController.getAllParcel);
router.patch("/status/:id", checkAuth("ADMIN"), validateRequest(adminStatusUpdateZodSchema), parcelController.updateParcelStatus);
router.patch("/block/:id", checkAuth("ADMIN"), validateRequest(updateParcelZodSchema), parcelController.toggleParcelBlock);

// Sender routes
router.get("/me", checkAuth("USER"), parcelController.getMeParcel);
router.post("/", checkAuth("USER"), validateRequest(createParcelZodSchema), parcelController.createParcel);
router.patch("/cancel/:id", checkAuth("USER"), validateRequest(updateParcelZodSchema), parcelController.cancelParcel);
router.get("/status-log/:id", checkAuth("USER"), parcelController.statusLogParcel);

// Receiver routes
router.get("/track/:trackingId", checkAuth("USER"), parcelController.getTrackingParcel);
router.get("/incoming", checkAuth("USER"), parcelController.incomingParcels);
router.get("/history", checkAuth("USER"), parcelController.deliveryHistoryParcel);
router.patch("/return/:id", checkAuth("USER"), validateRequest(updateParcelZodSchema), parcelController.returnParcel);
router.patch("/reschedule/:id", checkAuth("USER"), validateRequest(updateParcelZodSchema), parcelController.rescheduleParcel);
router.patch("/delivered/:id", checkAuth("USER"), validateRequest(deliveryConfirmationZodSchema), parcelController.confirmDeliveryParcel);

export const parcelRoutes = router;