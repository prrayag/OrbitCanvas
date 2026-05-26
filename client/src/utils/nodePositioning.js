/**
 * Calculate radial positions for child nodes around a parent node.
 * Children are distributed in an arc below the parent.
 *
 * @param {{ x: number, y: number }} parentPosition - Parent node center
 * @param {number} childCount - Number of children to position (default 4)
 * @param {number} radius - Distance from parent center (default 280)
 * @returns {Array<{ x: number, y: number }>} Child positions
 */
export function calculateChildPositions(parentPosition, childCount = 4, radius = 280) {
  const arcSpread = Math.PI * 0.7; // ~126 degrees
  const centerAngle = Math.PI / 2; // straight down
  const startAngle = centerAngle - arcSpread / 2;

  const positions = [];
  for (let i = 0; i < childCount; i++) {
    const t = childCount > 1 ? i / (childCount - 1) : 0.5;
    const angle = startAngle + arcSpread * t;
    positions.push({
      x: parentPosition.x + radius * Math.cos(angle) - 100, // offset for node width
      y: parentPosition.y + radius * Math.sin(angle) + 60,  // offset below parent
    });
  }

  return positions;
}

/**
 * Generate a unique node ID.
 */
export function generateNodeId() {
  return `node-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Generate a unique edge ID.
 */
export function generateEdgeId() {
  return `edge-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Random user colors for multiplayer cursors.
 */
const USER_COLORS = [
  '#ff4d2d', '#00d4ff', '#22c55e', '#a855f7',
  '#f59e0b', '#ec4899', '#06b6d4', '#84cc16',
];

export function getRandomUserColor() {
  return USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
}

/**
 * Generate a random anonymous username.
 */
const ADJECTIVES = ['Cosmic', 'Stellar', 'Nebula', 'Quantum', 'Astral', 'Solar', 'Lunar', 'Orbital'];
const NOUNS = ['Voyager', 'Pioneer', 'Explorer', 'Navigator', 'Pilot', 'Ranger', 'Scout', 'Drifter'];

export function getRandomUserName() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adj} ${noun}`;
}
