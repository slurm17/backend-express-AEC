import { Router } from 'express';
import * as textoController from '../controllers/textos.controller.js';

const router = Router();

router.get('/', textoController.getTextos);
router.get('/:id', textoController.getTexto);
router.post('/', textoController.createTexto);
router.put('/:id', textoController.updateTexto);
router.delete('/:id', textoController.deleteTexto);

export default router;
