"""SYNTHETIC PORTFOLIO ILLUSTRATION. Not the original GSS implementation.

No MCP protocol, AI calls, COBOL execution, filesystem reads, or production
security claims. A proposed tool boundary is illustrated by a bounded lookup.
"""
import json

RULE_ID = "DEMO-REVIEW-RULE"
SYNTHETIC_EXCERPT = '''*> SYNTHETIC PORTFOLIO EXAMPLE. NOT EMPLOYER CODE.
IF HOLD-FLAG = "Y" OR ITEM-COUNT > REVIEW-LIMIT
    MOVE "Y" TO REVIEW-REQUIRED
ELSE
    MOVE "N" TO REVIEW-REQUIRED
END-IF'''


def inspect_synthetic_rule(rule_id):
    """Accept only the one built-in synthetic rule; never resolve a file path."""
    if rule_id != RULE_ID:
        return {"ok": False, "error": "UNKNOWN_SYNTHETIC_RULE"}
    return {
        "ok": True,
        "synthetic": True,
        "rule_id": RULE_ID,
        "source_label": "built-in fictional excerpt; not a real source path",
        "cobol_excerpt": SYNTHETIC_EXCERPT,
    }


if __name__ == "__main__":
    allowed = inspect_synthetic_rule(RULE_ID)
    rejected = inspect_synthetic_rule("UNLISTED-RULE")
    assert allowed["ok"] is True and allowed["synthetic"] is True
    assert 'ITEM-COUNT > REVIEW-LIMIT' in allowed["cobol_excerpt"]
    assert rejected == {"ok": False, "error": "UNKNOWN_SYNTHETIC_RULE"}
    print(json.dumps({"allowed_example": allowed, "unknown_id_example": rejected}, indent=2))
    print("PASS: allowed lookup and unknown-ID rejection (synthetic illustration only)")
