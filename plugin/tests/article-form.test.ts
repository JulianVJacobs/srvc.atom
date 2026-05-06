import { ArticleForm } from '../form/article-form';

describe('ArticleForm', () => {
  describe('validate', () => {
    it('passes when title is provided', () => {
      const result = ArticleForm.validate({ title: 'Test Article' });
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('fails when title is absent', () => {
      const result = ArticleForm.validate({});
      expect(result.valid).toBe(false);
      expect(result.errors.title).toEqual(['Title is required.']);
    });

    it('fails when title is blank whitespace', () => {
      const result = ArticleForm.validate({ title: '   ' });
      expect(result.valid).toBe(false);
      expect(result.errors.title).toEqual(['Title is required.']);
    });

    it('passes when publicationDate is a valid ISO date', () => {
      const result = ArticleForm.validate({ title: 'Test', publicationDate: '2026-04-21' });
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('fails when publicationDate is not a valid ISO date', () => {
      const result = ArticleForm.validate({ title: 'Test', publicationDate: 'not-a-date' });
      expect(result.valid).toBe(false);
      expect(result.errors.publicationDate).toEqual([
        'Publication date must be a valid date (YYYY-MM-DD).',
      ]);
    });

    it('passes when publicationDate is null or empty string', () => {
      expect(ArticleForm.validate({ title: 'Test', publicationDate: null }).valid).toBe(true);
      expect(ArticleForm.validate({ title: 'Test', publicationDate: '' }).valid).toBe(true);
    });

    it('passes when status is a valid value', () => {
      expect(ArticleForm.validate({ title: 'Test', status: 'draft' }).valid).toBe(true);
      expect(ArticleForm.validate({ title: 'Test', status: 'published' }).valid).toBe(true);
    });

    it('fails when status is an unrecognized value', () => {
      const result = ArticleForm.validate({ title: 'Test', status: 'archived' });
      expect(result.valid).toBe(false);
      expect(result.errors.status).toEqual(['Status must be one of: draft, published.']);
    });

    it('accumulates multiple validation errors', () => {
      const result = ArticleForm.validate({ publicationDate: 'bad-date', status: 'archived' });
      expect(result.valid).toBe(false);
      expect(Object.keys(result.errors)).toHaveLength(3);
      expect(result.errors.title).toBeDefined();
      expect(result.errors.publicationDate).toBeDefined();
      expect(result.errors.status).toBeDefined();
    });
  });

  describe('getFormFields', () => {
    it('returns field definitions for all article form fields', () => {
      const fields = ArticleForm.getFormFields();
      const names = fields.map((field) => field.name);
      expect(names).toEqual([
        'title',
        'slug',
        'publicationDate',
        'status',
        'body',
        'linkedClaimIds',
      ]);
    });

    it('marks title as required and others as optional', () => {
      const fields = ArticleForm.getFormFields();
      const titleField = fields.find((field) => field.name === 'title');
      const bodyField = fields.find((field) => field.name === 'body');
      expect(titleField?.required).toBe(true);
      expect(bodyField?.required).toBe(false);
    });

    it('provides select options for the status field', () => {
      const fields = ArticleForm.getFormFields();
      const statusField = fields.find((field) => field.name === 'status');
      expect(statusField?.type).toBe('select');
      expect(statusField?.options).toEqual([
        { value: 'draft', label: 'Draft' },
        { value: 'published', label: 'Published' },
      ]);
    });

    it('provides help text for each field', () => {
      const fields = ArticleForm.getFormFields();
      fields.forEach((field) => {
        expect(typeof field.help).toBe('string');
        expect(field.help!.length).toBeGreaterThan(0);
      });
    });
  });
});
