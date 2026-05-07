<?php

require_once dirname(__FILE__).'/../lib/model/QubitHmtArticle.php';

function assertSameValue($expected, $actual, $message)
{
    if ($expected !== $actual) {
        throw new Exception(
            sprintf(
                "%s\nExpected: %s\nActual: %s",
                $message,
                var_export($expected, true),
                var_export($actual, true)
            )
        );
    }
}

function assertCountValue($expected, array $values, $message)
{
    assertSameValue($expected, count($values), $message);
}

function assertDiagnosticCode($expectedCode, array $diagnostics, $message)
{
    foreach ($diagnostics as $diagnostic) {
        if ($diagnostic['code'] === $expectedCode) {
            return;
        }
    }

    throw new Exception($message."\nDiagnostics: ".var_export($diagnostics, true));
}

$actorExists = function ($id) {
    return 7 === $id;
};

$recordExists = function ($id) {
    return 42 === $id;
};

$noLinkage = QubitHmtArticle::diagnoseLinkage([], $actorExists, $recordExists);
assertCountValue(0, $noLinkage['diagnostics'], 'Blank linkage payload should be accepted.');
assertSameValue(null, $noLinkage['normalized']['atom_actor_id'], 'Blank actor id should normalize to null.');
assertSameValue(null, $noLinkage['normalized']['atom_record_id'], 'Blank record id should normalize to null.');

$legacyAlias = QubitHmtArticle::diagnoseLinkage([
    'atom_object_id' => '42',
], $actorExists, $recordExists);
assertCountValue(0, $legacyAlias['diagnostics'], 'Legacy atom_object_id alias should remain accepted.');
assertSameValue(42, $legacyAlias['normalized']['atom_record_id'], 'Legacy atom_object_id should normalize to atom_record_id.');
assertSameValue(42, $legacyAlias['normalized']['atom_object_id'], 'Legacy atom_object_id should be preserved after normalization.');

$invalidActor = QubitHmtArticle::diagnoseLinkage([
    'atom_actor_id' => 'abc',
], $actorExists, $recordExists);
assertDiagnosticCode('invalid_link_format', $invalidActor['diagnostics'], 'Non-numeric actor ids should fail deterministically.');

$missingActor = QubitHmtArticle::diagnoseLinkage([
    'atom_actor_id' => '8',
], $actorExists, $recordExists);
assertDiagnosticCode('missing_actor_link_target', $missingActor['diagnostics'], 'Unknown actor ids should report a missing authority record.');

$missingRecord = QubitHmtArticle::diagnoseLinkage([
    'atom_record_id' => '41',
], $actorExists, $recordExists);
assertDiagnosticCode('missing_record_link_target', $missingRecord['diagnostics'], 'Unknown record ids should report a missing archival description.');

$mismatchedAlias = QubitHmtArticle::diagnoseLinkage([
    'atom_record_id' => '42',
    'atom_object_id' => '99',
], $actorExists, $recordExists);
assertDiagnosticCode('record_link_alias_mismatch', $mismatchedAlias['diagnostics'], 'Mismatched legacy and contract record ids should be rejected.');

echo "QubitHmtArticle linkage guardrail tests passed.\n";
