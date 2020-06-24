'use strict';

import { createStarsBackground } from './modules/stars_background.js';
import { game } from "./modules/game.js";



createStarsBackground('stars-bg', 1400, 14);
game.welcome();