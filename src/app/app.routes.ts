import { Routes } from '@angular/router';
import { Root } from './pages/root/root';
import { GamePageComponent } from './pages/game/game';

export const routes: Routes = [
    {
        path: '',
        component: Root
    },
    {
        path: 'game',
        component: GamePageComponent
    }
];
