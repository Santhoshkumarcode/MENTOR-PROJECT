import express from "express"
import mentorCltr from "../controllers/mentor-cltr.js";

import { authentication } from "../middlewares/authentication.js";

const router = express.Router()

router.post('/mentors', authentication, mentorCltr.createMentor)
router.put('/mentors/:id', authentication, mentorCltr.updateMentor)
router.get('/mentors/all', mentorCltr.getAll)
router.get('/mentors/', mentorCltr.getVerified)
router.get('/mentors/:id',mentorCltr.getProfile)

export default router