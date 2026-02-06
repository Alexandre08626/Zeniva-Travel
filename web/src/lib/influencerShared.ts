function hashCode(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36);
}

export function buildInfluencerCode(email: string) {
  return `inf-${hashCode(email.trim().toLowerCase())}`;
}
