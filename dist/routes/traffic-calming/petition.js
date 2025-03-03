"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const petition_1 = require("@controllers/traffic-calming/petition");
const auth_1 = require("@middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router
    .route('/')
    .get(petition_1.getPetitions)
    .post(petition_1.createPetition);
router
    .route('/:uuid')
    .get(petition_1.getPetition)
    .put(petition_1.updatePetition)
    .delete(petition_1.deletePetition);
exports.default = router;
//# sourceMappingURL=petition.js.map