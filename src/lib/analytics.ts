export function goatCounterEndpoint(
  code: string | undefined,
): `https://${string}.goatcounter.com/count` | undefined {
  const trimmed = code?.trim();
  if (!trimmed) return undefined;
  return `https://${trimmed}.goatcounter.com/count`;
}
