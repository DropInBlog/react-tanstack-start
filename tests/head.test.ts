import { describe, expect, it } from 'vitest';
import type { RenderedResponse } from '@dropinblog/react-core';
import { getHeadOptions } from '../src/head';

const sample: RenderedResponse = {
  body_html: '<article>hi</article>',
  head_data: {
    title: 'My Post',
    description: 'A great post',
    image: 'https://cdn.example.com/img.png',
    canonical_url: 'https://example.com/blog/my-post',
    rss_url: 'https://example.com/blog/feed',
    css: ['.dib { color: red; }'],
    js: [{ src: 'https://io.dropinblog.com/proxy.js', defer: true }],
    schema: { '@context': 'https://schema.org', '@type': 'Article' },
  },
} as RenderedResponse;

describe('getHeadOptions', () => {
  const head = getHeadOptions({ data: sample, blogBaseUrl: '/blog' });

  it('emits the title as a meta entry so it dedupes against the root title', () => {
    expect(head.title).toBeUndefined();
    expect(head.meta?.[0]).toEqual({ title: 'My Post' });
  });

  it('maps description and social meta', () => {
    const names = head.meta?.map((m) => m.name ?? m.property);
    expect(names).toContain('description');
    expect(names).toContain('og:title');
    expect(names).toContain('og:description');
    expect(names).toContain('og:image');
    expect(names).toContain('twitter:title');
  });

  it('maps canonical and rss links', () => {
    const rels = head.links?.map((l) => l.rel);
    expect(rels).toContain('canonical');
    expect(rels).toContain('alternate');
  });

  it('maps inline css to styles', () => {
    expect(head.styles?.[0]?.children).toContain('color: red');
  });

  it('maps external scripts with a boolean defer', () => {
    const external = head.scripts?.find((s) => s.src?.includes('proxy.js'));
    expect(external).toBeDefined();
    expect(external?.defer).toBe(true);
  });

  it('maps json-ld schema to an inline script', () => {
    const jsonLd = head.scripts?.find((s) => s.type === 'application/ld+json');
    expect(jsonLd?.children).toContain('schema.org');
  });
});
