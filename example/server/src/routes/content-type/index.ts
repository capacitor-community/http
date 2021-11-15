import Hapi from '@hapi/hapi';
import JsonRoutes from './json';
import PlaintextRoutes from './plaintext';
import MultipartFormRoutes from './multipart-form';
import ImageRoutes from './image';
import OctetStreamRoutes from './octet-stream';
import PdfRoutes from './pdf';
import VideoRoutes from './video';
import XmlRoutes from './xml';
import ZipRoutes from './zip';

const output: Hapi.ServerRoute[] = [];
output.push(...JsonRoutes, ...PlaintextRoutes, ...ImageRoutes, ...OctetStreamRoutes, ...PdfRoutes, ...VideoRoutes, ...ZipRoutes, ...MultipartFormRoutes, ...XmlRoutes);
export default output;
