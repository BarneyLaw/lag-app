"""Import the five Custom ST1 Markdown papers and keys into the app.

Usage: python scripts/build_custom_semester.py "<course>/Custom ST1/Markdown"
The source notes are read-only. Reviewed adaptations below make open paper tasks
fair for exact app grading and replace trivial definite-plural article gaps.
"""
import argparse
import json
import re
from pathlib import Path


UNITS = {
    1: {"A": [0, 4, 3, 4, 1, 0], "B": 3, "C": [1, 1, 3, 2], "D": [4, 3, 2, 3, 2], "E": [3, 4, 1, 3], "reading": 3},
    2: {"A": [3, 4, 3, 4, 3, 2], "B": 4, "C": [4, 3, 1, 3], "D": [4, 3, 3, 4, 4], "E": [4, 3, 3, 3], "reading": 4},
    3: {"A": [2, 4, 3, 4, 1, 2], "B": 3, "C": [2, 1, 2, 1], "D": [4, 2, 2, 4, 2], "E": [3, 2, 4, 2], "reading": 4},
    4: {"A": [4]*6, "B": 4, "C": [4]*4, "D": [4]*5, "E": [4]*4, "reading": 4},
    5: {"A": [2, 4, 3, 4, 1, 3], "B": 4, "C": [1, 1, 2, 1], "D": [4, 2, 3, 4, 4], "E": [3]*4, "reading": 3},
}
SINGULAR_ARTICLES = {
    1: ("___ Buch von Frau Koch ist hier. (bestimmt)", "Das", "Buch is a neuter singular subject: das Buch."),
    3: ("___ Postkarte von Eva ist hier. (bestimmt)", "Die", "Postkarte is a feminine singular subject: die Postkarte."),
    5: ("___ Café in der Stadt ist toll. (bestimmt)", "Das", "Café is a neuter singular subject: das Café."),
}
# Restrict the opening and subject where the paper permits unbounded paraphrases.
QUESTION_STARTS = {
    1: ["Woher", "Sprichst", "Was", "Wie ist"],
    2: ["Was", "Wo", "Wohnen", "Wie viel"],
    3: ["Wie ist", "Wo", "Hast", "Wer"],
    4: ["Isst", "Was", "Wie viel", "Was"],
    5: ["Wie geht", "Welche", "Sammelst", "Wie alt"],
}
SUBJECT_HINTS = {(1, 3): " Use Nora.", (2, 2): " Use Paula.", (2, 4): " Use der Kuchen.", (4, 3): " Use der Salat.", (5, 4): " Use Mara."}
NEGATION_ALTERNATIVES = {
    (2, 4): ["Nein, sie hat keine Brille."],
    (2, 5): ["Nein, er ist nicht süß."],
    (3, 1): ["Nein, sie hat kein Handy."],
    (3, 5): ["Nein, sie ist nicht richtig."],
    (4, 2): ["Nein, sie nimmt nicht die Suppe."],
    (4, 4): ["Nein, es ist nicht scharf."],
    (5, 3): ["Nein, Ben trinkt Kaffee nicht gern.", "Nein, er trinkt nicht gern Kaffee.", "Nein, er trinkt Kaffee nicht gern."],
}
SYNTAX_ALTERNATIVES = {
    (1, 1): ["Jetzt lernen wir Deutsch in Leipzig."],
    (2, 1): ["Heute trinkt Max einen Tee im Café."],
    (2, 2): ["Wir wohnen in Hamburg seit 2024."],
    (2, 3): ["Wo arbeitet jetzt die Kellnerin?"],
    (2, 4): ["Im Sommer sind in Leipzig viele Studierende."],
    (3, 1): ["Seit 2023 leben Leon und Eva in Wien.", "Seit 2023 leben in Wien Eva und Leon.", "Seit 2023 leben in Wien Leon und Eva."],
    (3, 3): ["Die Studentin schreibt einen Brief heute."],
    (4, 1): ["Heute Abend isst im Restaurant Frau Koch."],
    (4, 3): ["Was bestellt heute ihr?"],
    (5, 1): ["Im Sommer fährt nach Berlin Mara."],
    (5, 2): ["Am Wochenende spielt in der Bar die Studentin Klavier."],
    (5, 3): ["Wo trifft heute Abend Ben Freunde?", "Wo trifft Ben Freunde heute Abend?"],
    (5, 4): ["In Singapur leben seit 2024 wir."],
}


def sections(text):
    parts = re.split(r"^## (.+)\n", text, flags=re.M)
    result = {}
    for heading, body in zip(parts[1::2], parts[2::2]):
        key = "reading" if heading.startswith("II.") else re.search(r"\b([A-E]) -", heading)
        if key:
            result[key if isinstance(key, str) else key[1]] = body
    return result


def numbered(text, expected):
    rows = re.findall(r"^(\d+)\. (.*?)(?=^\d+\. |\Z)", text, re.M | re.S)
    assert [int(n) for n, _ in rows] == list(range(1, expected + 1)), rows
    return [body.strip() for _, body in rows]


def first_line(text):
    return text.splitlines()[0]


def keyed(text):
    match = re.match(r"\*\*(.+?)\*\*(?: -)?\s*(.*)", first_line(text))
    assert match, text
    return match[1], match[2]


