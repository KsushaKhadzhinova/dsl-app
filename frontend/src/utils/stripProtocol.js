export function stripProtocol(url) {
  return url.replace(/^https?:\/\//, '');
}
