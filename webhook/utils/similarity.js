function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function calculateSimilarity(a, b) {
  if (a.length !== b.length) return 0;

  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

  if (normA === 0 || normB === 0) return 0;

  return dot / (normA * normB);
}

function listingSimilarity(oldVectors, newVectors) {
  const sims = [];
  for (const a of newVectors) {
    for (const b of oldVectors) {
      sims.push(cosineSimilarity(a, b));
    }
  }
  sims.sort((a, b) => b - a);
  // Average top 3 similarities or fewer if less available
  const topSims = sims.slice(0, 3);
  const averageSim = topSims.reduce((acc, val) => acc + val, 0) / topSims.length;
  return averageSim;
}

module.exports = { cosineSimilarity, listingSimilarity, calculateSimilarity };
