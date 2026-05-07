<?php

/**
 * AtoM-style article create/edit form.
 *
 * Follows AtoM Symfony sfForm conventions:
 *  - sfWidgetForm* widgets for rendering
 *  - sfValidator* validators for server-side validation
 *  - renderRow() used in templates to output label + widget + error together
 *
 * Validation rules (lane 01 contract compliance):
 *  - title:            required, max 1024 chars
 *  - source:           optional, max 512 chars
 *  - url:              optional; when provided must be a valid HTTP(S) URL
 *  - publication_date: optional; when provided must parse as a valid date
 *  - summary:          optional, max 10000 chars
 *  - status:           required; must be one of the allowed status values
 */
class ArticleEditForm extends sfForm
{
    const ALLOWED_STATUSES = [
        QubitHmtArticle::STATUS_DRAFT  => 'Draft',
        QubitHmtArticle::STATUS_ACTIVE => 'Active',
    ];

    public function configure()
    {
        $this->setWidgets([
            'title' => new sfWidgetFormInputText([
                'label' => 'Title',
            ], [
                'class'       => 'form-autocomplete',
                'placeholder' => 'Article headline',
            ]),

            'source' => new sfWidgetFormInputText([
                'label' => 'Source',
            ], [
                'placeholder' => 'News outlet or publication',
            ]),

            'url' => new sfWidgetFormInputText([
                'label' => 'URL',
            ], [
                'type'        => 'url',
                'placeholder' => 'https://example.com/article',
            ]),

            'publication_date' => new sfWidgetFormInputText([
                'label' => 'Publication date',
            ], [
                'placeholder' => 'YYYY-MM-DD',
            ]),

            'summary' => new sfWidgetFormTextarea([
                'label' => 'Summary',
            ], [
                'class' => 'resizable',
                'rows'  => 6,
            ]),

            'status' => new sfWidgetFormSelect([
                'label'   => 'Status',
                'choices' => self::ALLOWED_STATUSES,
            ]),

            // Hidden contract fields preserve existing routing/UI while allowing
            // programmatic submissions to carry validated linkage identifiers.
            'atom_actor_id' => new sfWidgetFormInputHidden(),
            'atom_record_id' => new sfWidgetFormInputHidden(),
            'atom_object_id' => new sfWidgetFormInputHidden(),
        ]);

        $this->setValidators([
            'title' => new sfValidatorString([
                'required'   => true,
                'max_length' => 1024,
                'trim'       => true,
            ], [
                'required'   => 'Title is required.',
                'max_length' => 'Title must not exceed 1024 characters.',
            ]),

            'source' => new sfValidatorString([
                'required'   => false,
                'max_length' => 512,
                'trim'       => true,
            ], [
                'max_length' => 'Source must not exceed 512 characters.',
            ]),

            'url' => new sfValidatorUrl([
                'required' => false,
            ], [
                'invalid' => 'Please enter a valid URL (e.g. https://example.com/article).',
            ]),

            'publication_date' => new sfValidatorDate([
                'required'          => false,
                'date_format'       => '/^(\d{4})-(\d{2})-(\d{2})$/',
                'date_format_error' => 'YYYY-MM-DD',
            ], [
                'bad_format' => 'Please use the date format YYYY-MM-DD.',
                'invalid'    => 'Please enter a valid date.',
            ]),

            'summary' => new sfValidatorString([
                'required'   => false,
                'max_length' => 10000,
                'trim'       => true,
            ], [
                'max_length' => 'Summary must not exceed 10000 characters.',
            ]),

            'status' => new sfValidatorChoice([
                'required' => true,
                'choices'  => array_keys(self::ALLOWED_STATUSES),
            ], [
                'required' => 'Status is required.',
                'invalid'  => 'Please select a valid status.',
            ]),

            'atom_actor_id' => new sfValidatorString([
                'required' => false,
                'trim' => true,
            ]),
            'atom_record_id' => new sfValidatorString([
                'required' => false,
                'trim' => true,
            ]),
            'atom_object_id' => new sfValidatorString([
                'required' => false,
                'trim' => true,
            ]),
        ]);

        $this->validatorSchema->setPostValidator(
            new sfValidatorCallback([
                'callback' => [$this, 'validateLinkageContract'],
            ])
        );

        $this->widgetSchema->setNameFormat('article[%s]');
        $this->widgetSchema->setFormFormatterName('list');
    }

    /**
     * Populate form defaults from an existing QubitHmtArticle instance.
     *
     * @param QubitHmtArticle $article
     */
    public function populateFromArticle(QubitHmtArticle $article)
    {
        $this->setDefaults([
            'title'            => $article->title,
            'source'           => $article->source,
            'url'              => $article->url,
            'publication_date' => $article->publicationDate,
            'summary'          => $article->summary,
            'status'           => $article->status,
            'atom_actor_id'    => $article->atomActorId,
            'atom_record_id'   => $article->atomRecordId,
            'atom_object_id'   => $article->atomObjectId,
        ]);
    }

    /**
     * Apply validated form values to a QubitHmtArticle instance.
     *
     * @param QubitHmtArticle $article
     */
    public function applyToArticle(QubitHmtArticle $article)
    {
        $values = $this->getValues();

        $article->title           = $values['title'];
        $article->source          = $values['source'] ?? '';
        $article->url             = $values['url'] ?: null;
        $article->publicationDate = $values['publication_date'] ?: null;
        $article->summary         = $values['summary'] ?: null;
        $article->status          = $values['status'];
        $article->atomActorId     = $values['atom_actor_id'] ?: null;
        $article->atomRecordId    = $values['atom_record_id'] ?: null;
        $article->atomObjectId    = $values['atom_object_id'] ?: null;
    }

    public function validateLinkageContract($validator, $values)
    {
        $result = QubitHmtArticle::diagnoseLinkage($values);

        if (empty($result['diagnostics'])) {
            return array_merge($values, $result['normalized']);
        }

        $errors = new sfValidatorErrorSchema($validator);

        foreach ($result['diagnostics'] as $diagnostic) {
            $errors->addError(
                new sfValidatorError($validator, $diagnostic['message']),
                $diagnostic['field']
            );
        }

        throw $errors;
    }
}
