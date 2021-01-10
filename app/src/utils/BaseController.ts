import { Router } from 'express';

interface BaseController {
    path: string;
    router: Router;
}

export default BaseController;