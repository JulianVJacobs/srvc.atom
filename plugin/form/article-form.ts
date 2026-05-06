export interface ArticleFormInput {
  title?: string;
  slug?: string | null;
  body?: string | null;
  publicationDate?: string | null;
  status?: string;
  linkedClaimIds?: string[];
}

export interface ArticleFormValidationResult {
  valid: boolean;
  errors: Record<string, string[]>;
}

export interface ArticleFormFieldOption {
  value: string;
  label: string;
}

export interface ArticleFormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'select' | 'hidden';
  required: boolean;
  help?: string;
  options?: ArticleFormFieldOption[];
}

const VALID_STATUSES = ['draft', 'published'] as const;

type ArticleStatus = (typeof VALID_STATUSES)[number];

const isValidStatus = (value: string): value is ArticleStatus =>
  (VALID_STATUSES as readonly string[]).includes(value);

const isValidDate = (value: string): boolean =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));

export class ArticleForm {
  static validate(input: ArticleFormInput): ArticleFormValidationResult {
    const errors: Record<string, string[]> = {};

    if (!input.title?.trim()) {
      errors.title = ['Title is required.'];
    }

    if (
      input.publicationDate !== undefined &&
      input.publicationDate !== null &&
      input.publicationDate.trim() !== '' &&
      !isValidDate(input.publicationDate.trim())
    ) {
      errors.publicationDate = ['Publication date must be a valid date (YYYY-MM-DD).'];
    }

    if (input.status !== undefined && !isValidStatus(input.status)) {
      errors.status = [`Status must be one of: ${VALID_STATUSES.join(', ')}.`];
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }

  static getFormFields(): ArticleFormField[] {
    return [
      {
        name: 'title',
        label: 'Title',
        type: 'text',
        required: true,
        help: 'The title of the article as it appears in the media source.',
      },
      {
        name: 'slug',
        label: 'Slug',
        type: 'text',
        required: false,
        help: 'A URL-safe identifier for this article. Leave blank to auto-generate.',
      },
      {
        name: 'publicationDate',
        label: 'Publication date',
        type: 'date',
        required: false,
        help: 'The date the article was published (YYYY-MM-DD).',
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        required: false,
        help: 'Publication status of this article.',
        options: [
          { value: 'draft', label: 'Draft' },
          { value: 'published', label: 'Published' },
        ],
      },
      {
        name: 'body',
        label: 'Body',
        type: 'textarea',
        required: false,
        help: 'The full article text or summary.',
      },
      {
        name: 'linkedClaimIds',
        label: 'Linked claim IDs',
        type: 'text',
        required: false,
        help: 'Comma-separated list of claim IDs this article is linked to.',
      },
    ];
  }
}
