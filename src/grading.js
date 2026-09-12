export function normalizeSpacing(value) {
  return String(value ?? "")
    .normalize("NFC")
    .trim()
    .replace(/\s+/g, " ");
}

function germanAscii(value) {
  return value
    .toLocaleLowerCase("de-DE")
    .replaceAll("ä", "ae")
    .replaceAll("ö", "oe")
    .replaceAll("ü", "ue")
    .replaceAll("ß", "ss");
}

export function editDistance(left, right) {
  const a = [...left];
  const b = [...right];
  const matrix = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0)
  );

  for (let row = 0; row <= a.length; row += 1) matrix[row][0] = row;
  for (let column = 0; column <= b.length; column += 1) matrix[0][column] = column;

  for (let row = 1; row <= a.length; row += 1) {
    for (let column = 1; column <= b.length; column += 1) {
      const cost = a[row - 1] === b[column - 1] ? 0 : 1;
      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] + cost
      );

      if (
        row > 1 &&
        column > 1 &&
        a[row - 1] === b[column - 2] &&
        a[row - 2] === b[column - 1]
      ) {
        matrix[row][column] = Math.min(
          matrix[row][column],
          matrix[row - 2][column - 2] + cost
        );
      }
    }
  }

  return matrix[a.length][b.length];
}

export function gradeAnswer(input, acceptableAnswers) {
  const submitted = normalizeSpacing(input);
  const answers = acceptableAnswers.map(normalizeSpacing).filter(Boolean);

  if (!submitted) {
    return { status: "incorrect", score: 0, reason: "Enter one answer before checking." };
  }

  if (answers.includes(submitted)) {
    return { status: "correct", score: 1, reason: "Exact spelling and capitalisation." };
  }

  const lowercaseMatch = answers.find(
    (answer) => answer.toLocaleLowerCase("de-DE") === submitted.toLocaleLowerCase("de-DE")
  );
  if (lowercaseMatch) {
    return {
      status: "partial",
      score: 0.75,
      reason: "The letters are right, but capitalisation matters in German."
    };
  }

  const asciiMatch = answers.find(
    (answer) => germanAscii(answer) === germanAscii(submitted)
  );
  if (asciiMatch) {
    return {
      status: "partial",
      score: 0.5,
      reason: "Use the exact German character: ä, ö, ü or ß."
    };
  }

  const nearest = answers
    .map((answer) => ({
      answer,
      distance: editDistance(
        answer.toLocaleLowerCase("de-DE"),
        submitted.toLocaleLowerCase("de-DE")
      )
    }))
    .sort((a, b) => a.distance - b.distance)[0];
  const typoLimit = nearest && nearest.answer.length >= 16 ? 2 : 1;
  if (nearest && nearest.distance <= typoLimit) {
    return {
      status: "partial",
      score: 0.5,
      reason: `${nearest.distance} small spelling ${nearest.distance === 1 ? "difference" : "differences"}.`
    };
  }

  return { status: "incorrect", score: 0, reason: "The answer does not match the required form." };
}
