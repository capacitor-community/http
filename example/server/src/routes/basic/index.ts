import Hapi from '@hapi/hapi';
import EmptyRoutes from './empty';
import JsonRoutes from './json';
import StringRoutes from './string';
import NumberRoutes from './number';
import BooleanRoutes from './bool';

const output: Hapi.ServerRoute[] = [];
output.push(...EmptyRoutes, ...JsonRoutes, ...StringRoutes, ...NumberRoutes, ...BooleanRoutes);
export default output;
