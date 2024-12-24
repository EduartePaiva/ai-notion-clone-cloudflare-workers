import { verify } from 'hono/jwt';

export async function verifyClerkSessionToken(
	bearerToken: string | undefined,
	CLERK_JWT_KEY: string,
	CORS_ORIGIN: string
): Promise<{ error: string | null }> {
	if (bearerToken === undefined) return { error: 'undefined Authorization header' };
	const splitToken = bearerToken.split(' ');
	if (splitToken.length !== 2) return { error: 'Invalid Authorization header' };
	const token = splitToken[1];

	try {
		const decoded = await verify(token, CLERK_JWT_KEY, 'RS256');
		if (decoded.exp === undefined || decoded.nbf === undefined) {
			return { error: 'Invalid token data' };
		}

		// Validate the token's expiration (exp) and not before (nbf) claims
		const currentTime = Math.floor(Date.now() / 1000);
		if (decoded.exp < currentTime || decoded.nbf > currentTime) {
			return { error: 'Token is expired or not yet valid' };
		}

		// Validate the token's authorized party (azp) claim
		if (decoded.azp && decoded.azp !== CORS_ORIGIN) {
			return { error: "Invalid 'azp' claim" };
		}

		return { error: null };
	} catch (e) {
		console.error(e);
		return { error: 'Invalid token' };
	}
}
