import express from 'express';
import { getRandomText, getAllTexts } from '../controllers/textController.js';

const router = express.Router();

router.get('/random', getRandomText);
router.get('/', getAllTexts);

export default router;