def build(folder):
    questions = []
    for paper in range(1, 6):
        stem = f"ST1_Practice_{paper:02}"
        source = (folder / f"{stem}.md").read_text(encoding="utf-8-sig")
        key = (folder / f"{stem}_Answers.md").read_text(encoding="utf-8-sig")
        tasks, answers = sections(source), sections(key)

        def add(section, number, unit, prompt, cue, accepted, tip, **extra):
            names = {"A": "Articles", "B": "Conjugation", "C": "Questions", "D": "Negation", "E": "Syntax", "reading": "Reading"}
            ref = f"II.{number}" if section == "reading" else f"I.{section}.{number if number != 'bank' else '1-6'}"
            questions.append(dict(id=f"custom-st1-{paper:02}-{section.lower()}-{number}", unit=unit,
                                  section=names[section], topic=f"Custom ST1 {paper:02}: {names[section]}",
                                  prompt=prompt, cue=cue, answers=accepted, tip=tip,
                                  source=f"Custom ST1/{stem}.md and {stem}_Answers.md, {ref}", **extra))

        for i, (task, solution) in enumerate(zip(numbered(tasks["A"], 6), numbered(answers["A"], 6)), 1):
            answer, tip = keyed(solution)
            cue = first_line(task)
            adapted = i == 6 and paper in SINGULAR_ARTICLES
            if adapted:
                cue, answer, tip = SINGULAR_ARTICLES[paper]
                tip += " Adapted from the paper's plural to test singular gender."
            add("A", i, UNITS[paper]["A"][i-1], "Fill in the article. bestimmt = definite; unbestimmt = indefinite. Write X if no article is needed.",
                cue, ["X", "x"] if answer == "x" else [answer], tip)

        bank = next(line for line in tasks["B"].splitlines() if line.count(" - ") == 7)
        verbs = [keyed(row) for row in numbered(answers["B"], 6)]
        unused = re.search(r"Unused: (.+)", answers["B"])[1]
        add("B", "bank", UNITS[paper]["B"], "Fill all six blanks in order, separated by commas. Use each verb once; two verbs do not fit.",
            "\n".join(f"{i}. {first_line(task)}" for i, task in enumerate(numbered(tasks["B"], 6), 1)),
            [", ".join(answer for answer, _ in verbs)],
            " ".join(f"{i}. {tip}" for i, (_, tip) in enumerate(verbs, 1)) + f" Unused: {unused}",
            context=f"Verb bank: {bank}", answerKind="list")

        for i, (task, solution) in enumerate(zip(numbered(tasks["C"], 4), numbered(answers["C"], 4)), 1):
            answer = first_line(solution)
            cue = re.search(r"Antwort: (.+)", task)[1]
            prompt = first_line(task) + f" Begin with {QUESTION_STARTS[paper][i-1]}." + SUBJECT_HINTS.get((paper, i), "")
            prompt += " Omit any extra names of people addressed. End with a question mark."
            # The original ST1 already asks for exactly 'Woher kommt ihr?'.
            # Keep both source IDs for progress, but never select both together.
            family = {"familyId": "st1-question-origin"} if (paper, i) == (1, 1) else {}
            add("C", i, UNITS[paper]["C"][i-1], prompt, cue, [answer],
                "Match the requested information and pronoun. In a W-question the verb follows the question phrase; a yes/no question starts with the verb.", **family)

        for i, (task, solution) in enumerate(zip(numbered(tasks["D"], 5), numbered(answers["D"], 5)), 1):
            answer, tip = keyed(solution)
            target = re.search(r"\*\*(.+?)\*\*", task)[1]
            prompt = f"Negate {target} with nicht or kein-. Write a complete reply beginning with Nein, and ending with a full stop."
            if (paper, i) == (5, 3):
                prompt += " Negate the preference (gern)."
            add("D", i, UNITS[paper]["D"][i-1], prompt, first_line(task).replace("**", ""),
                [answer, *NEGATION_ALTERNATIVES.get((paper, i), [])], tip)

        for i, (task, solution) in enumerate(zip(numbered(tasks["E"], 4), numbered(answers["E"], 4)), 1):
            opening = re.search(r"\n\s+(.+?) _{3,}", task)[1]
            add("E", i, UNITS[paper]["E"][i-1],
                f"Write the complete sentence beginning with {opening}. Use every block once, conjugate the verb, and include punctuation.",
                first_line(task), [first_line(solution), *SYNTAX_ALTERNATIVES.get((paper, i), [])],
                "The finite verb follows the first sentence element or question phrase. Keep multiword phrases together.")

        profiles = re.findall(r"^### (.+)\n\n(.+)", tasks["reading"], re.M)
        assert len(profiles) == 3
        context = "\n\n".join(f"{name}\n{text}" for name, text in profiles)
        statements = re.findall(r"^\| (\d+)\. (.+?) \|", tasks["reading"], re.M)
        assert len(statements) == 6
        for (number, statement), solution in zip(statements, numbered(answers["reading"], 6)):
            answer, tip = keyed(solution)
            assert all(name in [p[0] for p in profiles] + ["Niemand"] for name in answer.split(", "))
            add("reading", int(number), UNITS[paper]["reading"],
                "Read the profiles. Write all matching names separated by commas, or Niemand if nobody matches.",
                f"Wer {statement[:-1]}?", [answer], tip, context=context,
                familyId=f"custom-st1-{paper:02}-reading", answerKind="name-set")
    assert len(questions) == 130
    return questions


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path, nargs="?", default=Path("src/data/custom-semester.js"))
    args = parser.parse_args()
    content = build(args.source)
    lines = ["// Generated by scripts/build_custom_semester.py from Custom ST1 Markdown papers and keys.",
             "// Reviewed adaptations and accepted alternatives live in that importer.",
             "export const customSemesterQuestions = ["]
    lines.extend("  " + json.dumps(q, ensure_ascii=False) + "," for q in content)
    args.output.write_text("\n".join([*lines, "];", ""]), encoding="utf-8")
    print(f"Imported {len(content)} cards from 5 papers into {args.output}")
