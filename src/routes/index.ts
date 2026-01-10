import { Router } from "express";
import { CampaignController } from "../controllers/campaign";

const router = Router();
const campaignController = new CampaignController();
// Asset Controller
import { AssetController } from "../controllers/asset";
const assetController = new AssetController();

// Campaigns
router.post("/campaigns", (req, res) => campaignController.create(req, res));
router.post("/campaigns/:id/generate", (req, res) => campaignController.generate(req, res));

// Assets
router.post("/assets/upload", (req, res) => assetController.upload(req, res));

export default router;
