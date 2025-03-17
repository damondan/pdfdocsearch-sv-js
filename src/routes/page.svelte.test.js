import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/svelte';
import Page from './+page.svelte';

console.log('Test file loaded');
console.log('Environment:', process.env.VITEST_POOL_ID === '1' ? 'jsdom/client' : 'node/server');
describe('/+page.svelte', () => {
  test('should render h1', () => {
    console.log('Running test for +page.svelte');
    const { container } = render(Page);
    console.log('Rendered HTML:', container.innerHTML);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });
});

