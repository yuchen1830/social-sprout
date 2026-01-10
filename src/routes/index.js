"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const campaign_1 = require("../controllers/campaign");
const router = (0, express_1.Router)();
const campaignController = new campaign_1.CampaignController();
// Campaigns
router.post("/campaigns", (req, res) => campaignController.create(req, res));
router.post("/campaigns/:id/generate", (req, res) => campaignController.generate(req, res));
exports.default = router;
