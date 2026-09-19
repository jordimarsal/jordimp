import { buildLlmsFullTxt } from '../lib/llms';
import { llmsData } from './llms.txt';

export const prerender = true;

export function GET(): Response {
  return new Response(buildLlmsFullTxt(llmsData()), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
